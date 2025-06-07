const { Notification } = require('electron');
const path = require('path');

class NotificationSystem {
    constructor(mainWindow, dataManager) {
        this.mainWindow = mainWindow;
        this.dataManager = dataManager;
        this.notificationTimer = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning || !this.dataManager.settings.notificationsEnabled) {
            return;
        }

        this.isRunning = true;
        const intervalMs = this.dataManager.settings.frequency * 60 * 1000;
        
        this.notificationTimer = setInterval(() => {
            this.showRandomHabitNotification();
        }, intervalMs);
        
        console.log(`✅ Notificaciones iniciadas cada ${this.dataManager.settings.frequency} minutos`);
    }

    stop() {
        if (this.notificationTimer) {
            clearInterval(this.notificationTimer);
            this.notificationTimer = null;
            this.isRunning = false;
            console.log('❌ Notificaciones detenidas');
        }
    }

    restart() {
        this.stop();
        if (this.dataManager.settings.notificationsEnabled) {
            this.start();
        }
    }

    showRandomHabitNotification() {
        const habits = this.dataManager.personalizedHabits;
        
        if (habits.length === 0) {
            console.log('No hay hábitos personalizados disponibles');
            return;
        }
        
        const randomHabit = habits[Math.floor(Math.random() * habits.length)];
        this.showNotification(randomHabit);
    }

    showNotification(habit) {
        if (!Notification.isSupported()) {
            console.log('Notificaciones no soportadas en este sistema');
            return;
        }

        const notification = new Notification({
            title: `${habit.icon} ${habit.name}`,
            body: habit.description,
            icon: path.join(__dirname, '../../assets/notification-icon.png'),
            silent: false,
            urgency: 'normal',
            timeoutType: 'default'
        });
        
        notification.show();
        
        // Eventos de la notificación
        notification.on('click', () => {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.webContents.send('show-habit-popup', habit);
        });
        
        // Reproducir sonido
        this.playNotificationSound();
        
        console.log(`🔔 Notificación mostrada: ${habit.name}`);
    }

    playNotificationSound() {
        if (this.mainWindow) {
            this.mainWindow.webContents.send('play-sound', this.dataManager.settings.soundType);
        }
    }

    // Método para mostrar notificación manual
    triggerManualNotification() {
        this.showRandomHabitNotification();
    }
}

function setupNotifications(mainWindow, dataManager) {
    const notificationSystem = new NotificationSystem(mainWindow, dataManager);
    
    // Iniciar si las notificaciones están habilitadas
    if (dataManager.settings.notificationsEnabled) {
        notificationSystem.start();
    }
    
    return notificationSystem;
}

module.exports = { setupNotifications, NotificationSystem };