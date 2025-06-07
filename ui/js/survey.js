// Sistema de encuesta y evaluación inicial

let currentQuestionIndex = 0;
let surveyAnswers = {};

// Base de datos de preguntas
const surveyQuestions = [
    {
        id: 'hydration',
        title: '💧 ¿Cuántos vasos de agua bebes al día?',
        options: [
            { value: 1, text: 'Menos de 4 vasos', icon: '🥵' },
            { value: 2, text: '4-6 vasos', icon: '💧' },
            { value: 3, text: '7-8 vasos', icon: '💦' },
            { value: 4, text: 'Más de 8 vasos', icon: '🌊' }
        ]
    },
    {
        id: 'exercise',
        title: '🏃‍♂️ ¿Con qué frecuencia haces ejercicio?',
        options: [
            { value: 1, text: 'Nunca o casi nunca', icon: '😴' },
            { value: 2, text: '1-2 veces por semana', icon: '🚶‍♂️' },
            { value: 3, text: '3-4 veces por semana', icon: '🏃‍♂️' },
            { value: 4, text: 'Diariamente', icon: '💪' }
        ]
    },
    {
        id: 'nutrition',
        title: '🥗 ¿Cómo describirías tu alimentación?',
        options: [
            { value: 1, text: 'Principalmente comida procesada', icon: '🍟' },
            { value: 2, text: 'Mezcla de procesada y casera', icon: '🍽️' },
            { value: 3, text: 'Mayormente casera y balanceada', icon: '🥗' },
            { value: 4, text: 'Muy saludable y planificada', icon: '🌱' }
        ]
    },
    {
        id: 'sleep',
        title: '😴 ¿Cuántas horas duermes por noche?',
        options: [
            { value: 1, text: 'Menos de 6 horas', icon: '😵' },
            { value: 2, text: '6-7 horas', icon: '😪' },
            { value: 3, text: '7-8 horas', icon: '😌' },
            { value: 4, text: 'Más de 8 horas', icon: '😴' }
        ]
    },
    {
        id: 'stress',
        title: '😰 ¿Cómo manejas el estrés?',
        options: [
            { value: 1, text: 'Me siento estresado constantemente', icon: '😫' },
            { value: 2, text: 'A veces me supera', icon: '😓' },
            { value: 3, text: 'Tengo algunas técnicas que me ayudan', icon: '😮‍💨' },
            { value: 4, text: 'Manejo bien el estrés', icon: '😌' }
        ]
    },
    {
        id: 'goals',
        title: '🎯 ¿Cuál es tu objetivo principal?',
        options: [
            { value: 'health', text: 'Mejorar mi salud general', icon: '❤️' },
            { value: 'energy', text: 'Tener más energía', icon: '⚡' },
            { value: 'weight', text: 'Controlar mi peso', icon: '⚖️' },
            { value: 'mental', text: 'Reducir estrés y ansiedad', icon: '🧘‍♂️' }
        ]
    }
];

function initializeSurvey() {
    currentQuestionIndex = 0;
    surveyAnswers = {};
    renderQuestion();
}

