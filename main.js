const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setupTray } = require('./core/tray');
const { setupNotifications } = require('./core/notifications');
const { setupIPC } = require('./core/ipc');
const { DataManager } = require('./data/dataManager');

class PoneteApp {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.dataManager = new DataManager();
        this.notificationSystem = null;
    }

    async initialize() {
        console.log('⚡ Iniciando ¡Ponete Las Pilas!');
        
        // Cargar datos de usuario primero
        await this.dataManager.initialize();
        
        // Configurar ventana principal
        this.createWindow();
        
        // Configurar sistema de notificaciones
        this.notificationSystem = setupNotifications(this.mainWindow, this.dataManager);
        
        // Configurar comunicación IPC después de tener la ventana y notificaciones listas
        this.setupIPC();
        
        // Configurar bandeja del sistema
        this.setupTray();
        
        // Notificar al renderer que la app está lista
        if (this.mainWindow) {
            this.mainWindow.webContents.once('dom-ready', () => {
                this.mainWindow.webContents.send('app-started');
            });
        }
    }

    createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            minWidth: 600,
            minHeight: 500,
            icon: path.join(__dirname, 'assets/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                devTools: true,
                webSecurity: false
            },
            titleBarStyle: 'default',
            show: true
        });

        this.mainWindow.loadFile('index.html');

        // Eventos de ventana - Comportamiento de minimizado normal
        this.mainWindow.on('minimize', (event) => {
            // Comportamiento de minimizado normal (a la barra de tareas)
            this.mainWindow.minimize();
        });

        this.mainWindow.on('close', (event) => {
            // Cerrar la aplicación normalmente
            app.quit();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    setupTray() {
        this.tray = setupTray(this.mainWindow, this.dataManager, this.notificationSystem);
    }

    setupIPC() {
        setupIPC(this.mainWindow, this.dataManager, this.notificationSystem);
    }

    getMainWindow() {
        return this.mainWindow;
    }

    getNotificationSystem() {
        return this.notificationSystem;
    }
}

// Instancia global de la app
const poneteApp = new PoneteApp();

// Eventos de la aplicación
app.whenReady().then(() => {
    poneteApp.initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        poneteApp.createWindow();
    } else {
        poneteApp.getMainWindow()?.show();
    }
});

app.on('before-quit', () => {
    if (poneteApp.notificationSystem) {
        poneteApp.notificationSystem.stop();
    }
    poneteApp.dataManager.cleanup();
});

module.exports = poneteApp;