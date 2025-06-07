// Sistema de estadísticas y métricas

function updateStatsDisplay() {
    updateBasicStats();
    updateSuccessRate();
    updateProgressIndicators();
}

function updateBasicStats() {
    const stats = window.AppState.stats;
    
    // Actualizar estadísticas básicas
    const completedTodayElement = document.getElementById('completed-today');
    if (completedTodayElement) {
        completedTodayElement.textContent = stats.completedToday || 0;
        animateStatNumber(completedTodayElement);
    }
    
    const currentStreakElement = document.getElementById('current-streak');
    if (currentStreakElement) {
        currentStreakElement.textContent = stats.currentStreak || 0;
        animateStatNumber(currentStreakElement);
    }
    
    const totalHabitsElement = document.getElementById('total-habits');
    if (totalHabitsElement) {
        totalHabitsElement.textContent = window.AppState.personalizedHabits.length || 0;
        animateStatNumber(totalHabitsElement);
    }
}

function updateSuccessRate() {
    const successRateElement = document.getElementById('success-rate');
    if (!successRateElement) return;
    
    const rate = calculateSuccessRate();
    successRateElement.textContent = `${rate}%`;
    animateStatNumber(successRateElement);
    
    // Cambiar color según la tasa de éxito
    const statCard = successRateElement.closest('.stat-card');
    if (statCard) {
        if (rate >= 80) {
            statCard.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        } else if (rate >= 60) {
            statCard.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
        } else {
            statCard.style.background = 'linear-gradient(135deg, #fc8181, #f56565)';
        }
    }
}

function calculateSuccessRate() {
    const stats = window.AppState.stats;
    const totalHabits = window.AppState.personalizedHabits.length;
    
    if (totalHabits === 0) return 0;
    
    // Calcular basado en los últimos 7 días (simplificado para demo)
    const completedToday = stats.completedToday || 0;
    const expectedToday = Math.min(totalHabits, 10); // Máximo 10 hábitos esperados por día
    
    if (expectedToday === 0) return 0;
    
    return Math.min(100, Math.round((completedToday / expectedToday) * 100));
}

function updateProgressIndicators() {
    updateStreakIndicator();
    updateDailyProgress();
    updateWeeklyOverview();
}

function updateStreakIndicator() {
    const streak = window.AppState.stats.currentStreak || 0;
    const streakElement = document.getElementById('streak-indicator');
    
    if (streakElement) {
        let message = '';
        let color = '';
        
        if (streak === 0) {
            message = '¡Empezá tu racha hoy! 🚀';
            color = '#667eea';
        } else if (streak === 1) {
            message = '¡Genial! Primer día completado 🎉';
            color = '#48bb78';
        } else if (streak < 7) {
            message = `¡${streak} días seguidos! Seguí así 💪`;
            color = '#ed8936';
        } else if (streak < 30) {
            message = `¡Increíble! ${streak} días de racha 🔥`;
            color = '#f56565';
        } else {
            message = `¡LEGENDARIO! ${streak} días 👑`;
            color = '#9f7aea';
        }
        
        streakElement.innerHTML = `
            <div style="color: ${color}; font-weight: bold;">
                ${message}
            </div>
        `;
    }
}

function updateDailyProgress() {
    const progressElement = document.getElementById('daily-progress');
    if (!progressElement) return;
    
    const completed = window.AppState.stats.completedToday || 0;
    const target = Math.min(window.AppState.personalizedHabits.length, 8); // Target máximo 8 por día
    
    const percentage = target > 0 ? Math.min(100, (completed / target) * 100) : 0;
    
    progressElement.innerHTML = `
        <div class="progress-header">
            <span>Progreso Diario</span>
            <span>${completed}/${target}</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-message">
            ${getProgressMessage(percentage)}
        </div>
    `;
}

function getProgressMessage(percentage) {
    if (percentage === 0) return '¡Empezá con tu primer micro hábito! 🌟';
    if (percentage < 25) return '¡Buen comienzo! Seguí sumando 🚀';
    if (percentage < 50) return '¡Vas por buen camino! 💪';
    if (percentage < 75) return '¡Excelente progreso! 🔥';
    if (percentage < 100) return '¡Casi llegás a la meta! 🏆';
    return '¡META CUMPLIDA! Sos increíble 👑';
}

