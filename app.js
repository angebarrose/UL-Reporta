const AppState = {
  currentUser: null,
  isAccessibleMode: false,
  currentPage: 'login',
  reports: [],
  pqrs: [],
  reportDraft: null,
};

let selectedCategory = null;
let selectedPQRSType = null;
let editingItemId = null; 
let onModalConfirmCallback = null;



function showToast(message) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function showAppModal(title, text, isConfirm, onConfirm) {
  const overlay = document.getElementById('app-modal-overlay');
  const titleElem = document.getElementById('app-modal-title');
  const textElem = document.getElementById('app-modal-text');
  const cancelBtn = document.getElementById('app-modal-cancel');
  
  if(!overlay || !titleElem || !textElem) return;

  titleElem.textContent = title;
  textElem.textContent = text;
  onModalConfirmCallback = onConfirm;

  if (isConfirm) {
    cancelBtn.classList.remove('hidden');
  } else {
    cancelBtn.classList.add('hidden');
  }

  overlay.classList.remove('hidden');
}

function closeAppModal() {
  const overlay = document.getElementById('app-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
  onModalConfirmCallback = null;
}



function loadState() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) AppState.currentUser = JSON.parse(savedUser);

  if (localStorage.getItem('accessibleMode') === 'true') {
    AppState.isAccessibleMode = true;
    document.body.classList.add('accessible-mode');
  }

  const reports = localStorage.getItem('reports');
  if (reports) AppState.reports = JSON.parse(reports);

  const pqrs = localStorage.getItem('pqrs');
  if (pqrs) AppState.pqrs = JSON.parse(pqrs);

  const draft = localStorage.getItem('reportDraft');
  if (draft) AppState.reportDraft = JSON.parse(draft);
}

function saveState() {
  if (AppState.currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(AppState.currentUser));
  } else {
    localStorage.removeItem('currentUser');
  }
  localStorage.setItem('accessibleMode', AppState.isAccessibleMode);
  localStorage.setItem('reports', JSON.stringify(AppState.reports));
  localStorage.setItem('pqrs', JSON.stringify(AppState.pqrs));
  if (AppState.reportDraft) {
    localStorage.setItem('reportDraft', JSON.stringify(AppState.reportDraft));
  } else {
    localStorage.removeItem('reportDraft');
  }
}

function navigate(page) {
  AppState.currentPage = page;
  editingItemId = null;


  document.querySelectorAll('.page').forEach(sec => sec.classList.add('hidden'));

  let currentSectionId = 'view-login';
  if (page === 'dashboard') currentSectionId = 'view-dashboard';
  else if (page === 'create-report') currentSectionId = 'view-create-report';
  else if (page === 'tracking') currentSectionId = 'view-tracking';
  else if (page === 'pqrs') currentSectionId = 'view-pqrs';
  else if (page === 'profile') currentSectionId = 'view-profile';

  const activeSection = document.getElementById(currentSectionId);
  if (activeSection) activeSection.classList.remove('hidden');

  const bottomNav = document.getElementById('app-bottom-nav');
  const faqBtn = document.getElementById('app-faq-btn');

  if (page === 'login') {
    if (bottomNav) bottomNav.classList.add('hidden');
    if (faqBtn) faqBtn.classList.add('hidden');
  } else {
    if (bottomNav) bottomNav.classList.remove('hidden');
    if (faqBtn) faqBtn.classList.remove('hidden');
    updateBottomNavUI(page);
  }

  if (page === 'create-report') syncCreateReportView();
  else if (page === 'tracking') renderTrackingList();
  else if (page === 'profile') syncProfileView();
  else if (page === 'dashboard') {
    const accessText = document.getElementById('txt-accessibility-mode');
    if (accessText) accessText.textContent = AppState.isAccessibleMode ? 'Modo Normal' : 'Modo Accesible';
  }
}

