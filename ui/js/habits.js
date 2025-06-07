// Sistema de manejo de hábitos

// Base de datos de micro hábitos
const habitDatabase = {
    hydration: [
        { name: 'Bebe un vaso de agua', description: 'Hidrata tu cuerpo ahora mismo', icon: '💧', category: 'hidratación' },
        { name: 'Agrega limón al agua', description: 'Mejora el sabor y añade vitamina C', icon: '🍋', category: 'hidratación' },
        { name: 'Bebe agua tibia', description: 'Ayuda a la digestión', icon: '☕', category: 'hidratación' },
        { name: 'Agua con menta', description: 'Refrescante y digestiva', icon: '🌿', category: 'hidratación' }
    ],
    exercise: [
        { name: '10 sentadillas', description: 'Activa tus piernas y glúteos', icon: '🏋️‍♂️', category: 'ejercicio' },
        { name: '20 segundos de plancha', description: 'Fortalece tu core', icon: '🤸‍♂️', category: 'ejercicio' },
        { name: 'Estira el cuello', description: 'Gira suavemente hacia ambos lados', icon: '🤸‍♀️', category: 'ejercicio' },
        { name: 'Camina en el lugar', description: '30 segundos de movimiento', icon: '🚶‍♂️', category: 'ejercicio' },
        { name: '5 flexiones', description: 'Contra la pared si es necesario', icon: '💪', category: 'ejercicio' },
        { name: 'Estira los brazos', description: 'Hacia arriba y a los lados', icon: '🙆‍♂️', category: 'ejercicio' },
        { name: 'Salta en el lugar', description: '10 saltos suaves', icon: '🦘', category: 'ejercicio' }
    ],
    nutrition: [
        { name: 'Come una fruta', description: 'Elige tu favorita como snack saludable', icon: '🍎', category: 'nutrición' },
        { name: 'Mastica lentamente', description: 'Saborea cada bocado por 30 segundos', icon: '😋', category: 'nutrición' },
        { name: 'Come un puñado de nueces', description: 'Grasas saludables para tu cerebro', icon: '🥜', category: 'nutrición' },
        { name: 'Toma té verde', description: 'Antioxidantes naturales', icon: '🍵', category: 'nutrición' },
        { name: 'Come vegetales crudos', description: 'Zanahoria, apio o pepino', icon: '🥕', category: 'nutrición' }
    ],
    mental: [
        { name: 'Respira profundamente', description: '4 respiraciones lentas y profundas', icon: '🌬️', category: 'bienestar' },
        { name: 'Agradece algo', description: 'Piensa en algo por lo que te sientes agradecido', icon: '🙏', category: 'bienestar' },
        { name: 'Sonríe genuinamente', description: 'Libera endorfinas naturales', icon: '😊', category: 'bienestar' },
        { name: 'Meditación de 1 minuto', description: 'Cierra los ojos y enfócate en tu respiración', icon: '🧘‍♂️', category: 'bienestar' },
        { name: 'Observa algo hermoso', description: 'Mira por la ventana o una foto que te guste', icon: '🌸', category: 'bienestar' },
        { name: 'Escucha música relajante', description: '1 canción que te tranquilice', icon: '🎵', category: 'bienestar' }
    ],
    posture: [
        { name: 'Corrige tu postura', description: 'Endereza la espalda y relaja los hombros', icon: '🕴️', category: 'postura' },
        { name: 'Estira los brazos', description: 'Levanta y estira por encima de la cabeza', icon: '🙆‍♂️', category: 'postura' },
        { name: 'Masajea tus hombros', description: 'Circular suavemente por 30 segundos', icon: '💆‍♂️', category: 'postura' },
        { name: 'Gira los hombros', description: '5 veces hacia adelante, 5 hacia atrás', icon: '🔄', category: 'postura' },
        { name: 'Estira la espalda', description: 'Gira suavemente el torso a ambos lados', icon: '↩️', category: 'postura' }
    ]
};

function getHabitDatabase() {
    return habitDatabase;
}

