// Utilidades de interfaz de usuario y efectos visuales

// Inicialización de componentes UI
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    initializeAnimations();
    initializeKeyboardShortcuts();
    console.log('✅ UI utilities inicializadas');
});

// Sistema de tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    if (!tooltipText) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    // Posicionar tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    // Animación de entrada
    requestAnimationFrame(() => {
        tooltip.classList.add('show');
    });
    
    element._tooltip = tooltip;
}

function hideTooltip(event) {
    const element = event.target;
    const tooltip = element._tooltip;
    
    if (tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 200);
        delete element._tooltip;
    }
}

// Sistema de animaciones
function initializeAnimations() {
    // Intersection Observer para animaciones al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar elementos con clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Efectos de partículas para celebración
function createCelebrationEffect(x = null, y = null) {
    const colors = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565'];
    const particleCount = 15;
    
    // Usar posición del mouse o centro de pantalla
    const centerX = x || window.innerWidth / 2;
    const centerY = y || window.innerHeight / 2;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(centerX, centerY, colors[Math.floor(Math.random() * colors.length)]);
    }
}

function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.className = 'celebration-particle';
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
    `;
    
    document.body.appendChild(particle);
    
    // Animación de la partícula
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 100;
    const gravity = 300;
    const life = 1000 + Math.random() * 500;
    
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 200;
    
    const startTime = performance.now();
    
    function animateParticle(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = elapsed / life;
        
        if (progress >= 1) {
            particle.remove();
            return;
        }
        
        const newX = x + vx * (elapsed / 1000);
        const newY = y + vy * (elapsed / 1000) + 0.5 * gravity * Math.pow(elapsed / 1000, 2);
        
        particle.style.left = newX + 'px';
        particle.style.top = newY + 'px';
        particle.style.opacity = 1 - progress;
        particle.style.transform = `scale(${1 - progress * 0.5})`;
        
        requestAnimationFrame(animateParticle);
    }
    
    requestAnimationFrame(animateParticle);
}

// Atajos de teclado
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Verificar si estamos en un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Atajos con Ctrl/Cmd
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    saveAllData();
                    break;
                case '1':
                    event.preventDefault();
                    navigateToScreen('welcome');
                    break;
                case '2':
                    event.preventDefault();
                    navigateToScreen('survey');
                    break;
                case '3':
                    event.preventDefault();
                    navigateToScreen('dashboard');
                    break;
                case '4':
                    event.preventDefault();
                    navigateToScreen('habits');
                    break;
                case '5':
                    event.preventDefault();
                    navigateToScreen('settings');
                    break;
            }
        }
        
        // Atajos simples
        switch (event.key) {
            case 'Escape':
                closeHabitPopup();
                break;
            case ' ':
                if (event.target === document.body) {
                    event.preventDefault();
                    triggerRandomHabit();
                }
                break;
        }
    });
}

// Efectos de hover mejorados
function addAdvancedHoverEffects() {
    document.querySelectorAll('.btn, .nav-link, .habit-card').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'translateY(0)';
        });
    });
}

// Loader/Spinner utilities
function showLoader(message = 'Cargando...') {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="spinner"></div>
            <div class="loader-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    requestAnimationFrame(() => {
        loader.classList.add('show');
    });
    
    return loader;
}

function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.remove('show');
        setTimeout(() => {
            if (loader.parentNode) {
                loader.remove();
            }
        }, 300);
    }
}

// Modal system
function showModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${actions.map(action => `
                    <button class="btn ${action.class || 'btn-secondary'}" 
                            onclick="${action.onclick || 'closeModal()'}">
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar con ESC o click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    window.currentModal = modal;
    return modal;
}

function closeModal() {
    const modal = window.currentModal;
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        window.currentModal = null;
    }
}

// Utilidades de formateo
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', options);
}

function timeAgo(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
        return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
        return 'hace un momento';
    }
}

// Utilidades de color
function getRandomColor() {
    const colors = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565', '#9f7aea'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Debounce utility
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle utility
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Agregar estilos CSS para componentes UI
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    /* Tooltips */
    .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        white-space: nowrap;
        z-index: 10000;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease;
        pointer-events: none;
    }
    
    .tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.8);
    }
    
    /* Loader */
    .loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .loader-overlay.show {
        opacity: 1;
    }
    
    .loader-content {
        text-align: center;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    .loader-message {
        color: #4a5568;
        font-weight: 600;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .modal-overlay.show {
        opacity: 1;
    }
    
    .modal-content {
        background: white;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        transform: scale(0.9) translateY(-20px);
        transition: transform 0.3s ease;
    }
    
    .modal-overlay.show .modal-content {
        transform: scale(1) translateY(0);
    }
    
    .modal-header {
        padding: 20px 30px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #2d3748;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #718096;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: #f7fafc;
        color: #2d3748;
    }
    
    .modal-body {
        padding: 30px;
    }
    
    .modal-footer {
        padding: 20px 30px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 15px;
        justify-content: flex-end;
    }
    
    /* Animaciones */
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Celebration particles */
    .celebration-particle {
        animation: particleFade 1.5s ease-out forwards;
    }
    
    @keyframes particleFade {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(uiStyles);

console.log('✅ UI.js cargado');