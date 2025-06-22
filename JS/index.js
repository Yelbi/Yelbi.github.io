// Configuración
const CONFIG = {
    scrollDelay: 800,
    wheelDebounce: 50,
    swipeThreshold: 50,
    scrollIndicatorDelay: 5000
};

// Variables globales
let currentSection = 0;
let isScrolling = false;
let wheelTimeout;
let touchStartY = 0;
let touchEndY = 0;
let scrollIndicatorTimeout;

// Cache de elementos DOM
const elements = {
    sections: document.querySelectorAll('.section'),
    navDots: document.querySelectorAll('.nav-dot'),
    container: document.getElementById('container'),
    scrollIndicator: document.getElementById('scrollIndicator'),
    menuToggle: document.getElementById('menuToggle'),
    navMenu: document.getElementById('navMenu')
};

// Validación de elementos requeridos
function validateElements() {
    const required = ['sections', 'container'];
    const missing = required.filter(key => !elements[key] || elements[key].length === 0);
    
    if (missing.length > 0) {
        console.error('Elementos requeridos no encontrados:', missing);
        return false;
    }
    return true;
}

// Función principal de navegación
function goToSection(index) {
    if (index < 0 || index >= elements.sections.length || isScrolling) {
        return;
    }
    
    isScrolling = true;
    currentSection = index;
    
    // Scroll suave a la sección
    elements.sections[currentSection].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    updateActiveSection();
    handleScrollIndicator();
    
    // Reset del flag después del delay
    setTimeout(() => {
        isScrolling = false;
    }, CONFIG.scrollDelay);
}

// Actualizar sección activa
function updateActiveSection() {
    elements.sections.forEach((section, index) => {
        section.classList.toggle('active', index === currentSection);
    });
    
    // Solo actualizar nav dots si existen
    if (elements.navDots.length > 0) {
        elements.navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSection);
        });
    }
}

// Manejar indicador de scroll
function handleScrollIndicator() {
    if (!elements.scrollIndicator) return;
    
    if (currentSection > 0) {
        elements.scrollIndicator.classList.add('hidden');
    } else {
        elements.scrollIndicator.classList.remove('hidden');
    }
}

// Event listeners para navegación con dots
function initNavDots() {
    if (elements.navDots.length === 0) return;
    
    elements.navDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSection(index);
        });
    });
}

// Event listener para wheel con debounce mejorado
function initWheelNavigation() {
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isScrolling) return;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            const direction = e.deltaY > 0 ? 1 : -1;
            goToSection(currentSection + direction);
        }, CONFIG.wheelDebounce);
    }, { passive: false });
}

// Event listeners para teclado
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case 'PageDown':
                e.preventDefault();
                goToSection(currentSection + 1);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                goToSection(currentSection - 1);
                break;
            case 'Home':
                e.preventDefault();
                goToSection(0);
                break;
            case 'End':
                e.preventDefault();
                goToSection(elements.sections.length - 1);
                break;
        }
    });
}

// Event listeners para touch
function initTouchNavigation() {
    if (!elements.container) return;
    
    elements.container.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    elements.container.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
}

// Manejar gestos de swipe
function handleSwipe() {
    if (isScrolling) return;
    
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > CONFIG.swipeThreshold) {
        const direction = diff > 0 ? 1 : -1;
        goToSection(currentSection + direction);
    }
}

// Inicializar indicador de scroll
function initScrollIndicator() {
    if (!elements.scrollIndicator) return;
    
    // Mostrar indicador después del delay si estamos en la primera sección
    scrollIndicatorTimeout = setTimeout(() => {
        if (currentSection === 0) {
            elements.scrollIndicator.style.opacity = '0.7';
        }
    }, CONFIG.scrollIndicatorDelay);
}

// Función para ir a una sección específica por nombre/id
function goToSectionByName(sectionName) {
    const sectionIndex = Array.from(elements.sections).findIndex(
        section => section.id === sectionName || section.dataset.name === sectionName
    );
    
    if (sectionIndex !== -1) {
        goToSection(sectionIndex);
        return true;
    }
    return false;
}

// Obtener información del estado actual
function getCurrentState() {
    return {
        currentSection,
        totalSections: elements.sections.length,
        isScrolling,
        sectionId: elements.sections[currentSection]?.id || null
    };
}

// Función de limpieza
function cleanup() {
    clearTimeout(wheelTimeout);
    clearTimeout(scrollIndicatorTimeout);
}

// Inicialización principal
function init() {
    if (!validateElements()) {
        return false;
    }
    
    // Inicializar todos los event listeners
    initNavDots();
    initWheelNavigation();
    initKeyboardNavigation();
    initTouchNavigation();
    initScrollIndicator();
    
    // Establecer estado inicial
    updateActiveSection();
    handleScrollIndicator();
    
    console.log('Navigation initialized successfully');
    return true;
}

// Event listener para cleanup cuando se cierra la página
window.addEventListener('beforeunload', cleanup);

// API pública para control externo
window.navigationControls = {
    goToSection,
    goToSectionByName,
    getCurrentState,
    next: () => goToSection(currentSection + 1),
    prev: () => goToSection(currentSection - 1),
    first: () => goToSection(0),
    last: () => goToSection(elements.sections.length - 1)
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}