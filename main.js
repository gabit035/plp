const { app, BrowserWindow } = require('electron');
const path = require('path');
// Intentar cargar el módulo de notificaciones con manejo de errores
let setupNotifications;
try {
    const notificationsModule = require('./core/notifications');
    setupNotifications = notificationsModule.setupNotifications;
    console.log('✅ Módulo de notificaciones cargado correctamente');
} catch (error) {
    console.error('❌ Error al cargar el módulo de notificaciones:', error.message);
    console.error('Ruta intentada:', path.resolve(__dirname, 'core', 'notifications.js'));
    // Exportar una función dummy para evitar errores
    setupNotifications = () => {
        console.warn('⚠️ Usando notificaciones dummy - El módulo real no pudo cargarse');
        return {
            start: () => console.log('Notificaciones dummy: start'),
            stop: () => console.log('Notificaciones dummy: stop'),
            restart: () => console.log('Notificaciones dummy: restart')
        };
    };
}
const { setupIPC } = require('./core/ipc');
const { DataManager } = require('./data/dataManager');

class PoneteApp {
    constructor() {
        this.mainWindow = null;
        this.notificationSystem = null;
        
        try {
            console.log('Creando instancia de DataManager...');
            this.dataManager = new DataManager();
            if (!this.dataManager) {
                throw new Error('No se pudo crear la instancia de DataManager');
            }
        } catch (error) {
            console.error('Error al crear DataManager:', error);
            throw error; // Relanzar para que se maneje en el flujo principal
        }
    }

