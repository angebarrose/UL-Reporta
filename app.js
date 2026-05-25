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
let editingItemId = null; // Guarda el ID del reporte o PQRS que se está editando actualmente

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
  }
}

function navigate(page) {
  AppState.currentPage = page;
  editingItemId = null; // Limpia el estado de edición al cambiar de pestaña
  renderPage();
}

function renderPage() {
  const app = document.getElementById('app');

  switch(AppState.currentPage){
    case 'login':
      app.innerHTML = renderLogin();
      attachLoginListener();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboard();
      break;
    case 'create-report':
      app.innerHTML = renderCreateReport();
      break;
    case 'tracking':
      app.innerHTML = renderTracking();
      break;
    case 'pqrs':
      app.innerHTML = renderPQRS();
      break;
    case 'profile':
      app.innerHTML = renderProfile();
      break;
  }

  /* Mostrar FAQ en todas menos login */
  if(AppState.currentPage !== 'login'){
    app.innerHTML += `
      <button class="faq-floating-btn" onclick="showFAQ()">
        <img src="imagenes/19.png" class="faq-icon" alt="Preguntas frecuentes">
      </button>
    `;
  }
}

function renderLogin() {
  const a = AppState.isAccessibleMode;
  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'}; padding: 48px 24px;">
      <div class="text-center mb-4">
        <div style="width: 96px; height: 96px; background: #C8102E; border-radius: 24px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 40px; font-weight: bold;">UL</span>
        </div>
        <h1 style="font-size: ${a ? '32px' : '28px'}; font-weight: 700; margin-bottom: 8px; color: ${a ? 'white' : '#1C1C1E'};">UL-Reporta</h1>
        <p style="color: ${a ? '#E5E5EA' : '#8E8E93'}; font-size: ${a ? '18px' : '16px'};">
          Inicia sesión para reportar problemas<br>de accesibilidad
        </p>
      </div>

      <form id="loginForm" style="margin-top: 32px;">
        <div class="input-group">
          <label class="input-label">Correo institucional</label>
          <input type="email" id="email" class="input" placeholder="ejemplo@unlibre.edu.co" required />
        </div>

        <div class="input-group">
          <label class="input-label">Contraseña</label>
          <input type="password" id="password" class="input" placeholder="••••••••" required />
        </div>

        <div id="loginError" class="alert hidden">
          <span>⚠️</span>
          <p class="alert-text"></p>
        </div>

        <button type="submit" class="btn btn-primary btn-rounded">Iniciar sesión</button>
      </form>

      <p class="text-center mt-3" style="color: #8E8E93; font-size: 12px;">
        Demo: Cualquier email y contraseña (mín. 4 caracteres)
      </p>
    </div>
  `;
}

function attachLoginListener() {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.classList.add('hidden');

    if (!email || !password) {
      errorDiv.querySelector('.alert-text').textContent = 'Completa todos los campos';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (password.length < 4) {
      errorDiv.querySelector('.alert-text').textContent = 'Contraseña mínimo 4 caracteres';
      errorDiv.classList.remove('hidden');
      return;
    }

    AppState.currentUser = {
      email: email,
      name: email.split('@')[0],
      phone: '3001234567'
    };

    selectedCategory = null;
    AppState.reportDraft = null;
    localStorage.removeItem('reportDraft');

    saveState();
    navigate('dashboard');
  });
}

function renderDashboard() {
  const a = AppState.isAccessibleMode;
  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'}; padding: 48px 24px;">
      <div class="text-center mb-4">
        <h1 style="font-size: ${a ? '32px' : '24px'}; font-weight: 600; color: ${a ? 'white' : '#1C1C1E'};">
          UL-Reporta
        </h1>
        <p style="color: ${a ? '#E5E5EA' : '#8E8E93'};">
          Haz que tu universidad sea más accesible
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <button onclick="navigate('create-report')" class="btn btn-primary dashboard-btn">
          <img src="imagenes/7.png" class="dashboard-icon">
          Crear Reporte
        </button>

        <button onclick="navigate('tracking')" class="btn btn-secondary dashboard-btn">
          <img src="imagenes/8.png" class="dashboard-icon">
          Mis Reportes e Historial
        </button>

        <button onclick="toggleAccessibleMode()" class="btn btn-tertiary dashboard-btn">
          <img src="imagenes/9.png" class="dashboard-icon">
          ${a ? 'Modo Normal' : 'Modo Accesible'}
        </button>
      </div>
    </div>
    ${renderBottomNav('dashboard')}
  `;
}

