// Sistema de configuración y ajustes

async function toggleNotifications() {
    const toggle = document.getElementById('notifications-toggle');
    if (!toggle) return;
    
    window.AppState.settings.notificationsEnabled = toggle.checked;
    
    try {
        await ipcRenderer.invoke('save-app-settings', window.AppState.settings);
        updateNotificationStatus();
        
        const message = window.AppState.settings.notificationsEnabled 
            ? '✅ Notificaciones activadas' 
            : '❌ Notificaciones desactivadas';
        showNotification(message, 'success');
        
        console.log(`✅ Notificaciones ${window.AppState.settings.notificationsEnabled ? 'activadas' : 'desactivadas'}`);
    } catch (error) {
        console.error('❌ Error guardando configuración:', error);
        showNotification('Error guardando configuración', 'error');
        
        // Revertir el toggle en caso de error
        toggle.checked = !toggle.checked;
    }
}

async function updateFrequency() {
    const frequencySelect = document.getElementById('notification-frequency');
    if (!frequencySelect) return;
    
    const frequency = parseInt(frequencySelect.value);
    window.AppState.settings.frequency = frequency;
    
    try {
        await ipcRenderer.invoke('save-app-settings', window.AppState.settings);
        showNotification(`⏱️ Frecuencia actualizada a ${frequency} minutos`, 'success');
        console.log(`✅ Frecuencia actualizada a ${frequency} minutos`);
    } catch (error) {
        console.error('❌ Error actualizando frecuencia:', error);
        showNotification('Error actualizando frecuencia', 'error');
    }
}

async function updateSoundType() {
    const soundSelect = document.getElementById('alert-sound');
    if (!soundSelect) return;
    
    const soundType = soundSelect.value;
    window.AppState.settings.soundType = soundType;
    
    try {
        await ipcRenderer.invoke('save-app-settings', window.AppState.settings);
        showNotification(`🎵 Sonido actualizado`, 'success');
        console.log(`✅ Sonido actualizado a ${soundType}`);
    } catch (error) {
        console.error('❌ Error actualizando sonido:', error);
        showNotification('Error actualizando sonido', 'error');
    }
}

async function updateAutoStart() {
    const toggle = document.getElementById('auto-start-toggle');
    if (!toggle) return;
    
    window.AppState.settings.autoStart = toggle.checked;
    
    try {
        await ipcRenderer.invoke('save-app-settings', window.AppState.settings);
        
        const message = window.AppState.settings.autoStart 
            ? '✅ Auto-inicio activado' 
            : '❌ Auto-inicio desactivado';
        showNotification(message, 'success');
        
        console.log(`✅ Auto-inicio: ${window.AppState.settings.autoStart}`);
    } catch (error) {
        console.error('❌ Error actualizando auto-inicio:', error);
        showNotification('Error actualizando auto-inicio', 'error');
        
        // Revertir toggle
        toggle.checked = !toggle.checked;
    }
}

function updateUIFromSettings() {
    const settings = window.AppState.settings;
    
    // Actualizar toggles
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.checked = settings.notificationsEnabled;
    }
    
    const autoStartToggle = document.getElementById('auto-start-toggle');
    if (autoStartToggle) {
        autoStartToggle.checked = settings.autoStart || false;
    }
    
    // Actualizar selects
    const frequencySelect = document.getElementById('notification-frequency');
    if (frequencySelect) {
        frequencySelect.value = settings.frequency;
    }
    
    const soundSelect = document.getElementById('alert-sound');
    if (soundSelect) {
        soundSelect.value = settings.soundType;
    }
    
    // Actualizar estado visual de notificaciones
    updateNotificationStatus();
}

function updateNotificationStatus() {
    const statusElement = document.getElementById('notification-status');
    
    if (statusElement) {
        if (window.AppState.settings.notificationsEnabled) {
            statusElement.textContent = `Activas (cada ${window.AppState.settings.frequency} min)`;
            statusElement.style.color = '#48bb78';
        } else {
            statusElement.textContent = 'Desactivadas';
            statusElement.style.color = '#fc8181';
        }
    }
    
    // Actualizar clase visual del contenedor de configuración
    const configContainer = document.getElementById('notification-config');
    if (configContainer) {
        if (window.AppState.settings.notificationsEnabled) {
            configContainer.classList.add('enabled');
        } else {
            configContainer.classList.remove('enabled');
        }
    }
}

