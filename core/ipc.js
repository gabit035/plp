const { ipcMain } = require('electron');

function setupIPC(mainWindow, dataManager, notificationSystem) {
    console.log('🔌 Configurando manejadores IPC...');
    console.log('🔌 Sistema de notificaciones disponible:', notificationSystem ? '✅ Sí' : '❌ No');
    
    // Verificar si ya hay manejadores registrados para evitar duplicados
    const ipcEvents = ipcMain.eventNames();
    if (ipcEvents.includes('trigger-random-habit')) {
        console.log('ℹ️ El manejador trigger-random-habit ya está registrado, omitiendo configuración duplicada');
        return; // Salir si ya está configurado
    }
    
    // Guardar referencia al sistema de notificaciones
    const safeNotificationSystem = notificationSystem;
    
    // Configurar manejadores IPC
    ipcMain.handle('app-ready', async () => {
        try {
            if (!dataManager) {
                console.error('Error: dataManager no está inicializado');
                return { error: 'Error de inicialización' };
            }
            
            // Resetear estadísticas diarias
            try {
                await dataManager.resetDailyStats();
                console.log('✅ Estadísticas diarias reiniciadas');
            } catch (error) {
                console.error('⚠️ Error al reiniciar estadísticas diarias:', error);
                // Continuar incluso si hay error al reiniciar estadísticas
            }
            
            // Obtener todos los datos
            const appData = dataManager.getAllData() || {
                profile: null,
                habits: [],
                settings: {
                    notificationsEnabled: false,
                    frequency: 5,
                    soundType: 'chime',
                    minimizeToTray: false,
                    autoStart: false
                },
                stats: {
                    completedToday: 0,
                    currentStreak: 0,
                    lastCompletionDate: null,
                    totalCompleted: 0
                }
            };
            
            console.log('📊 Datos de la aplicación listos:', Object.keys(appData));
            return appData;
            
        } catch (error) {
            console.error('❌ Error en app-ready:', error);
            return {
                error: error.message || 'Error al cargar los datos de la aplicación',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    });

    // Gestión de perfil de usuario
    ipcMain.handle('get-user-profile', () => {
        return dataManager.userProfile;
    });

    ipcMain.handle('save-user-profile', async (event, profile) => {
        await dataManager.setUserProfile(profile);
        return true;
    });

    // Gestión de hábitos personalizados
    ipcMain.handle('get-personalized-habits', () => {
        return dataManager.personalizedHabits;
    });

    ipcMain.handle('save-personalized-habits', async (event, habits) => {
        await dataManager.setPersonalizedHabits(habits);
        return true;
    });

    // Gestión de configuración
    ipcMain.handle('get-app-settings', () => {
        return dataManager.settings;
    });

    ipcMain.handle('save-app-settings', async (event, settings) => {
        await dataManager.setSettings(settings);
        
        // Reiniciar notificaciones si cambió la configuración
        if (notificationSystem) {
            notificationSystem.restart();
        }
        
        return true;
    });

    // Manejar completado de hábito desde la UI
    ipcMain.handle('complete-habit-from-ui', async () => {
        try {
            if (!dataManager) {
                console.error('Error: dataManager no está inicializado');
                throw new Error('Error de inicialización');
            }
            
            // Actualizar estadísticas
            const updatedStats = await dataManager.completeHabit();
            console.log('✅ Hábito completado, nuevas estadísticas:', updatedStats);
            
            // Notificar al sistema de notificaciones si está disponible
            if (safeNotificationSystem && typeof safeNotificationSystem.restart === 'function') {
                safeNotificationSystem.restart();
            }
            
            return updatedStats;
        } catch (error) {
            console.error('❌ Error en complete-habit-from-ui:', error);
            throw error;
        }
    });

    // Gestión de estadísticas
    ipcMain.handle('get-app-stats', () => {
        return dataManager.stats;
    });

    ipcMain.handle('save-app-stats', async (event, stats) => {
        try {
            await dataManager.setStats(stats);
            return { success: true };
        } catch (error) {
            console.error('❌ Error al guardar estadísticas:', error);
            return { 
                success: false, 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    });

    // Manejar solicitud de hábito aleatorio
    ipcMain.handle('trigger-random-habit', async () => {
        try {
            console.log('🔔 Solicitado trigger de hábito aleatorio manual');
            
            // Usar safeNotificationSystem que ya está en el ámbito
            if (!safeNotificationSystem) {
                console.warn('⚠️ Sistema de notificaciones no disponible, ignorando solicitud');
                return { 
                    success: true, 
                    message: 'Sistema de notificaciones no disponible, acción ignorada',
                    notificationSystemAvailable: false
                };
            }
            
            // Verificar si el método triggerManualNotification está disponible
            if (typeof safeNotificationSystem.triggerManualNotification === 'function') {
                console.log('✅ Disparando notificación manual...');
                safeNotificationSystem.triggerManualNotification();
                return { 
                    success: true, 
                    message: 'Notificación manual disparada',
                    notificationSystemAvailable: true
                };
            } else {
                console.error('❌ El método triggerManualNotification no está disponible');
                return { 
                    success: false, 
                    error: 'Método triggerManualNotification no disponible',
                    notificationSystemAvailable: true
                };
            }
        } catch (error) {
            console.error('❌ Error al disparar notificación manual:', error);
            return { 
                success: false, 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                notificationSystemAvailable: !!safeNotificationSystem
            };
        }
    });

    // Mostrar notificación nativa del sistema
    ipcMain.handle('show-notification', async (event, title, body) => {
        const { Notification } = require('electron');
        
        if (Notification.isSupported()) {
            new Notification({
                title: title,
                body: body,
                icon: require('path').join(__dirname, '../../assets/notification-icon.png')
            }).show();
            return true;
        }
        return false;
    });

    // Obtener información del sistema
    ipcMain.handle('get-system-info', () => {
        return {
            platform: process.platform,
            version: process.versions.electron,
            nodeVersion: process.versions.node,
            appVersion: require('../../package.json').version
        };
    });

    // Backup y restauración
    ipcMain.handle('export-data', () => {
        return dataManager.getAllData();
    });

    ipcMain.handle('import-data', async (event, importedData) => {
        try {
            if (importedData.profile) {
                await dataManager.setUserProfile(importedData.profile);
            }
            if (importedData.habits) {
                await dataManager.setPersonalizedHabits(importedData.habits);
            }
            if (importedData.settings) {
                await dataManager.setSettings(importedData.settings);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    console.log('✅ IPC handlers configurados');
}

module.exports = { setupIPC };