function renderCreateReport() {
  const a = AppState.isAccessibleMode;
  const draft = AppState.reportDraft || { category: null, description: '', location: '' };

  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'};">
      <h1 style="font-size: ${a ? '32px' : '24px'}; font-weight: 600; color: ${a ? 'white' : '#1C1C1E'}; margin-bottom: 24px;">Crear Reporte</h1>

      <h2 style="font-size: ${a ? '24px' : '16px'}; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">1. Categoría</h2>
        <div class="category-grid">
        ${[
          { name:"Infraestructura", img:"1.png", selectedImg:"1.1.png" },
          { name:"Rampas",          img:"2.png", selectedImg:"2.1.png" },
          { name:"Ascensor",         img:"3.png", selectedImg:"3.1.png" },
          { name:"Iluminación",     img:"4.png", selectedImg:"4.1.png" },
          { name:"Baños",            img:"5.png", selectedImg:"5.1.png" },
          { name:"Señalización",    img:"6.png", selectedImg:"6.1.png" }
        ].map(cat => {
          // Genera la ruta correcta de manera automática para GitHub Pages
          const imgUrl = `./imagenes/${cat.img}`;
          const selectedImgUrl = `./imagenes/${cat.selectedImg}`;
  
  // Aquí continúas con tu código de retorno HTML usando las nuevas constantes
  return `
    <div class="category-item">
      <img src="${imgUrl}" data-selected="${selectedImgUrl}">
      <span>${cat.name}</span>
    </div>
  `;
})}

          <button class="category-btn ${draft.category === cat.name ? 'selected' : ''}" onclick="selectCategory('${cat.name}')">
            <img src="${draft.category === cat.name ? cat.selectedImg : cat.img}" class="category-img" data-normal="${cat.img}" data-selected="${cat.selectedImg}">
            <span>${cat.name}</span>
          </button>
        `).join('')}
        </div>

      <h2 style="font-size: ${a ? '24px' : '16px'}; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">2. Descripción</h2>
      <textarea id="description" class="input mb-3" rows="${a ? 6 : 4}" placeholder="Describe el problema..." style="border-radius: 24px;" oninput="saveDraft()">${draft.description}</textarea>

      <h2 style="font-size: ${a ? '24px' : '16px'}; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">3. Ubicación</h2>
      <button onclick="detectLocation()" class="btn btn-secondary mb-3" style="border-radius: 16px;">📍 Detectar Ubicación</button>
      <div id="locationDisplay" class="${draft.location ? '' : 'hidden'}" style="padding: 16px; background: ${a ? '#1C1C1E' : 'white'}; border: 2px solid ${a ? 'white' : '#E5E5EA'}; border-radius: 16px; margin-bottom: 24px;">
        <span id="locationText">${draft.location}</span>
      </div>

      <button onclick="submitReport()" class="btn btn-primary" style="border-radius: 16px; font-size: ${a ? '24px' : '16px'}; min-height: ${a ? '72px' : '64px'};">Enviar Reporte</button>
    </div>
    ${renderBottomNav('create-report')}

    <div id="errorModal" class="modal-overlay" onclick="closeErrorModal()">
      <div class="bottom-sheet" onclick="event.stopPropagation()">
        <div class="bottom-sheet-handle"></div>
        <h3 style="font-size: 20px; margin-bottom: 16px;">Campos incompletos</h3>
        <p style="color: #8E8E93; margin-bottom: 24px;">Completa categoría y descripción</p>
        <button onclick="closeErrorModal()" class="btn btn-primary btn-rounded">Entendido</button>
      </div>
    </div>
  `;
}