function testSound() {
    const selectedSound = document.getElementById('alert-sound')?.value || 'chime';
    playSound(selectedSound);
    showNotification(`🎵 Probando sonido: ${selectedSound}`, 'info');
}

// Funciones de backup y restauración
async function exportSettings() {
    try {
        const allData = await ipcRenderer.invoke('export-data');
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ponete-las-pilas-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showNotification('✅ Configuración exportada exitosamente', 'success');
    } catch (error) {
        console.error('Error exportando configuración:', error);
        showNotification('❌ Error exportando configuración', 'error');
    }
}

async function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            const result = await ipcRenderer.invoke('import-data', importedData);
            
            if (result.success) {
                // Actualizar estado local
                if (importedData.profile) {
                    window.AppState.userProfile = importedData.profile;
                }
                if (importedData.habits) {
                    window.AppState.personalizedHabits = importedData.habits;
                }
                if (importedData.settings) {
                    window.AppState.settings = importedData.settings;
                }
                
                // Actualizar UI
                updateUIFromSettings();
                renderPersonalizedHabits();
                updateStatsDisplay();
                
                showNotification('✅ Configuración importada exitosamente', 'success');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Error importando configuración:', error);
            showNotification('❌ Error importando configuración', 'error');
        }
    };
    
    input.click();
}

function resetAllSettings() {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración? Esta acción no se puede deshacer.')) {
        resetToDefaults();
    }
}

async function resetToDefaults() {
    try {
        // Resetear a configuración por defecto
        window.AppState.settings = {
            notificationsEnabled: false,
            frequency: 5,
            soundType: 'chime',
            autoStart: false
        };
        
        await ipcRenderer.invoke('save-app-settings', window.AppState.settings);
        updateUIFromSettings();
        
        showNotification('✅ Configuración restablecida a valores por defecto', 'success');
    } catch (error) {
        console.error('Error restableciendo configuración:', error);
        showNotification('❌ Error restableciendo configuración', 'error');
    }
}

// Funciones de información del sistema
async function showSystemInfo() {
    try {
        const systemInfo = await ipcRenderer.invoke('get-system-info');
        
        const infoHTML = `
            <div class="system-info-popup">
                <h3>Información del Sistema</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Plataforma:</strong> ${systemInfo.platform}
                    </div>
                    <div class="info-item">
                        <strong>Versión App:</strong> ${systemInfo.appVersion}
                    </div>
                    <div class="info-item">
                        <strong>Electron:</strong> ${systemInfo.version}
                    </div>
                    <div class="info-item">
                        <strong>Node.js:</strong> ${systemInfo.nodeVersion}
                    </div>
                </div>
            </div>
        `;
        
        showNotification(infoHTML, 'info');
    } catch (error) {
        console.error('Error obteniendo información del sistema:', error);
        showNotification('❌ Error obteniendo información del sistema', 'error');
    }
}

// Configurar event listeners cuando se carga la página
function setupSettingsListeners() {
    // Agregar event listeners a los elementos de configuración
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', toggleNotifications);
    }
    
    const frequencySelect = document.getElementById('notification-frequency');
    if (frequencySelect) {
        frequencySelect.addEventListener('change', updateFrequency);
    }
    
    const soundSelect = document.getElementById('alert-sound');
    if (soundSelect) {
        soundSelect.addEventListener('change', updateSoundType);
    }
    
    const autoStartToggle = document.getElementById('auto-start-toggle');
    if (autoStartToggle) {
        autoStartToggle.addEventListener('change', updateAutoStart);
    }
}

// Configurar listeners cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSettingsListeners);
} else {
    setupSettingsListeners();
}

console.log('✅ Settings.js cargado');