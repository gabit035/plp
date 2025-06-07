const { ipcMain } = require('electron');

function setupIPC(mainWindow, dataManager, notificationSystem) {
    // Inicialización de la app
    ipcMain.handle('app-ready', async () => {
        await dataManager.resetDailyStats();
        return dataManager.getAllData();
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

    // Gestión de estadísticas
    ipcMain.handle('get-app-stats', () => {
        return dataManager.stats;
    });

    // Manejar solicitud de hábito aleatorio
    ipcMain.handle('trigger-random-habit', async () => {
        if (notificationSystem && typeof notificationSystem.triggerManualNotification === 'function') {
            await notificationSystem.triggerManualNotification();
            return true;
        }
        throw new Error('Sistema de notificaciones no disponible');
    });

    ipcMain.handle('save-app-stats', async (event, stats) => {
        await dataManager.setStats(stats);
        return true;
    });

    // Completar hábito desde UI
    ipcMain.handle('complete-habit-from-ui', async () => {
        const newStats = await dataManager.completeHabit();
        
        // Actualizar bandeja del sistema
        const poneteApp = require('../main');
        if (poneteApp.tray) {
            poneteApp.tray.refresh();
        }
        
        return newStats;
    });

    // Trigger de hábito aleatorio manual
    ipcMain.handle('trigger-random-habit', async () => {
        const notificationSystem = require('./notifications').NotificationSystem;
        if (notificationSystem) {
            notificationSystem.triggerManualNotification();
        }
        return true;
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