function renderQuestion() {
    const question = surveyQuestions[currentQuestionIndex];
    const questionsContainer = document.getElementById('survey-questions');
    
    questionsContainer.innerHTML = `
        <div class="question-container">
            <div class="question-title">${question.title}</div>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <div class="option-card" onclick="selectOption('${question.id}', ${typeof option.value === 'string' ? `'${option.value}'` : option.value}, ${index})">
                        <span class="option-icon">${option.icon}</span>
                        <span class="option-text">${option.text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    updateProgress();
    updateButtons();
}

function selectOption(questionId, value, index) {
    surveyAnswers[questionId] = value;
    
    // Marcar visualmente la opción seleccionada
    document.querySelectorAll('.option-card').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.option-card')[index].classList.add('selected');
    
    // Auto-avanzar después de seleccionar
    setTimeout(() => {
        if (currentQuestionIndex < surveyQuestions.length - 1) {
            nextQuestion();
        } else {
            showFinishButton();
        }
    }, 800);
}

function nextQuestion() {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    const progressCounter = document.getElementById('progress-counter');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressCounter) {
        progressCounter.textContent = `${currentQuestionIndex + 1} / ${surveyQuestions.length}`;
    }
}

function updateButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-flex' : 'none';
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentQuestionIndex < surveyQuestions.length - 1 ? 'inline-flex' : 'none';
    }
    
    if (finishBtn) {
        finishBtn.style.display = 'none';
    }
}

function showFinishButton() {
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');
    
    if (nextBtn) nextBtn.style.display = 'none';
    if (finishBtn) finishBtn.style.display = 'inline-flex';
}

async function finishSurvey() {
    try {
        // Mostrar loading
        const finishBtn = document.getElementById('finish-btn');
        if (finishBtn) {
            finishBtn.innerHTML = '<span>⏳</span> Generando...';
            finishBtn.disabled = true;
        }
        
        // Guardar perfil del usuario
        await ipcRenderer.invoke('save-user-profile', surveyAnswers);
        window.AppState.userProfile = surveyAnswers;
        
        // Generar hábitos personalizados
        const personalizedHabits = generatePersonalizedHabits();
        
        // Guardar hábitos generados
        await ipcRenderer.invoke('save-personalized-habits', personalizedHabits);
        window.AppState.personalizedHabits = personalizedHabits;
        
        // Mostrar pantalla de hábitos
        setTimeout(() => {
            navigateToScreen('habits');
            setActiveNavLink('habits');
            showNotification(`¡Perfecto! ${personalizedHabits.length} micro hábitos generados para ti 🎉`, 'success');
        }, 1000);
        
        console.log('✅ Encuesta completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error completando encuesta:', error);
        showNotification('Error generando hábitos. Intenta nuevamente.', 'error');
        
        // Restaurar botón
        const finishBtn = document.getElementById('finish-btn');
        if (finishBtn) {
            finishBtn.innerHTML = '<span>✨</span> Generar Hábitos';
            finishBtn.disabled = false;
        }
    }
}

function generatePersonalizedHabits() {
    let habits = [];
    
    // Obtener base de datos de hábitos desde habits.js
    const habitDatabase = getHabitDatabase();
    
    // Generar hábitos basados en las respuestas
    if (surveyAnswers.hydration <= 2) {
        habits.push(...habitDatabase.hydration);
    }
    
    if (surveyAnswers.exercise <= 2) {
        habits.push(...habitDatabase.exercise);
    }
    
    if (surveyAnswers.nutrition <= 2) {
        habits.push(...habitDatabase.nutrition);
    }
    
    if (surveyAnswers.stress <= 2 || surveyAnswers.goals === 'mental') {
        habits.push(...habitDatabase.mental);
    }
    
    // Siempre incluir hábitos de postura
    habits.push(...habitDatabase.posture);
    
    // Hábitos adicionales según objetivos
    if (surveyAnswers.goals === 'energy') {
        habits.push(...habitDatabase.exercise.slice(0, 3));
    }
    
    if (surveyAnswers.goals === 'health') {
        habits.push(...habitDatabase.nutrition);
    }
    
    if (surveyAnswers.goals === 'weight') {
        habits.push(...habitDatabase.exercise);
        habits.push(...habitDatabase.nutrition.slice(0, 2));
    }
    
    // Eliminar duplicados
    habits = habits.filter((habit, index, self) => 
        index === self.findIndex(h => h.name === habit.name)
    );
    
    // Mezclar aleatoriamente
    habits = shuffleArray(habits);
    
    console.log(`✅ ${habits.length} hábitos personalizados generados`);
    return habits;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Función para reiniciar la encuesta
function resetSurvey() {
    currentQuestionIndex = 0;
    surveyAnswers = {};
    window.AppState.userProfile = null;
    window.AppState.personalizedHabits = [];
    
    navigateToScreen('survey');
    setActiveNavLink('survey');
    initializeSurvey();
}

console.log('✅ Survey.js cargado');