/* HISTORIAL COMPLETO: Combina registros con acciones de Editar y Eliminar */
function renderTracking() {
  const a = AppState.isAccessibleMode;

  // Unificamos y estructuramos Reportes
  const formattedReports = AppState.reports.map(r => ({
    id: r.id,
    date: r.date,
    itemType: 'Reporte',
    editableTitle: r.category,
    description: r.description,
    badgeText: 'En revisión',
    badgeColor: '#FFF9E6',
    badgeTextColor: '#D4AF37'
  }));

  // Unificamos y estructuramos PQRS
  const formattedPQRS = AppState.pqrs.map(p => ({
    id: p.id,
    date: p.date,
    itemType: 'PQRS',
    editableTitle: p.subject, 
    rawType: p.type,
    description: p.description,
    badgeText: p.status.charAt(0).toUpperCase() + p.status.slice(1),
    badgeColor: '#E6F0FA',
    badgeTextColor: '#0056B3'
  }));

  // Orden cronológico
  const combinedList = [...formattedReports, ...formattedPQRS].sort((x, y) => new Date(y.date) - new Date(x.date));

  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'};">
      <h1 style="font-size: ${a ? '32px' : '24px'}; font-weight: 600; color: ${a ? 'white' : '#1C1C1E'}; margin-bottom: 8px;">Mis Solicitudes</h1>
      <p style="color: ${a ? '#E5E5EA' : '#8E8E93'}; margin-bottom: 24px;">Tienes ${combinedList.length} registros en total</p>

      ${combinedList.length === 0 ? `
        <div class="text-center" style="padding: 48px 24px; background: ${a ? '#1C1C1E' : 'white'}; border-radius: 24px;">
          <p style="color: #8E8E93; font-size: 16px;">No tienes solicitudes ni reportes registrados aún.</p>
        </div>
      ` : combinedList.map(item => {
          const isEditing = editingItemId === item.id;
          const labelColor = a ? '#ffffff' : (item.itemType === 'Reporte' ? '#C8102E' : '#00875A');
          
          // MODO FORMULARIO DE EDICIÓN
          if (isEditing) {
            return `
              <div class="card" style="border: 2px solid #C8102E;">
                <div style="margin-bottom: 12px;">
                  <span style="color: ${labelColor}; font-weight: 700; font-size: 13px;">✏️ EDITANDO ${item.itemType.toUpperCase()}</span>
                </div>
                
                <div class="input-group" style="margin-bottom: 12px;">
                  <label class="input-label" style="font-size: 12px;">${item.itemType === 'Reporte' ? 'Categoría / Título' : 'Asunto'}</label>
                  <input type="text" id="editTitle-${item.id}" class="input" value="${item.editableTitle}" style="min-height:44px; padding: 10px;">
                </div>

                <div class="input-group" style="margin-bottom: 16px;">
                  <label class="input-label" style="font-size: 12px;">Descripción</label>
                  <textarea id="editDesc-${item.id}" class="input" rows="3" style="padding: 10px; min-height:80px;">${item.description}</textarea>
                </div>

                <div style="display: flex; gap: 8px;">
                  <button onclick="saveInlineEdit('${item.id}', '${item.itemType}')" class="btn btn-primary" style="min-height:40px; padding:8px; font-size:14px; border-radius:12px;">💾 Guardar</button>
                  <button onclick="cancelInlineEdit()" class="btn btn-secondary" style="min-height:40px; padding:8px; font-size:14px; border-radius:12px; border-color:#8E8E93; color:#8E8E93;">❌ Cancelar</button>
                </div>
              </div>
            `;
          }

          // MODO VISTA TARJETA NORMAL (Con botones de gestión abajo a la izquierda)
          return `
            <div class="card">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
                <span style="color: ${labelColor}; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">📌 ${item.itemType.toUpperCase()}</span>
                <span style="color: #8E8E93; font-size: 13px;">${new Date(item.date).toLocaleDateString()}</span>
              </div>
              
              <h3 style="font-size: 18px; margin-bottom: 8px; color: ${a ? 'white' : '#1C1C1E'};">
                ${item.itemType === 'Reporte' ? item.editableTitle : `${item.rawType ? item.rawType.toUpperCase() : 'PQRS'}: ${item.editableTitle}`}
              </h3>
              
              <p style="color: ${a ? '#E5E5EA' : '#636366'}; margin-bottom: 16px; font-size: 15px; line-height: 1.5;">${item.description}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E5E5EA; padding-top: 12px;">
                <div style="display: flex; gap: 16px;">
                  <button onclick="enableInlineEdit('${item.id}')" style="background:none; border:none; color:#C8102E; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    ✏️ Editar
                  </button>
                  <button onclick="deleteItem('${item.id}', '${item.itemType}')" style="background:none; border:none; color:#8E8E93; font-size:14px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    🗑️ Eliminar
                  </button>
                </div>
                <span class="status-badge" style="background: ${a ? '#2C2C2E' : item.badgeColor}; color: ${a ? '#ffffff' : item.badgeTextColor}; ${a ? 'border: 1px solid white;' : ''}">
                  ${item.badgeText}
                </span>
              </div>
            </div>
          `;
      }).join('')}
    </div>
    ${renderBottomNav('tracking')}
  `;
}

function enableInlineEdit(id) {
  editingItemId = id;
  renderPage();
}

function cancelInlineEdit() {
  editingItemId = null;
  renderPage();
}

function saveInlineEdit(id, type) {
  const updatedTitle = document.getElementById(`editTitle-${id}`).value;
  const updatedDesc = document.getElementById(`editDesc-${id}`).value;

  if (!updatedTitle || !updatedDesc) {
    alert('Los campos no pueden estar vacíos.');
    return;
  }

  if (type === 'Reporte') {
    const index = AppState.reports.findIndex(r => r.id === id);
    if (index !== -1) {
      AppState.reports[index].category = updatedTitle;
      AppState.reports[index].description = updatedDesc;
    }
  } else {
    const index = AppState.pqrs.findIndex(p => p.id === id);
    if (index !== -1) {
      AppState.pqrs[index].subject = updatedTitle;
      AppState.pqrs[index].description = updatedDesc;
    }
  }

  saveState();
  editingItemId = null;
  alert('¡Cambios guardados correctamente!');
  renderPage();
}

/* NUEVA FUNCIÓN: Elimina de forma permanente un elemento por su ID y Tipo */
function deleteItem(id, type) {
  const mensajeConfirmacion = `¿Estás completamente seguro de que deseas eliminar este ${type.toLowerCase()}? Esta acción no se puede deshacer.`;
  
  if (confirm(mensajeConfirmacion)) {
    if (type === 'Reporte') {
      // Filtramos dejando fuera el ID que coincide
      AppState.reports = AppState.reports.filter(r => r.id !== id);
    } else {
      // Filtramos dejando fuera el ID que coincide en las PQRS
      AppState.pqrs = AppState.pqrs.filter(p => p.id !== id);
    }

    saveState(); // Persiste el nuevo listado limpio en LocalStorage
    alert('¡El registro fue eliminado con éxito!');
    renderPage(); // Refresca la pantalla para que desaparezca la tarjeta
  }
}

function renderPQRS() {
  const a = AppState.isAccessibleMode;
  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'};">
      <h1 style="font-size: ${a ? '32px' : '24px'}; font-weight: 600; color: ${a ? 'white' : '#1C1C1E'}; margin-bottom: 24px;">Nueva PQRS</h1>

      <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">1. Tipo</h2>
      <div class="category-grid">
      ${[
        {name:'petición',img:'imagenes/15.png'},
        {name:'queja',img:'imagenes/16.png'},
        {name:'reclamo',img:'imagenes/17.png',active:'imagenes/17.1.png'},
        {name:'sugerencia',img:'imagenes/18.png'}
      ].map(item=>`
        <button class="category-btn" id="pqrs-${item.name}" onclick="selectPQRSType('${item.name}')">
          <img class="pqrs-icon" src="${item.img}" data-normal="${item.img}" data-active="${item.active || item.img}">
          <span>${item.name.charAt(0).toUpperCase()+item.name.slice(1)}</span>
        </button>
      `).join('')}
      </div>

      <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">2. Asunto</h2>
      <input type="text" id="pqrsSubject" class="input mb-3" placeholder="Asunto..." style="border-radius: 24px;" />

      <h2 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: ${a ? 'white' : '#1C1C1E'};">3. Descripción</h2>
      <textarea id="pqrsDescription" class="input mb-4" rows="4" placeholder="Descripción..." style="border-radius: 24px;"></textarea>

      <button onclick="submitPQRS()" class="btn btn-primary" style="border-radius: 16px;">✉️ Enviar PQRS</button>
    </div>
    ${renderBottomNav('pqrs')}
  `;
}

