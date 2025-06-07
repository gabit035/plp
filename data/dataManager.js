const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class DataManager {
    constructor() {
        this.userDataPath = app.getPath('userData');
        this.dataFile = path.join(this.userDataPath, 'app-data.json');
        
        // Datos por defecto
        this.data = {
            userProfile: null,
            personalizedHabits: [],
            settings: {
                notificationsEnabled: false,
                frequency: 5,
                soundType: 'chime',
                // Configuración de notificaciones
                autoStart: false
            },
            stats: {
                completedToday: 0,
                currentStreak: 0,
                lastCompletionDate: null,
                totalCompleted: 0
            }
        };
    }

    async initialize() {
        console.log('Inicializando DataManager...');
        console.log('Ruta de datos:', this.userDataPath);
        
        try {
            // Asegurarse de que el directorio existe
            await this.ensureDataDirectory();
            console.log('Directorio de datos verificado');
            
            // Cargar datos
            await this.loadData();
            console.log('Datos cargados correctamente');
            
            // Verificar estructura de datos
            if (!this.data.userProfile) {
                console.log('Perfil de usuario no encontrado, usando valores por defecto');
                this.data.userProfile = null;
            }
            
            console.log('✅ DataManager inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error crítico en DataManager.initialize:', error);
            // Intentar recuperación
            try {
                console.log('Intentando restaurar configuración por defecto...');
                this.data = this.getDefaultData();
                await this.saveData();
                console.log('Configuración por defecto restaurada');
                return true;
            } catch (recoveryError) {
                console.error('❌ Error al restaurar configuración por defecto:', recoveryError);
                throw new Error('No se pudo inicializar el DataManager: ' + recoveryError.message);
            }
        }
    }

    async ensureDataDirectory() {
        try {
            await fs.access(this.userDataPath);
        } catch {
            await fs.mkdir(this.userDataPath, { recursive: true });
        }
    }

    getDefaultData() {
        return {
            userProfile: null,
            personalizedHabits: [],
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
    }

    async loadData() {
        console.log(`Cargando datos desde: ${this.dataFile}`);
        try {
            // Verificar si el archivo existe
            try {
                await fs.access(this.dataFile);
            } catch (accessError) {
                console.log('Archivo de datos no encontrado, creando uno nuevo...');
                this.data = this.getDefaultData();
                await this.saveData();
                return;
            }
            
            // Leer y analizar el archivo
            const fileContent = await fs.readFile(this.dataFile, 'utf8');
            if (!fileContent.trim()) {
                console.log('Archivo de datos vacío, usando valores por defecto');
                this.data = this.getDefaultData();
                return;
            }
            
            const parsedData = JSON.parse(fileContent);
            this.data = { ...this.getDefaultData(), ...parsedData };
            console.log('Datos cargados correctamente');
        } catch (error) {
            // Archivo no existe, usar datos por defecto
            await this.saveData();
        }
    }

    async saveData() {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
            throw error;
        }
    }

    // Getters
    get userProfile() { return this.data.userProfile; }
    get personalizedHabits() { return this.data.personalizedHabits; }
    get settings() { return this.data.settings; }
    get stats() { return this.data.stats; }

    // Setters con auto-guardado
    async setUserProfile(profile) {
        this.data.userProfile = profile;
        await this.saveData();
    }

    async setPersonalizedHabits(habits) {
        this.data.personalizedHabits = habits;
        await this.saveData();
    }

    async setSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        await this.saveData();
    }

    async setStats(stats) {
        this.data.stats = { ...this.data.stats, ...stats };
        await this.saveData();
    }

    // Métodos específicos para estadísticas
    async completeHabit() {
        const today = new Date().toDateString();
        
        if (this.data.stats.lastCompletionDate !== today) {
            // Nuevo día
            if (this.data.stats.lastCompletionDate === this.getYesterday()) {
                this.data.stats.currentStreak++;
            } else {
                this.data.stats.currentStreak = 1;
            }
            this.data.stats.completedToday = 1;
        } else {
            // Mismo día
            this.data.stats.completedToday++;
        }
        
        this.data.stats.lastCompletionDate = today;
        this.data.stats.totalCompleted++;
        
        await this.saveData();
        return this.data.stats;
    }

    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toDateString();
    }

    async resetDailyStats() {
        const today = new Date().toDateString();
        if (this.data.stats.lastCompletionDate !== today) {
            this.data.stats.completedToday = 0;
            await this.saveData();
        }
    }

    cleanup() {
        // Cleanup antes de cerrar la aplicación
        console.log('🧹 Limpieza de DataManager');
    }

    // Método para obtener todos los datos de una vez (para IPC)
    getAllData() {
        return {
            profile: this.userProfile,
            habits: this.personalizedHabits,
            settings: this.settings,
            stats: this.stats
        };
    }
}

module.exports = { DataManager };