function renderPersonalizedHabits() {
    const container = document.getElementById('personal-habits');
    
    if (!container) return;
    
    if (window.AppState.personalizedHabits.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #718096; font-style: italic; padding: 60px;">
                <div style="font-size: 3em; margin-bottom: 20px;">📋</div>
                <h3>Sin hábitos personalizados</h3>
                <p>Completa la evaluación para generar tus micro hábitos únicos</p>
                <button class="btn btn-primary" onclick="navigateToScreen('survey')" style="margin-top: 20px;">
                    <span>🚀</span> Hacer Evaluación
                </button>
            </div>
        `;
        return;
    }
    
    // Agrupar hábitos por categoría
    const habitsByCategory = groupHabitsByCategory(window.AppState.personalizedHabits);
    
    container.innerHTML = Object.keys(habitsByCategory).map(category => `
        <div class="habit-category-section">
            <h3 class="category-title">${getCategoryIcon(category)} ${capitalizeFirst(category)}</h3>
            <div class="habits-category-grid">
                ${habitsByCategory[category].map(habit => `
                    <div class="habit-card" onclick="triggerSpecificHabit('${habit.name}')">
                        <div class="habit-category">${habit.category}</div>
                        <div class="habit-name">${habit.icon} ${habit.name}</div>
                        <div class="habit-description">${habit.description}</div>
                        <div class="habit-action">
                            <button class="btn-mini">Hacer Ahora</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Actualizar contador total
    const totalHabitsElement = document.getElementById('total-habits');
    if (totalHabitsElement) {
        totalHabitsElement.textContent = window.AppState.personalizedHabits.length;
    }
}

function groupHabitsByCategory(habits) {
    return habits.reduce((groups, habit) => {
        const category = habit.category || 'general';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(habit);
        return groups;
    }, {});
}

function getCategoryIcon(category) {
    const icons = {
        'hidratación': '💧',
        'ejercicio': '💪',
        'nutrición': '🥗',
        'bienestar': '🧘‍♂️',
        'postura': '🕴️',
        'general': '⚡'
    };
    return icons[category] || '⚡';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function triggerRandomHabit() {
    try {
        await ipcRenderer.invoke('trigger-random-habit');
        console.log('✅ Micro hábito aleatorio solicitado');
    } catch (error) {
        console.error('❌ Error solicitando micro hábito:', error);
        showNotification('Error activando micro hábito', 'error');
    }
}

async function triggerSpecificHabit(habitName) {
    const habit = window.AppState.personalizedHabits.find(h => h.name === habitName);
    if (habit) {
        showHabitPopup(habit);
    }
}

function showHabitPopup(habit) {
    const popupOverlay = document.getElementById('popup-overlay');
    const popupIcon = document.getElementById('popup-icon');
    const popupText = document.getElementById('popup-text');
    
    if (popupIcon) popupIcon.textContent = habit.icon;
    if (popupText) {
        popupText.innerHTML = `
            <strong>${habit.name}</strong><br>
            <small>${habit.description}</small>
        `;
    }
    
    if (popupOverlay) {
        popupOverlay.classList.add('show');
    }
    
    // Guardar hábito actual para completar
    window.AppState.currentHabitPopup = habit;
}

async function completeHabitFromPopup() {
    try {
        const newStats = await ipcRenderer.invoke('complete-habit-from-ui');
        window.AppState.stats = newStats;
        updateStatsDisplay();
        closeHabitPopup();
        showNotification('¡Excelente! Hábito completado 🎉', 'success');
    } catch (error) {
        console.error('❌ Error completando hábito:', error);
        showNotification('Error completando hábito', 'error');
    }
}

function closeHabitPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) {
        popupOverlay.classList.remove('show');
    }
    window.AppState.currentHabitPopup = null;
}

// Funciones de análisis de hábitos
function getHabitStats() {
    const total = window.AppState.personalizedHabits.length;
    const byCategory = groupHabitsByCategory(window.AppState.personalizedHabits);
    
    return {
        total,
        byCategory: Object.keys(byCategory).map(category => ({
            name: category,
            count: byCategory[category].length,
            percentage: Math.round((byCategory[category].length / total) * 100)
        }))
    };
}

function searchHabits(query) {
    if (!query.trim()) {
        return window.AppState.personalizedHabits;
    }
    
    return window.AppState.personalizedHabits.filter(habit => 
        habit.name.toLowerCase().includes(query.toLowerCase()) ||
        habit.description.toLowerCase().includes(query.toLowerCase()) ||
        habit.category.toLowerCase().includes(query.toLowerCase())
    );
}

function filterHabitsByCategory(category) {
    if (category === 'all') {
        return window.AppState.personalizedHabits;
    }
    
    return window.AppState.personalizedHabits.filter(habit => 
        habit.category === category
    );
}

// Agregar estilos adicionales para las categorías
const habitStyles = document.createElement('style');
habitStyles.textContent = `
    .habit-category-section {
        margin-bottom: 40px;
    }
    
    .category-title {
        font-size: 1.5em;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .habits-category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }
    
    .habit-action {
        margin-top: 15px;
        text-align: center;
    }
    
    .btn-mini {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-mini:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
`;
document.head.appendChild(habitStyles);

console.log('✅ Habits.js cargado');