function renderProfile() {
  const a = AppState.isAccessibleMode;
  const user = AppState.currentUser || { name: 'Usuario', email: 'ejemplo@unlibre.edu.co', phone: '' };

  return `
    <div class="page" style="background: ${a ? '#121212' : '#F4F4F6'};">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: #C8102E; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 32px;">👤</span>
        </div>
        <div style="flex: 1;">
          <h1 style="font-size: 24px; font-weight: 600; color: ${a ? 'white' : '#1C1C1E'};">Mi Perfil</h1>
          <p style="color: #8E8E93;">Gestiona tus datos personales</p>
        </div>
        <button onclick="confirmLogout()" style="padding: 12px; background: ${a ? '#2C2C2E' : 'white'}; border: 1px solid #E5E5EA; border-radius: 50%; cursor: pointer;" title="Cerrar Sesión">
          <span style="font-size: 20px;">🚪</span>
        </button>
      </div>

      <div class="card" style="padding: 24px; border-radius: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: ${a ? 'white' : '#1C1C1E'};">Datos del Usuario</h2>
        
        <div class="input-group">
          <label class="input-label">Nombre Completo</label>
          <input type="text" id="profileName" class="input" value="${user.name || ''}" placeholder="Tu nombre">
        </div>

        <div class="input-group">
          <label class="input-label">Correo Institucional</label>
          <input type="email" id="profileEmail" class="input" value="${user.email || ''}" placeholder="ejemplo@unlibre.edu.co">
        </div>

        <div class="input-group">
          <label class="input-label">Teléfono de Contacto</label>
          <input type="tel" id="profilePhone" class="input" value="${user.phone || ''}" placeholder="Número telefónico">
        </div>

        <button onclick="saveProfileData()" class="btn btn-primary" style="border-radius: 16px; margin-top: 8px;">
          💾 Guardar Cambios
        </button>
      </div>
    </div>
    ${renderBottomNav('profile')}
  `;
}