function updateBottomNavUI(activePage) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    const img = item.querySelector('.nav-icon');
    if (img) img.src = img.dataset.normal;
  });

  const activeBtn = document.querySelector(`.nav-item[data-target="${activePage}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    const img = activeBtn.querySelector('.nav-icon');
    if (img) img.src = img.dataset.active;
  }
}



function syncCreateReportView() {
  const draft = AppState.reportDraft || { category: null, description: '', location: '' };
  
  const descTxt = document.getElementById('description');
  if (descTxt) descTxt.value = draft.description || '';

  const locDisplay = document.getElementById('locationDisplay');
  const locText = document.getElementById('locationText');
  
  if (draft.location) {
    if (locDisplay) locDisplay.classList.remove('hidden');
    if (locText) locText.textContent = draft.location;
  } else {
    if (locDisplay) locDisplay.classList.add('hidden');
    if (locText) locText.textContent = '';
  }

  selectedCategory = draft.category;
  applyCategorySelectionUI();
}

function selectCategory(catName) {
  selectedCategory = catName;
  applyCategorySelectionUI();
  saveDraft();
}

function applyCategorySelectionUI() {
  document.querySelectorAll('#view-create-report .category-btn').forEach(btn => {
    const currentCat = btn.getAttribute('data-category');
    const img = btn.querySelector('.category-img');
    
    if (currentCat === selectedCategory) {
      btn.classList.add('selected');
      if (img) img.src = img.dataset.selected;
    } else {
      btn.classList.remove('selected');
      if (img) img.src = img.dataset.normal;
    }
  });
}

function detectLocation() {
  const locDisplay = document.getElementById('locationDisplay');
  const locText = document.getElementById('locationText');
  if (locDisplay && locText) {
    locDisplay.classList.remove('hidden');
    locText.textContent = 'Campus Central - Edificio B, Piso 2';
  }
  saveDraft();
}

function saveDraft() {
  const desc = document.getElementById('description');
  const loc = document.getElementById('locationText');
  AppState.reportDraft = {
    category: selectedCategory,
    description: desc ? desc.value : '',
    location: loc ? loc.textContent : ''
  };
  saveState();
}

function submitReport() {
  const descElem = document.getElementById('description');
  const desc = descElem ? descElem.value.trim() : '';

  if (!selectedCategory || !desc) {
    showToast('Por favor, completa categoría y descripción');
    return;
  }

  const locText = document.getElementById('locationText');

  AppState.reports.push({
    id: `RPT-${Date.now()}`,
    category: selectedCategory,
    description: desc,
    location: locText ? locText.textContent : 'No especificada',
    date: new Date().toISOString()
  });

  if (descElem) descElem.value = '';
  selectedCategory = null;
  AppState.reportDraft = null;
  localStorage.removeItem('reportDraft');

  saveState();
  showToast('¡Reporte enviado con éxito!');
  navigate('tracking');
}



function renderTrackingList() {
  const container = document.getElementById('requests-list-container');
  const counter = document.getElementById('tracking-counter');
  if (!container) return;

  container.innerHTML = ''; 

  const formattedReports = AppState.reports.map(r => ({ ...r, origin: 'Reporte', title: r.category }));
  const formattedPQRS = AppState.pqrs.map(p => ({ ...p, origin: 'PQRS', title: `${p.type.toUpperCase()}: ${p.subject}` }));
  const combined = [...formattedReports, ...formattedPQRS].sort((x, y) => new Date(y.date) - new Date(x.date));

  if (counter) counter.textContent = `Tienes ${combined.length} registros en total`;

  if (combined.length === 0) {
    const noRecords = document.createElement('div');
    noRecords.className = 'text-center p-4 card';
    const noRecordsTxt = document.createElement('p');
    noRecordsTxt.style.color = '#8E8E93';
    noRecordsTxt.textContent = 'No tienes solicitudes ni reportes registrados aún.';
    noRecords.appendChild(noRecordsTxt);
    container.appendChild(noRecords);
    return;
  }

  combined.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    if (editingItemId === item.id) {
      card.style.border = '2px solid #C8102E';

      const editLabel = document.createElement('div');
      editLabel.style.marginBottom = '12px';
      editLabel.style.fontWeight = '700';
      editLabel.style.fontSize = '13px';
      editLabel.textContent = `✏️ EDITANDO ${item.origin.toUpperCase()}`;
      card.appendChild(editLabel);

      const groupTitle = document.createElement('div');
      groupTitle.className = 'input-group';
      const lblTitle = document.createElement('label');
      lblTitle.className = 'input-label';
      lblTitle.textContent = item.origin === 'Reporte' ? 'Categoría / Título' : 'Asunto';
      const inputTitle = document.createElement('input');
      inputTitle.type = 'text';
      inputTitle.className = 'input';
      inputTitle.value = item.origin === 'Reporte' ? item.category : item.subject;
      inputTitle.id = `inline-edit-title-${item.id}`;
      groupTitle.appendChild(lblTitle);
      groupTitle.appendChild(inputTitle);
      card.appendChild(groupTitle);

      const groupDesc = document.createElement('div');
      groupDesc.className = 'input-group';
      const lblDesc = document.createElement('label');
      lblDesc.className = 'input-label';
      lblDesc.textContent = 'Descripción';
      const areaDesc = document.createElement('textarea');
      areaDesc.className = 'input';
      areaDesc.rows = 3;
      areaDesc.value = item.description;
      areaDesc.id = `inline-edit-desc-${item.id}`;
      groupDesc.appendChild(lblDesc);
      groupDesc.appendChild(areaDesc);
      card.appendChild(groupDesc);

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.gap = '8px';

      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.style.minHeight = '40px';
      saveBtn.textContent = '💾 Guardar';
      saveBtn.onclick = () => saveInlineEdit(item.id, item.origin);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-secondary';
      cancelBtn.style.minHeight = '40px';
      cancelBtn.textContent = '❌ Cancelar';
      cancelBtn.onclick = () => { editingItemId = null; renderTrackingList(); };

      btnRow.appendChild(saveBtn);
      btnRow.appendChild(cancelBtn);
      card.appendChild(btnRow);
    } else {
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.marginBottom = '12px';

      const tagType = document.createElement('span');
      tagType.style.fontWeight = '700';
      tagType.style.fontSize = '13px';
      tagType.style.color = item.origin === 'Reporte' ? '#C8102E' : '#00875A';
      tagType.textContent = `📌 ${item.origin.toUpperCase()}`;

      const tagDate = document.createElement('span');
      tagDate.style.color = '#8E8E93';
      tagDate.style.fontSize = '13px';
      tagDate.textContent = new Date(item.date).toLocaleDateString();

      topRow.appendChild(tagType);
      topRow.appendChild(tagDate);
      card.appendChild(topRow);

      const h3 = document.createElement('h3');
      h3.style.fontSize = '18px';
      h3.style.marginBottom = '8px';
      h3.textContent = item.title;
      card.appendChild(h3);

      const pDesc = document.createElement('p');
      pDesc.style.color = '#636366';
      pDesc.style.marginBottom = '16px';
      pDesc.style.fontSize = '15px';
      pDesc.textContent = item.description;
      card.appendChild(pDesc);

      const footerRow = document.createElement('div');
      footerRow.style.display = 'flex';
      footerRow.style.justifyContent = 'space-between';
      footerRow.style.alignItems = 'center';
      footerRow.style.borderTop = '1px dashed #E5E5EA';
      footerRow.style.paddingTop = '12px';

      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '16px';

      const editBtn = document.createElement('button');
      editBtn.style.background = 'none'; editBtn.style.border = 'none'; editBtn.style.color = '#C8102E'; editBtn.style.cursor = 'pointer';
      editBtn.textContent = '✏️ Editar';
      editBtn.onclick = () => { editingItemId = item.id; renderTrackingList(); };

      const deleteBtn = document.createElement('button');
      deleteBtn.style.background = 'none'; deleteBtn.style.border = 'none'; deleteBtn.style.color = '#8E8E93'; deleteBtn.style.cursor = 'pointer';
      deleteBtn.textContent = '🗑️ Eliminar';
      deleteBtn.onclick = () => requestDeleteItem(item.id, item.origin);

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      const badge = document.createElement('span');
      badge.className = 'status-badge';
      badge.textContent = item.origin === 'Reporte' ? 'En revisión' : 'Pendiente';

      footerRow.appendChild(actionsDiv);
      footerRow.appendChild(badge);
      card.appendChild(footerRow);
    }

    container.appendChild(card);
  });
}

function saveInlineEdit(id, origin) {
  const tVal = document.getElementById(`inline-edit-title-${id}`).value.trim();
  const dVal = document.getElementById(`inline-edit-desc-${id}`).value.trim();

  if(!tVal || !dVal) {
    showToast('Los campos no pueden quedar vacíos');
    return;
  }

  if (origin === 'Reporte') {
    const idx = AppState.reports.findIndex(r => r.id === id);
    if(idx !== -1) { AppState.reports[idx].category = tVal; AppState.reports[idx].description = dVal; }
  } else {
    const idx = AppState.pqrs.findIndex(p => p.id === id);
    if(idx !== -1) { AppState.pqrs[idx].subject = tVal; AppState.pqrs[idx].description = dVal; }
  }

  saveState();
  editingItemId = null;
  showToast('¡Cambios guardados correctamente!');
  renderTrackingList();
}

function requestDeleteItem(id, origin) {
  showAppModal(
    'Eliminar registro', 
    `¿Estás completamente seguro de que deseas eliminar este ${origin.toLowerCase()}? Esta acción no se puede deshacer.`,
    true, 
    () => {
      if (origin === 'Reporte') {
        AppState.reports = AppState.reports.filter(r => r.id !== id);
      } else {
        AppState.pqrs = AppState.pqrs.filter(p => p.id !== id);
      }
      saveState();
      showToast('Registro eliminado con éxito');
      renderTrackingList();
    }
  );
}



function selectPQRSType(type) {
  selectedPQRSType = type;
  document.querySelectorAll('.pqrs-type-btn').forEach(btn => {
    btn.classList.remove('selected');
    const img = btn.querySelector('.pqrs-icon');
    if (img) img.src = img.dataset.normal;
  });

  const activeBtn = document.getElementById(`pqrs-${type}`);
  if (activeBtn) {
    activeBtn.classList.add('selected');
    const img = activeBtn.querySelector('.pqrs-icon');
    if (img) img.src = img.dataset.selected;
  }
}

function submitPQRS() {
  const subjectElem = document.getElementById('pqrsSubject');
  const descElem = document.getElementById('pqrsDescription');

  const subject = subjectElem ? subjectElem.value.trim() : '';
  const desc = descElem ? descElem.value.trim() : '';

  if (!selectedPQRSType || !subject || !desc) {
    showToast('Completa todos los campos obligatorios de la PQRS');
    return;
  }

  AppState.pqrs.push({
    id: `PQRS-${Date.now()}`,
    type: selectedPQRSType,
    subject: subject,
    description: desc,
    status: 'pendiente',
    date: new Date().toISOString()
  });

  if (subjectElem) subjectElem.value = '';
  if (descElem) descElem.value = '';
  selectedPQRSType = null;
  document.querySelectorAll('.pqrs-type-btn').forEach(btn => btn.classList.remove('selected'));

  saveState();
  showToast('¡PQRS Radicada con éxito! ✉️');
  navigate('tracking');
}



function syncProfileView() {
  const emailDisplay = document.getElementById('profileEmail');
  const nameInput = document.getElementById('profileName');
  const phoneInput = document.getElementById('profilePhone');

  if (AppState.currentUser) {
    if (emailDisplay) emailDisplay.value = AppState.currentUser.email || '';
    if (nameInput) nameInput.value = AppState.currentUser.name || '';
    if (phoneInput) phoneInput.value = AppState.currentUser.phone || '';
  }
}

function saveProfileData() {
  const nameVal = document.getElementById('profileName').value.trim();
  const emailVal = document.getElementById('profileEmail').value.trim();
  const phoneVal = document.getElementById('profilePhone').value.trim();

  if (!nameVal || !emailVal) {
    showToast('El nombre y correo no pueden quedar vacíos');
    return;
  }

  AppState.currentUser.name = nameVal;
  AppState.currentUser.email = emailVal;
  AppState.currentUser.phone = phoneVal;

  saveState();
  showToast('¡Datos de perfil actualizados correctamente!');
  navigate('dashboard');
}

function toggleAccessibleMode() {
  AppState.isAccessibleMode = !AppState.isAccessibleMode;
  document.body.classList.toggle('accessible-mode');
  
  const accessText = document.getElementById('txt-accessibility-mode');
  if (accessText) accessText.textContent = AppState.isAccessibleMode ? 'Modo Normal' : 'Modo Accesible';

  saveState();
}

function showFAQ() {
  showAppModal('Preguntas frecuentes', '• ¿Cómo crear un reporte?\nSelecciona una categoría y describe el problema.\n\n• ¿Cómo hago seguimiento?\nVe a la pestaña Mis Reportes e Historial.\n\n• ¿Cómo enviar PQRS?\nCompleta los campos y presiona enviar.', false, null);
}

function confirmLogout() {
  showAppModal('Cerrar sesión', '¿Estás seguro de que deseas salir del sistema?', true, () => {
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    navigate('login');
  });
}



document.addEventListener('DOMContentLoaded', () => {
  loadState();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorDiv = document.getElementById('loginError');

      if(errorDiv) errorDiv.classList.add('hidden');

      if (password.length < 4) {
        if(errorDiv) errorDiv.classList.remove('hidden');
        return;
      }

      AppState.currentUser = {
        email: email,
        name: email.split('@')[0],
        phone: '3001234567'
      };

      saveState();
      navigate('dashboard');
    });
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.getAttribute('data-target'));
    });
  });

  document.getElementById('btn-goto-create')?.addEventListener('click', () => navigate('create-report'));
  document.getElementById('btn-goto-tracking')?.addEventListener('click', () => navigate('tracking'));
  document.getElementById('btn-toggle-accessibility')?.addEventListener('click', toggleAccessibleMode);

  document.querySelectorAll('#view-create-report .category-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.getAttribute('data-category')));
  });
  document.querySelectorAll('.pqrs-type-btn').forEach(btn => {
    btn.addEventListener('click', () => selectPQRSType(btn.getAttribute('data-pqrs')));
  });

  document.getElementById('btn-detect-location')?.addEventListener('click', detectLocation);
  document.getElementById('btn-submit-report')?.addEventListener('click', submitReport);
  document.getElementById('btn-submit-pqrs')?.addEventListener('click', submitPQRS);
  document.getElementById('btn-save-profile')?.addEventListener('click', saveProfileData);
  document.getElementById('btn-logout')?.addEventListener('click', confirmLogout);
  document.getElementById('app-faq-btn')?.addEventListener('click', showFAQ);

  document.getElementById('app-modal-cancel')?.addEventListener('click', closeAppModal);
  document.getElementById('app-modal-confirm')?.addEventListener('click', () => {
    if (onModalConfirmCallback) onModalConfirmCallback();
    closeAppModal();
  });

  navigate(AppState.currentUser ? 'dashboard' : 'login');
});