function updateWeeklyOverview() {
    const weeklyElement = document.getElementById('weekly-overview');
    if (!weeklyElement) return;
    
    // Generar vista semanal simple (demo)
    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const today = new Date().getDay();
    
    const weeklyHTML = weekDays.map((day, index) => {
        const isToday = index === (today === 0 ? 6 : today - 1);
        const isCompleted = isToday && window.AppState.stats.completedToday > 0;
        
        return `
            <div class="week-day ${isToday ? 'today' : ''} ${isCompleted ? 'completed' : ''}">
                <div class="day-letter">${day}</div>
                <div class="day-indicator">
                    ${isCompleted ? '✅' : isToday ? '⏳' : '⭕'}
                </div>
            </div>
        `;
    }).join('');
    
    weeklyElement.innerHTML = `
        <h4>Vista Semanal</h4>
        <div class="week-grid">
            ${weeklyHTML}
        </div>
    `;
}

function animateStatNumber(element) {
    if (!element) return;
    
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Funciones de análisis avanzado
function getDetailedStats() {
    const stats = window.AppState.stats;
    const habits = window.AppState.personalizedHabits;
    
    return {
        basic: {
            completedToday: stats.completedToday || 0,
            currentStreak: stats.currentStreak || 0,
            totalHabits: habits.length,
            successRate: calculateSuccessRate()
        },
        analysis: {
            averagePerDay: calculateAveragePerDay(),
            bestStreak: stats.bestStreak || stats.currentStreak || 0,
            totalCompleted: stats.totalCompleted || 0,
            habitsByCategory: getHabitsByCategory()
        },
        recommendations: generateRecommendations()
    };
}

function calculateAveragePerDay() {
    // Simplificado - en una app real calcularías basado en historial
    const stats = window.AppState.stats;
    return stats.completedToday || 0;
}

function getHabitsByCategory() {
    const habits = window.AppState.personalizedHabits;
    const categories = {};
    
    habits.forEach(habit => {
        const category = habit.category || 'general';
        categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
}

function generateRecommendations() {
    const recommendations = [];
    const stats = window.AppState.stats;
    const completedToday = stats.completedToday || 0;
    
    if (completedToday === 0) {
        recommendations.push({
            type: 'start',
            message: '¡Empezá con un micro hábito de 30 segundos!',
            priority: 'high'
        });
    } else if (completedToday < 3) {
        recommendations.push({
            type: 'increase',
            message: 'Intentá completar 1-2 hábitos más hoy',
            priority: 'medium'
        });
    } else {
        recommendations.push({
            type: 'maintain',
            message: '¡Excelente día! Mantené este ritmo',
            priority: 'low'
        });
    }
    
    // Recomendación de racha
    if (stats.currentStreak >= 7) {
        recommendations.push({
            type: 'streak',
            message: '¡Tu racha es increíble! No la rompas ahora',
            priority: 'high'
        });
    }
    
    return recommendations;
}

function exportStatsReport() {
    const detailedStats = getDetailedStats();
    const report = {
        generatedAt: new Date().toISOString(),
        period: 'current',
        data: detailedStats
    };
    
    const reportStr = JSON.stringify(report, null, 2);
    const blob = new Blob([reportStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ponete-las-pilas-stats-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    showNotification('📊 Reporte de estadísticas exportado', 'success');
}

// Agregar estilos para los componentes de estadísticas
const statsStyles = document.createElement('style');
statsStyles.textContent = `
    .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-weight: 600;
        color: #2d3748;
    }
    
    .progress-bar-container {
        width: 100%;
        height: 10px;
        background: #e2e8f0;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 5px;
        transition: width 0.8s ease;
        position: relative;
    }
    
    .progress-bar-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: progressShine 2s ease-in-out infinite;
    }
    
    .progress-message {
        font-size: 14px;
        color: #718096;
        text-align: center;
        font-style: italic;
    }
    
    .week-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 10px;
        margin-top: 15px;
    }
    
    .week-day {
        text-align: center;
        padding: 10px 5px;
        border-radius: 10px;
        background: #f7fafc;
        border: 2px solid #e2e8f0;
        transition: all 0.3s ease;
    }
    
    .week-day.today {
        border-color: #667eea;
        background: #eef2ff;
    }
    
    .week-day.completed {
        background: #d4edda;
        border-color: #48bb78;
    }
    
    .day-letter {
        font-weight: 600;
        font-size: 12px;
        color: #4a5568;
        margin-bottom: 5px;
    }
    
    .day-indicator {
        font-size: 16px;
    }
    
    @keyframes progressShine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
`;
document.head.appendChild(statsStyles);

console.log('✅ Stats.js cargado');