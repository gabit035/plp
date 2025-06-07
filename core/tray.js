const { Tray, Menu, app } = require('electron');
const path = require('path');

class TraySystem {
    constructor(mainWindow, dataManager) {
        this.mainWindow = mainWindow;
        this.dataManager = dataManager;
        this.tray = null;
        this.notificationSystem = null;
    }

    create() {
        const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
        this.tray = new Tray(iconPath);
        
        this.updateContextMenu();
        this.setupEvents();
        
        console.log('✅ Bandeja del sistema creada');
        return this.tray;
    }

    setupEvents() {
        this.tray.setToolTip('¡Ponete Las Pilas! - Micro Hábitos');
        
        // Doble click para mostrar ventana
        this.tray.on('double-click', () => {
            this.showMainWindow();
        });
    }

    updateContextMenu() {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Mostrar Aplicación',
                click: () => this.showMainWindow()
            },
            {
                label: 'Micro Hábito Ahora',
                click: () => this.triggerRandomHabit()
            },
            { type: 'separator' },
            {
                label: `Notificaciones: ${this.dataManager.settings.notificationsEnabled ? 'ON' : 'OFF'}`,
                click: () => this.toggleNotifications()
            },
            {
                label: `Frecuencia: ${this.dataManager.settings.frequency} min`,
                enabled: false
            },
            {
                label: `Completados hoy: ${this.dataManager.stats.completedToday}`,
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Configuración',
                click: () => {
                    this.showMainWindow();
                    this.mainWindow.webContents.send('navigate-to', 'settings');
                }
            },
            {
                label: 'Salir',
                click: () => app.quit()
            }
        ]);
        
        this.tray.setContextMenu(contextMenu);
    }

    showMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    async toggleNotifications() {
        const newState = !this.dataManager.settings.notificationsEnabled;
        
        await this.dataManager.setSettings({
            notificationsEnabled: newState
        });
        
        // Notificar al proceso de notificaciones
        if (this.notificationSystem) {
            if (newState) {
                this.notificationSystem.start();
            } else {
                this.notificationSystem.stop();
            }
        }
        
        // Notificar al renderer
        this.mainWindow.webContents.send('notifications-toggled', newState);
        
        this.updateContextMenu();
    }

    triggerRandomHabit() {
        if (this.notificationSystem) {
            this.notificationSystem.triggerManualNotification();
        }
    }

    // Método para actualizar el menú desde fuera
    refresh() {
        this.updateContextMenu();
    }

    // Establecer referencia al sistema de notificaciones
    setNotificationSystem(notificationSystem) {
        this.notificationSystem = notificationSystem;
    }

    destroy() {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
        }
    }
}

function setupTray(mainWindow, dataManager) {
    const traySystem = new TraySystem(mainWindow, dataManager);
    return traySystem.create();
}

module.exports = { setupTray, TraySystem };