// Sistema de navegación entre pantallas

function setupNavigation() {
    // Configurar enlaces de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = link.getAttribute('data-screen');
            navigateToScreen(screenId);
            setActiveNavLink(screenId);
        });
    });
    
    // Configurar tabs del dashboard
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    console.log('✅ Sistema de navegación configurado');
}

function navigateToScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla seleccionada
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        
        // Ejecutar acciones específicas según la pantalla
        onScreenChange(screenId);
    }
}

function setActiveNavLink(screenId) {
    // Remover clase active de todos los enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace correspondiente
    const activeLink = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function switchTab(tabId) {
    // Remover clase active de todos los botones de tab
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Remover clase active de todos los paneles de tab
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Activar el botón de tab seleccionado
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Activar el panel de tab correspondiente
    const activePanel = document.getElementById(`tab-${tabId}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}

function onScreenChange(screenId) {
    switch (screenId) {
        case 'survey':
            // Inicializar encuesta si es necesario
            if (typeof initializeSurvey === 'function') {
                initializeSurvey();
            }
            break;
            
        case 'dashboard':
            // Actualizar estadísticas
            updateStatsDisplay();
            break;
            
        case 'habits':
            // Renderizar hábitos personalizados
            renderPersonalizedHabits();
            break;
            
        case 'settings':
            // Actualizar UI de configuración
            updateUIFromSettings();
            break;
            
        default:
            break;
    }
}

// Funciones de utilidad para navegación

function goToSurvey() {
    navigateToScreen('survey');
    setActiveNavLink('survey');
}

function goToDashboard() {
    navigateToScreen('dashboard');
    setActiveNavLink('dashboard');
}

function goToHabits() {
    navigateToScreen('habits');
    setActiveNavLink('habits');
}

function goToSettings() {
    navigateToScreen('settings');
    setActiveNavLink('settings');
}

function goToWelcome() {
    navigateToScreen('welcome');
    setActiveNavLink('welcome');
}

// Breadcrumb navigation helpers
function getActiveScreen() {
    const activeScreen = document.querySelector('.screen.active');
    return activeScreen ? activeScreen.id.replace('-screen', '') : 'welcome';
}

function canNavigateToScreen(screenId) {
    // Validar si se puede navegar a cierta pantalla
    switch (screenId) {
        case 'habits':
            return window.AppState.personalizedHabits.length > 0;
        case 'dashboard':
            return window.AppState.personalizedHabits.length > 0;
        default:
            return true;
    }
}

function navigateWithValidation(screenId) {
    if (canNavigateToScreen(screenId)) {
        navigateToScreen(screenId);
        setActiveNavLink(screenId);
        return true;
    } else {
        showNotification('Completa la evaluación primero para acceder a esta sección', 'info');
        return false;
    }
}

console.log('✅ Navigation.js cargado');