    async initialize() {
        console.log('⚡ Iniciando ¡Ponete Las Pilas!');
        
        try {
            // 1. Inicializar DataManager primero
            console.log('Inicializando DataManager...');
            if (!this.dataManager) {
                throw new Error('DataManager no está definido');
            }
            
            await this.dataManager.initialize();
            console.log('✅ DataManager inicializado correctamente');
            
            // 2. Crear ventana principal
            console.log('Creando ventana principal...');
            this.createWindow();
            
            if (!this.mainWindow) {
                throw new Error('No se pudo crear la ventana principal');
            }
            
            // 3. Configurar notificaciones
            console.log('Configurando notificaciones...');
            this.notificationSystem = setupNotifications(this.mainWindow, this.dataManager);
            
            if (!this.notificationSystem) {
                console.warn('⚠️ No se pudo inicializar el sistema de notificaciones');
            } else {
                console.log('✅ Sistema de notificaciones inicializado correctamente');
            }
            
            // Configurar IPC
            console.log('Configurando IPC...');
            this.setupIPC();
            
            // Notificar al renderer que la app está lista
            this.mainWindow.webContents.once('dom-ready', () => {
                console.log('Enviando evento app-started al renderer...');
                this.mainWindow.webContents.send('app-started');
            });
            
            // Manejar errores de carga de página
            this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                console.error('Error al cargar la aplicación:', errorCode, errorDescription);
            });
            
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('Error durante la inicialización:', error);
            if (this.mainWindow) {
                this.showErrorPage(error.message);
            }
        }
    }

    createWindow() {
        try {
            console.log('Creando ventana del navegador...');
            this.mainWindow = new BrowserWindow({
                width: 1000,
                height: 800,
                minWidth: 600,
                minHeight: 500,
                webPreferences: {
                    nodeIntegration: true,      // Permite usar require() en la ventana de renderizado
                    contextIsolation: false,    // Necesario para usar ipcRenderer sin contextBridge
                    devTools: true,            // Habilitar herramientas de desarrollo
                    webSecurity: false,         // Solo para desarrollo, desactivar en producción
                    enableRemoteModule: true,   // Necesario para algunas versiones de Electron
                    sandbox: false,            // Desactivar sandbox para compatibilidad
                    spellcheck: false,          // Desactivar corrector ortográfico
                    webviewTag: false,         // Desactivar etiqueta webview por seguridad
                    nativeWindowOpen: true,    // Usar ventanas nativas
                    backgroundThrottling: false, // Evitar que se ponga en segundo plano
                    disableBlinkFeatures: 'Auxclick' // Deshabilitar eventos de doble clic
                },
                titleBarStyle: 'default',
                show: true
            });

            // Verificar que el archivo index.html existe
            const indexPath = path.join(__dirname, 'index.html');
            
            require('fs').access(indexPath, (err) => {
                if (err) {
                    console.error('Error: No se encontró el archivo index.html en:', indexPath);
                    this.showErrorPage('No se pudo encontrar el archivo principal de la aplicación.');
                    return;
                }
                
                console.log('Cargando archivo index.html desde:', indexPath);
                
                // Cargar el archivo HTML principal
                this.mainWindow.loadFile(indexPath).then(() => {
                    console.log('Archivo index.html cargado exitosamente');
                }).catch((error) => {
                    console.error('Error al cargar index.html:', error);
                    this.showErrorPage(`Error al cargar la aplicación: ${error.message}`);
                });
            });

            // Mostrar la ventana cuando esté lista
            this.mainWindow.once('ready-to-show', () => {
                console.log('Ventana lista para mostrarse');
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    this.mainWindow.show();
                }
            });

            // Manejar errores de carga
            this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
                const errorMsg = `Error al cargar la ventana (${errorCode}): ${errorDescription} - ${validatedURL}`;
                console.error(errorMsg);
                this.showErrorPage(`Error al cargar la aplicación: ${errorDescription}`);
            });

            // Eventos de ventana
            this.mainWindow.on('minimize', (event) => {
                console.log('Minimizando ventana...');
                event.preventDefault();
                this.mainWindow.minimize();
            });

            this.mainWindow.on('close', (event) => {
                console.log('Cerrando aplicación...');
                // Cerrar la aplicación normalmente
                app.quit();
            });

            this.mainWindow.on('closed', () => {
                console.log('Ventana cerrada');
                this.mainWindow = null;
            });

            // Abrir herramientas de desarrollo en desarrollo
            if (process.env.NODE_ENV === 'development') {
                this.mainWindow.webContents.openDevTools();
            }

        } catch (error) {
            console.error('Error al crear la ventana:', error);
            throw error; // Relanzar para que se maneje en el flujo principal
        }
    }

    setupIPC() {
        try {
            console.log('🔌 Configurando manejadores IPC...');
            
            // Verificar si ya hay manejadores registrados para evitar duplicados
            const { ipcMain } = require('electron');
            const ipcEvents = ipcMain.eventNames();
            
            if (ipcEvents.includes('trigger-random-habit')) {
                console.log('ℹ️ Los manejadores IPC ya están registrados, omitiendo configuración duplicada');
                return;
            }
            
            // Configurar los manejadores IPC
            require('./core/ipc').setupIPC(this.mainWindow, this.dataManager, this.notificationSystem);
            console.log('✅ Manejadores IPC configurados correctamente');
            
        } catch (error) {
            console.error('❌ Error al configurar los manejadores IPC:', error);
        }
    }

    getMainWindow() {
        return this.mainWindow;
    }

    getNotificationSystem() {
        return this.notificationSystem;
    }
    
    /**
     * Muestra una página de error en la ventana principal
     * @param {string} errorMessage - Mensaje de error a mostrar
     */
    showErrorPage(errorMessage) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            const errorHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Error en la aplicación</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0; 
                            background-color: #f8f9fa;
                            color: #dc3545;
                        }
                        .error-container { 
                            text-align: center; 
                            padding: 2rem; 
                            border: 1px solid #f5c6cb; 
                            border-radius: 8px; 
                            background-color: #f8d7da;
                            max-width: 80%;
                        }
                        h1 { 
                            color: #721c24; 
                            margin-top: 0;
                        }
                        .error-details {
                            background: white;
                            padding: 1rem;
                            border-radius: 4px;
                            margin: 1rem 0;
                            text-align: left;
                            font-family: monospace;
                            white-space: pre-wrap;
                            word-break: break-word;
                            max-height: 200px;
                            overflow-y: auto;
                        }
                        button {
                            background-color: #dc3545;
                            color: white;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-top: 1rem;
                        }
                        button:hover {
                            background-color: #c82333;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>¡Ups! Algo salió mal</h1>
                        <p>La aplicación encontró un error y no pudo cargarse correctamente.</p>
                        <div class="error-details">${errorMessage || 'Error desconocido'}</div>
                        <button onclick="window.location.reload()">Reintentar</button>
                    </div>
                </body>
                </html>
            `.replace(/\s+/g, ' ');
            
            this.mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
        }
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