function saveProfileData() {
  const newName = document.getElementById('profileName').value;
  const newEmail = document.getElementById('profileEmail').value;
  const newPhone = document.getElementById('profilePhone').value;

  if (!newName || !newEmail) {
    alert('El nombre y el correo electrónico no pueden quedar vacíos.');
    return;
  }

  AppState.currentUser.name = newName;
  AppState.currentUser.email = newEmail;
  AppState.currentUser.phone = newPhone;

  saveState();
  alert('¡Datos de perfil actualizados correctamente!');
  renderPage();
}

function renderBottomNav(current) {
  const items = [
    { page: 'dashboard', label: 'Inicio', activeImg: 'imagenes/10.png', inactiveImg: 'imagenes/10.1.png' },
    { page: 'create-report', label: 'Crear', activeImg: 'imagenes/11.1.png', inactiveImg: 'imagenes/11.png' },
    { page: 'tracking', label: 'Historial', activeImg: 'imagenes/12.1.png', inactiveImg: 'imagenes/12.png' },
    { page: 'pqrs', label: 'PQRS', activeImg: 'imagenes/13.1.png', inactiveImg: 'imagenes/13.png' },
    { page: 'profile', label: 'Perfil', activeImg: 'imagenes/14.1.png', inactiveImg: 'imagenes/14.png' }
  ];
  return `
    <nav class="bottom-nav">
      ${items.map(item => `
        <button class="nav-item ${current === item.page ? 'active' : ''}" onclick="navigate('${item.page}')">
          <img class="nav-icon" src="${current === item.page ? item.activeImg : item.inactiveImg}">
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function toggleAccessibleMode() {
  AppState.isAccessibleMode = !AppState.isAccessibleMode;
  document.body.classList.toggle('accessible-mode');
  saveState();
  renderPage();
}

function selectCategory(cat){
  selectedCategory = cat;
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelectorAll('.category-img').forEach(img => {
    img.src = img.dataset.normal;
  });
  document.querySelectorAll('.category-btn').forEach(btn => {
    if(btn.textContent.includes(cat)){
      btn.classList.add('selected');
      const img = btn.querySelector('.category-img');
      img.src = img.dataset.selected;
    }
  });
  saveDraft();
}

function detectLocation() {
  document.getElementById('locationDisplay').classList.remove('hidden');
  document.getElementById('locationText').textContent = 'Campus Central - Edificio B, Piso 2';
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
  const desc = document.getElementById('description').value;
  if (!selectedCategory || !desc) {
    showErrorModal();
    return;
  }

  AppState.reports.push({
    id: `RPT-${Date.now()}`,
    category: selectedCategory,
    description: desc,
    location: document.getElementById('locationText')?.textContent || 'No especificada',
    status: 'revision',
    date: new Date().toISOString()
  });

  localStorage.removeItem('reportDraft');
  AppState.reportDraft = null;
  selectedCategory = null;
  saveState();
  navigate('tracking');
}

function showErrorModal() {
  const modal = document.getElementById('errorModal');
  const sheet = modal.querySelector('.bottom-sheet');
  modal.classList.add('show');
  setTimeout(() => sheet.classList.add('show'), 10);
}

function closeErrorModal() {
  const modal = document.getElementById('errorModal');
  const sheet = modal.querySelector('.bottom-sheet');
  sheet.classList.remove('show');
  setTimeout(() => modal.classList.remove('show'), 300);
}

function selectPQRSType(type){
  selectedPQRSType = type;
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelectorAll('.pqrs-icon').forEach(img => {
    img.src = img.dataset.normal;
  });
  const btn = document.getElementById(`pqrs-${type}`);
  btn.classList.add('selected');
  const img = btn.querySelector('.pqrs-icon');
  img.src = img.dataset.active;
}

function submitPQRS() {
  const subject = document.getElementById('pqrsSubject').value;
  const desc = document.getElementById('pqrsDescription').value;

  if (!selectedPQRSType || !subject || !desc) {
    alert('Completa todos los campos');
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

  selectedPQRSType = null;
  saveState();
  navigate('tracking');
}

function showFAQ(){
  alert(`Preguntas frecuentes\n\n• ¿Cómo crear un reporte?\nSelecciona una categoría y describe el problema.\n\n• ¿Cómo hago seguimiento?\nVe a Mis Reportes e Historial.\n\n• ¿Cómo enviar PQRS?\nCompleta los campos y presiona enviar.`);
}

function confirmLogout() {
  if (confirm('¿Cerrar sesión?')) {
    AppState.currentUser = null;
    localStorage.removeItem('currentUser');
    navigate('login');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  navigate(AppState.currentUser ? 'dashboard' : 'login');
});
