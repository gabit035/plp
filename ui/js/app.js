const { ipcRenderer } = require('electron');

// Estado global de la aplicación
window.AppState = {
    userProfile: null,
    personalizedHabits: [],
    settings: {
        notificationsEnabled: false,
        frequency: 5,
        soundType: 'chime',
        minimizeToTray: true
    },
    stats: {
        completedToday: 0,
        currentStreak: 0,
        lastCompletionDate: null
    },
    currentHabitPopup: null
};

// Función para inicializar la aplicación
async function initializeApp() {
    console.log('⚡ ¡Ponete Las Pilas! inicializando...');
    
    try {
        // Cargar datos desde el proceso principal
        const appData = await ipcRenderer.invoke('app-ready');
        
        if (appData.profile) {
            window.AppState.userProfile = appData.profile;
        }
        
        if (appData.habits && appData.habits.length > 0) {
            window.AppState.personalizedHabits = appData.habits;
            showMainScreen();
        }
        
        if (appData.settings) {
            window.AppState.settings = appData.settings;
            updateUIFromSettings();
        }
        
        if (appData.stats) {
            window.AppState.stats = appData.stats;
            updateStatsDisplay();
        }
        
        // Configurar navegación
        setupNavigation();
        
        // Configurar status del sistema
        updateSystemStatus('online');
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        updateSystemStatus('offline');
    }
}

// Configurar listeners IPC
setupIPCListeners();

// Esperar a que el DOM esté listo y luego inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el proceso principal envíe la señal de que está listo
    ipcRenderer.once('app-started', async () => {
        await initializeApp();
    });
    
    // Si ya pasó el evento, intentar inicializar de todos modos
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeApp().catch(console.error);
    }
});

// Configurar listeners de IPC
function setupIPCListeners() {
    // Escuchar notificaciones desde el proceso principal
    ipcRenderer.on('notifications-toggled', (event, enabled) => {
        window.AppState.settings.notificationsEnabled = enabled;
        updateUIFromSettings();
    });
    
    // Escuchar cuando se completa un hábito desde notificación nativa
    ipcRenderer.on('habit-completed', (event, stats) => {
        window.AppState.stats = stats;
        updateStatsDisplay();
        showNotification('¡Excelente! Hábito completado desde notificación! 🚀', 'success');
    });
    
    // Escuchar cuando se debe mostrar un popup de hábito
    ipcRenderer.on('show-habit-popup', (event, habit) => {
        showHabitPopup(habit);
    });
    
    // Escuchar comandos de sonido
    ipcRenderer.on('play-sound', (event, soundType) => {
        playSound(soundType);
    });
    
    // Escuchar navegación desde el proceso principal
    ipcRenderer.on('navigate-to', (event, screen) => {
        navigateToScreen(screen);
    });
}

// Funciones de utilidad global
function updateSystemStatus(status) {
    const statusBadge = document.getElementById('status-badge');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    
    if (status === 'online') {
        statusBadge.className = 'status-badge online';
        statusIcon.textContent = '🟢';
        statusText.textContent = 'Sistema Activo';
    } else {
        statusBadge.className = 'status-badge offline';
        statusIcon.textContent = '🔴';
        statusText.textContent = 'Sistema Inactivo';
    }
}

function showMainScreen() {
    // Ocultar otras pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar dashboard por defecto si hay hábitos
    if (window.AppState.personalizedHabits.length > 0) {
        document.getElementById('dashboard-screen').classList.add('active');
        setActiveNavLink('dashboard');
    } else {
        document.getElementById('welcome-screen').classList.add('active');
        setActiveNavLink('welcome');
    }
    
    // Renderizar contenido
    renderPersonalizedHabits();
    updateStatsDisplay();
    updateUIFromSettings();
}

// Guardar todos los datos
async function saveAllData() {
    try {
        await Promise.all([
            ipcRenderer.invoke('save-user-profile', window.AppState.userProfile),
            ipcRenderer.invoke('save-personalized-habits', window.AppState.personalizedHabits),
            ipcRenderer.invoke('save-app-settings', window.AppState.settings),
            ipcRenderer.invoke('save-app-stats', window.AppState.stats)
        ]);
        
        showNotification('✅ Todos los datos guardados correctamente', 'success');
        console.log('✅ Datos guardados exitosamente');
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
        showNotification('❌ Error guardando datos', 'error');
    }
}

// Mostrar notificación temporal en UI
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        color: white;
        font-weight: 600;
        max-width: 300px;
        animation: slideInNotification 0.3s ease;
        ${type === 'success' ? 'background: #48bb78;' : ''}
        ${type === 'error' ? 'background: #fc8181;' : ''}
        ${type === 'info' ? 'background: #667eea;' : ''}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Agregar estilos para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInNotification {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

console.log('⚡ App.js cargado - Sistema principal listo');