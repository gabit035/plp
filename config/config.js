// Configuración para desarrollo y debugging

const isDev = process.env.NODE_ENV === 'development';

const devConfig = {
    // Configuración de desarrollo
    development: {
        enableDevTools: true,
        enableHotReload: true,
        enableLogging: true,
        logLevel: 'debug',
        autoOpenDevTools: false,
        
        // Configuración de notificaciones para testing
        notifications: {
            testMode: true,
            rapidTesting: true,
            minInterval: 5000, // 5 segundos para testing
            maxInterval: 30000 // 30 segundos para testing
        },
        
        // Configuración de ventana
        window: {
            width: 1200,
            height: 900,
            resizable: true,
            alwaysOnTop: false
        },
        
        // Configuración de datos
        data: {
            resetOnStart: false,
            useTestData: false,
            enableBackup: true
        },
        
        // URLs y paths
        paths: {
            userDataPath: null, // null = usar default
            logPath: 'logs/',
            assetsPath: 'assets/'
        }
    },
    
    // Configuración de producción
    production: {
        enableDevTools: false,
        enableHotReload: false,
        enableLogging: false,
        logLevel: 'error',
        autoOpenDevTools: false,
        
        // Configuración de notificaciones
        notifications: {
            testMode: false,
            rapidTesting: false,
            minInterval: 60000, // 1 minuto mínimo
            maxInterval: 7200000 // 2 horas máximo
        },
        
        // Configuración de ventana
        window: {
            width: 1000,
            height: 800,
            resizable: true,
            alwaysOnTop: false
        },
        
        // Configuración de datos
        data: {
            resetOnStart: false,
            useTestData: false,
            enableBackup: true
        }
    },
    
    // Datos de prueba para desarrollo
    testData: {
        userProfile: {
            hydration: 2,
            exercise: 1,
            nutrition: 2,
            sleep: 3,
            stress: 2,
            goals: 'health'
        },
        
        stats: {
            completedToday: 5,
            currentStreak: 3,
            lastCompletionDate: new Date().toDateString(),
            totalCompleted: 47
        },
        
        settings: {
            notificationsEnabled: true,
            frequency: 0.1, // 6 segundos para testing
            soundType: 'chime',
            minimizeToTray: true,
            autoStart: false
        }
    },
    
    // Configuración de debugging
    debug: {
        // Mostrar estados en consola
        logStateChanges: true,
        logIPCMessages: true,
        logNotifications: true,
        logDataOperations: true,
        
        // Performance monitoring
        enablePerformanceMonitoring: true,
        logMemoryUsage: true,
        
        // UI debugging
        showBoundingBoxes: false,
        highlightClickEvents: false,
        enableGridOverlay: false
    },
    
    // Feature flags para desarrollo
    features: {
        enableExperimentalFeatures: isDev,
        enableBetaNotifications: isDev,
        enableAdvancedStats: isDev,
        enablePluginSystem: false,
        enableCloudSync: false
    }
};

// Función para obtener configuración actual
function getConfig() {
    const env = isDev ? 'development' : 'production';
    return {
        ...devConfig[env],
        debug: isDev ? devConfig.debug : {},
        features: devConfig.features,
        testData: isDev ? devConfig.testData : null
    };
}

// Función para configurar logging
function setupLogging(config) {
    if (!config.enableLogging) {
        console.log = console.warn = console.error = () => {};
        return;
    }
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args) => {
        if (config.logLevel === 'debug' || config.logLevel === 'info') {
            originalLog(`[${new Date().toISOString()}] LOG:`, ...args);
        }
    };
    
    console.warn = (...args) => {
        if (config.logLevel !== 'error') {
            originalWarn(`[${new Date().toISOString()}] WARN:`, ...args);
        }
    };
    
    console.error = (...args) => {
        originalError(`[${new Date().toISOString()}] ERROR:`, ...args);
    };
}

// Función para aplicar configuración de desarrollo
function applyDevConfig(app, mainWindow) {
    const config = getConfig();
    
    // Configurar logging
    setupLogging(config);
    
    // Configurar DevTools
    if (config.enableDevTools && isDev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
        
        // Atajos de desarrollo
        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.control && input.key.toLowerCase() === 'd') {
                mainWindow.webContents.toggleDevTools();
            }
            
            if (input.control && input.shift && input.key.toLowerCase() === 'r') {
                mainWindow.reload();
            }
        });
    }
    
    // Performance monitoring
    if (config.debug.enablePerformanceMonitoring) {
        setInterval(() => {
            const memUsage = process.memoryUsage();
            if (config.debug.logMemoryUsage) {
                console.log('Memory usage:', {
                    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
                });
            }
        }, 30000); // Cada 30 segundos
    }
    
    return config;
}

// Función para validar configuración
function validateConfig(config) {
    const required = ['notifications', 'window', 'data'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required config sections: ${missing.join(', ')}`);
    }
    
    // Validar rangos de notificaciones
    const { minInterval, maxInterval } = config.notifications;
    if (minInterval >= maxInterval) {
        throw new Error('minInterval must be less than maxInterval');
    }
    
    return true;
}

// Función para cargar configuración desde archivo
function loadConfigFromFile(filePath) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        if (fs.existsSync(filePath)) {
            const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return { ...getConfig(), ...configData };
        }
    } catch (error) {
        console.warn('Could not load config from file:', error);
    }
    
    return getConfig();
}

// Función para guardar configuración en archivo
function saveConfigToFile(config, filePath) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Crear directorio si no existe
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
        console.log('Configuration saved to:', filePath);
    } catch (error) {
        console.error('Could not save config to file:', error);
    }
}

module.exports = {
    getConfig,
    setupLogging,
    applyDevConfig,
    validateConfig,
    loadConfigFromFile,
    saveConfigToFile,
    isDev,
    devConfig
};