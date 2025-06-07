// Sistema de sonidos y alertas de audio

// Configuración de sonidos
const sounds = {
    chime: {
        frequencies: [523.25, 659.25, 783.99],
        durations: [0.3, 0.3, 0.5],
        gains: [0.2, 0.2, 0.3],
        name: 'Chime Profesional'
    },
    bell: {
        frequencies: [800, 600],
        durations: [0.4, 0.6],
        gains: [0.25, 0.25],
        name: 'Campana Corporativa'
    },
    notification: {
        frequencies: [440, 554.37, 659.25],
        durations: [0.2, 0.2, 0.4],
        gains: [0.15, 0.15, 0.2],
        name: 'Notificación Moderna'
    },
    success: {
        frequencies: [523.25, 659.25, 783.99, 1046.50],
        durations: [0.15, 0.15, 0.15, 0.3],
        gains: [0.2, 0.2, 0.2, 0.25],
        name: 'Éxito'
    },
    gentle: {
        frequencies: [329.63, 392.00, 523.25],
        durations: [0.5, 0.5, 0.8],
        gains: [0.1, 0.1, 0.15],
        name: 'Suave'
    }
};

let audioContext = null;
let masterGain = null;
let soundEnabled = true;

// Inicializar contexto de audio
function initializeAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.setValueAtTime(0.7, audioContext.currentTime);
        
        console.log('✅ Contexto de audio inicializado');
        return true;
    } catch (error) {
        console.warn('❌ Error inicializando audio:', error);
        return false;
    }
}

// Función principal para reproducir sonidos
function playSound(soundType = 'chime') {
    if (!soundEnabled) {
        console.log('🔇 Sonido deshabilitado');
        return;
    }
    
    // Inicializar contexto si no existe
    if (!audioContext) {
        if (!initializeAudioContext()) {
            return;
        }
    }
    
    // Reanudar contexto si está suspendido
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            playActualSound(soundType);
        }).catch(error => {
            console.warn('Error reanudando contexto de audio:', error);
        });
    } else {
        playActualSound(soundType);
    }
}

function playActualSound(soundType) {
    const soundConfig = sounds[soundType] || sounds.chime;
    
    try {
        soundConfig.frequencies.forEach((frequency, index) => {
            setTimeout(() => {
                playTone(
                    frequency, 
                    soundConfig.durations[index] || 0.3,
                    soundConfig.gains[index] || 0.2
                );
            }, index * 150);
        });
        
        console.log(`🔊 Reproduciendo sonido: ${soundConfig.name}`);
    } catch (error) {
        console.warn('Error reproduciendo sonido:', error);
    }
}

function playTone(frequency, duration, gain) {
    if (!audioContext || !masterGain) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Conectar nodos
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    // Configurar oscilador
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Configurar envolvente de volumen (ADSR simplificado)
    const now = audioContext.currentTime;
    const attackTime = 0.1;
    const releaseTime = 0.2;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + attackTime);
    gainNode.gain.setValueAtTime(gain, now + duration - releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Reproducir
    oscillator.start(now);
    oscillator.stop(now + duration);
}

// Funciones de control de volumen
function setMasterVolume(volume) {
    if (masterGain) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        masterGain.gain.setValueAtTime(clampedVolume, audioContext.currentTime);
        console.log(`🔊 Volumen maestro: ${Math.round(clampedVolume * 100)}%`);
    }
}

function getMasterVolume() {
    return masterGain ? masterGain.gain.value : 0.7;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    console.log(`🔊 Sonido ${soundEnabled ? 'habilitado' : 'deshabilitado'}`);
    return soundEnabled;
}

function isSoundEnabled() {
    return soundEnabled;
}

// Funciones específicas para diferentes tipos de eventos
function playNotificationSound() {
    const soundType = window.AppState?.settings?.soundType || 'chime';
    playSound(soundType);
}

function playSuccessSound() {
    playSound('success');
}

function playGentleSound() {
    playSound('gentle');
}

// Función para precargar sonidos (mejorar rendimiento)
function preloadSounds() {
    if (!audioContext) {
        initializeAudioContext();
    }
    
    // Precargar cada tipo de sonido tocándolo en silencio
    Object.keys(sounds).forEach(soundType => {
        const originalGain = masterGain ? masterGain.gain.value : 0.7;
        if (masterGain) {
            masterGain.gain.setValueAtTime(0, audioContext.currentTime);
        }
        
        setTimeout(() => {
            playActualSound(soundType);
            
            setTimeout(() => {
                if (masterGain) {
                    masterGain.gain.setValueAtTime(originalGain, audioContext.currentTime);
                }
            }, 100);
        }, 50);
    });
    
    console.log('🔊 Sonidos precargados');
}

// Función para obtener lista de sonidos disponibles
function getAvailableSounds() {
    return Object.keys(sounds).map(key => ({
        id: key,
        name: sounds[key].name,
        frequencies: sounds[key].frequencies.length
    }));
}

// Función para crear sonidos personalizados
function createCustomSound(name, frequencies, durations, gains) {
    if (!Array.isArray(frequencies) || frequencies.length === 0) {
        console.warn('Frecuencias inválidas para sonido personalizado');
        return false;
    }
    
    const customSound = {
        frequencies: frequencies,
        durations: durations || frequencies.map(() => 0.3),
        gains: gains || frequencies.map(() => 0.2),
        name: name || 'Sonido Personalizado'
    };
    
    sounds[name.toLowerCase().replace(/\s+/g, '_')] = customSound;
    console.log(`✅ Sonido personalizado "${name}" creado`);
    return true;
}

// Función para testear sonido con feedback visual
function testSoundWithFeedback(soundType) {
    const soundConfig = sounds[soundType] || sounds.chime;
    
    // Crear indicador visual
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-weight: 600;
        z-index: 10000;
        text-align: center;
        animation: pulseSound 0.8s ease-in-out;
    `;
    indicator.innerHTML = `
        🔊 ${soundConfig.name}<br>
        <small>Reproduciendo...</small>
    `;
    
    document.body.appendChild(indicator);
    
    // Reproducir sonido
    playSound(soundType);
    
    // Remover indicador
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
        }
    }, 1000);
}

// Función para diagnosticar problemas de audio
function diagnoseAudio() {
    const diagnosis = {
        contextSupported: !!(window.AudioContext || window.webkitAudioContext),
        contextState: audioContext ? audioContext.state : 'no_context',
        contextSampleRate: audioContext ? audioContext.sampleRate : null,
        masterGainConnected: !!masterGain,
        soundEnabled: soundEnabled,
        userInteractionRequired: audioContext ? audioContext.state === 'suspended' : false
    };
    
    console.log('🔧 Diagnóstico de audio:', diagnosis);
    return diagnosis;
}

// Agregar estilos para animaciones de sonido
const soundStyles = document.createElement('style');
soundStyles.textContent = `
    @keyframes pulseSound {
        0% { 
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        50% { 
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
        }
        100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
    
    .sound-visualizer {
        display: inline-block;
        width: 4px;
        height: 20px;
        background: #667eea;
        margin: 0 1px;
        border-radius: 2px;
        animation: soundBars 0.8s ease-in-out infinite;
    }
    
    @keyframes soundBars {
        0%, 100% { height: 20px; }
        50% { height: 35px; }
    }
`;
document.head.appendChild(soundStyles);

// Inicializar contexto de audio cuando el usuario interactúe por primera vez
document.addEventListener('click', function initAudioOnFirstClick() {
    if (!audioContext) {
        initializeAudioContext();
        document.removeEventListener('click', initAudioOnFirstClick);
    }
}, { once: true });

console.log('✅ Sounds.js cargado');