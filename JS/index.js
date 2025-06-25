// Configuración adaptativa basada en dispositivo
const DEVICE = {
    isMobile: window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window,
    hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// Configuración optimizada por dispositivo
const CONFIG = {
    scrollDelay: DEVICE.isMobile ? 1200 : 900,
    wheelDebounce: DEVICE.isMobile ? 150 : 80,
    swipeThreshold: DEVICE.isMobile ? 40 : 60,
    scrollIndicatorDelay: DEVICE.hasReducedMotion ? 1000 : 3000,
    minSwipeVelocity: 0.3, // px/ms
    maxSwipeDuration: 400,
    intersectionThreshold: 0.5
};

// Estado de la aplicación
const state = {
    currentSection: 0,
    isScrolling: false,
    isInitialized: false,
    lastWheelTime: 0,
    touchData: {
        startY: 0,
        startTime: 0,
        isActive: false
    }
};

// Cache optimizado de elementos DOM
const dom = {
    sections: null,
    navDots: null,
    container: null,
    scrollIndicator: null,
    menuToggle: null,
    navMenu: null
};

// Timers centralizados
const timers = {
    wheel: null,
    scrollReset: null,
    scrollIndicator: null,
    debounce: null
};

// Inicialización del DOM con error handling
function initializeDOM() {
    try {
        dom.sections = document.querySelectorAll('.section');
        dom.navDots = document.querySelectorAll('.nav-dot');
        dom.container = document.getElementById('container') || document.body;
        dom.scrollIndicator = document.getElementById('scrollIndicator');
        dom.menuToggle = document.getElementById('menuToggle');
        dom.navMenu = document.getElementById('navMenu');
        
        return dom.sections.length > 0;
    } catch (error) {
        console.error('Error initializing DOM:', error);
        return false;
    }
}

// Observer para detectar cambios de sección
let intersectionObserver = null;

function initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return false;
    
    intersectionObserver = new IntersectionObserver((entries) => {
        if (state.isScrolling) return;
        
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.intersectionThreshold) {
                const sectionIndex = Array.from(dom.sections).indexOf(entry.target);
                if (sectionIndex !== -1 && sectionIndex !== state.currentSection) {
                    updateCurrentSection(sectionIndex, false);
                }
            }
        });
    }, {
        threshold: [CONFIG.intersectionThreshold],
        rootMargin: '-10% 0px'
    });
    
    dom.sections.forEach(section => {
        intersectionObserver.observe(section);
    });
    
    return true;
}

// Función principal de navegación optimizada
function goToSection(index, smooth = true) {
    // Validación de entrada
    if (!Number.isInteger(index) || index < 0 || index >= dom.sections.length) {
        return false;
    }
    
    if (state.isScrolling && Math.abs(index - state.currentSection) <= 1) {
        return false;
    }
    
    // Prevenir múltiples llamadas rápidas
    if (timers.debounce) {
        clearTimeout(timers.debounce);
    }
    
    timers.debounce = setTimeout(() => {
        executeNavigation(index, smooth);
    }, 16); // Un frame a 60fps
    
    return true;
}

// Ejecutar navegación con optimizaciones
function executeNavigation(index, smooth) {
    state.isScrolling = true;
    const previousSection = state.currentSection;
    state.currentSection = index;
    
    // Navegación optimizada
    const targetSection = dom.sections[index];
    const scrollOptions = {
        behavior: smooth && !DEVICE.hasReducedMotion ? 'smooth' : 'auto',
        block: 'start',
        inline: 'nearest'
    };
    
    // Usar requestAnimationFrame para mejor timing
    requestAnimationFrame(() => {
        targetSection.scrollIntoView(scrollOptions);
        updateCurrentSection(index, true);
        
        // Callback personalizado si existe
        if (typeof window.onSectionChange === 'function') {
            window.onSectionChange(index, previousSection);
        }
    });
    
    // Reset optimizado del flag
    clearTimeout(timers.scrollReset);
    timers.scrollReset = setTimeout(() => {
        state.isScrolling = false;
    }, CONFIG.scrollDelay);
}

// Actualización optimizada de sección activa
function updateCurrentSection(index, updateURL = false) {
    const previousIndex = state.currentSection;
    state.currentSection = index;
    
    // Batch DOM updates
    requestAnimationFrame(() => {
        // Actualizar clases de secciones
        dom.sections.forEach((section, i) => {
            const isActive = i === index;
            section.classList.toggle('active', isActive);
            section.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
        
        // Actualizar navegación
        if (dom.navDots.length > 0) {
            dom.navDots.forEach((dot, i) => {
                const isActive = i === index;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
        }
        
        // Manejar indicador de scroll
        handleScrollIndicator();
        
        // Actualizar URL si es necesario
        if (updateURL && history.pushState) {
            const section = dom.sections[index];
            const sectionId = section.id || section.dataset.name;
            if (sectionId) {
                history.pushState({ section: index }, '', `#${sectionId}`);
            }
        }
    });
}

// Manejo optimizado del indicador de scroll
function handleScrollIndicator() {
    if (!dom.scrollIndicator) return;
    
    clearTimeout(timers.scrollIndicator);
    
    if (state.currentSection === 0) {
        dom.scrollIndicator.classList.remove('hidden');
        timers.scrollIndicator = setTimeout(() => {
            if (state.currentSection === 0) {
                dom.scrollIndicator.style.opacity = '0.7';
            }
        }, CONFIG.scrollIndicatorDelay);
    } else {
        dom.scrollIndicator.classList.add('hidden');
        dom.scrollIndicator.style.opacity = '0';
    }
}

// Event listeners optimizados
function initEventListeners() {
    // Navegación por dots con delegación de eventos
    if (dom.navDots.length > 0) {
        document.addEventListener('click', (e) => {
            const dot = e.target.closest('.nav-dot');
            if (dot) {
                e.preventDefault();
                const index = Array.from(dom.navDots).indexOf(dot);
                if (index !== -1) goToSection(index);
            }
        });
    }
    
    // Navegación por teclado mejorada
    document.addEventListener('keydown', handleKeyNavigation, { passive: false });
    
    // Navegación por rueda (solo desktop)
    if (!DEVICE.isMobile) {
        document.addEventListener('wheel', handleWheelNavigation, { passive: false });
    }
    
    // Navegación táctil optimizada
    if (DEVICE.isTouch) {
        initTouchNavigation();
    }
    
    // History API
    window.addEventListener('popstate', handlePopState);
    
    // Redimensionamiento
    window.addEventListener('resize', debounce(handleResize, 150), { passive: true });
}

// Manejo de navegación por teclado
function handleKeyNavigation(e) {
    if (state.isScrolling || e.defaultPrevented) return;
    
    const keyActions = {
        'ArrowDown': () => goToSection(state.currentSection + 1),
        'ArrowUp': () => goToSection(state.currentSection - 1),
        'ArrowRight': () => goToSection(state.currentSection + 1),
        'ArrowLeft': () => goToSection(state.currentSection - 1),
        'PageDown': () => goToSection(state.currentSection + 1),
        'PageUp': () => goToSection(state.currentSection - 1),
        'Home': () => goToSection(0),
        'End': () => goToSection(dom.sections.length - 1),
        'Space': () => goToSection(state.currentSection + 1)
    };
    
    const action = keyActions[e.key];
    if (action) {
        e.preventDefault();
        action();
    }
}

// Manejo optimizado de navegación por rueda
function handleWheelNavigation(e) {
    if (state.isScrolling) {
        e.preventDefault();
        return;
    }
    
    const now = Date.now();
    if (now - state.lastWheelTime < CONFIG.wheelDebounce) {
        e.preventDefault();
        return;
    }
    
    e.preventDefault();
    state.lastWheelTime = now;
    
    clearTimeout(timers.wheel);
    timers.wheel = setTimeout(() => {
        const direction = e.deltaY > 0 ? 1 : -1;
        goToSection(state.currentSection + direction);
    }, 16);
}

// Navegación táctil mejorada
function initTouchNavigation() {
    let touchStarted = false;
    
    dom.container.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        
        touchStarted = true;
        state.touchData = {
            startY: e.touches[0].clientY,
            startTime: Date.now(),
            isActive: true
        };
    }, { passive: true });
    
    dom.container.addEventListener('touchmove', (e) => {
        if (!touchStarted || !state.touchData.isActive) return;
        
        // Prevenir scroll nativo en navegación vertical
        if (Math.abs(e.touches[0].clientY - state.touchData.startY) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    dom.container.addEventListener('touchend', (e) => {
        if (!touchStarted || !state.touchData.isActive) return;
        
        touchStarted = false;
        const touchEnd = e.changedTouches[0];
        const duration = Date.now() - state.touchData.startTime;
        const distance = state.touchData.startY - touchEnd.clientY;
        const velocity = Math.abs(distance) / duration;
        
        // Validar gesto
        if (duration < CONFIG.maxSwipeDuration && 
            Math.abs(distance) > CONFIG.swipeThreshold && 
            velocity > CONFIG.minSwipeVelocity) {
            
            const direction = distance > 0 ? 1 : -1;
            goToSection(state.currentSection + direction);
        }
        
        state.touchData.isActive = false;
    }, { passive: true });
}

// Manejo del historial
function handlePopState(e) {
    if (e.state && typeof e.state.section === 'number') {
        goToSection(e.state.section, false);
    } else {
        // Intentar obtener sección del hash
        const hash = window.location.hash.slice(1);
        if (hash) {
            goToSectionByName(hash);
        }
    }
}

// Manejo de redimensionamiento
function handleResize() {
    // Recalcular si cambió de móvil a desktop o viceversa
    const wasMobile = DEVICE.isMobile;
    DEVICE.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== DEVICE.isMobile) {
        // Reinicializar configuración
        CONFIG.scrollDelay = DEVICE.isMobile ? 1200 : 900;
        CONFIG.wheelDebounce = DEVICE.isMobile ? 150 : 80;
        
        // Reconfigurar eventos si es necesario
        if (DEVICE.isMobile && intersectionObserver) {
            document.removeEventListener('wheel', handleWheelNavigation);
        } else if (!DEVICE.isMobile && !intersectionObserver) {
            document.addEventListener('wheel', handleWheelNavigation, { passive: false });
        }
    }
}

// Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para ir a sección por nombre
function goToSectionByName(sectionName) {
    const index = Array.from(dom.sections).findIndex(
        section => section.id === sectionName || section.dataset.name === sectionName
    );
    return index !== -1 ? goToSection(index) : false;
}

// Obtener estado actual
function getCurrentState() {
    return {
        currentSection: state.currentSection,
        totalSections: dom.sections.length,
        isScrolling: state.isScrolling,
        sectionId: dom.sections[state.currentSection]?.id || null,
        isInitialized: state.isInitialized
    };
}

// Función de limpieza completa
function cleanup() {
    // Limpiar todos los timers
    Object.values(timers).forEach(timer => {
        if (timer) clearTimeout(timer);
    });
    
    // Limpiar observers
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
    }
    
    // Limpiar event listeners
    document.removeEventListener('keydown', handleKeyNavigation);
    document.removeEventListener('wheel', handleWheelNavigation);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('resize', handleResize);
    
    state.isInitialized = false;
}

// Inicialización principal mejorada
function init() {
    if (state.isInitialized) {
        console.warn('Navigation already initialized');
        return true;
    }
    
    if (!initializeDOM()) {
        console.error('Failed to initialize DOM elements');
        return false;
    }
    
    // Configurar estado inicial
    updateCurrentSection(0);
    
    // Inicializar observers si están disponibles
    const hasIntersectionObserver = initIntersectionObserver();
    
    // Inicializar event listeners
    initEventListeners();
    
    // Manejar URL inicial
    const hash = window.location.hash.slice(1);
    if (hash) {
        requestAnimationFrame(() => goToSectionByName(hash));
    }
    
    state.isInitialized = true;
    
    console.log('Navigation initialized:', {
        sections: dom.sections.length,
        hasIntersectionObserver,
        isMobile: DEVICE.isMobile,
        hasReducedMotion: DEVICE.hasReducedMotion
    });
    
    return true;
}

// API pública mejorada
window.navigationControls = {
    // Navegación básica
    goToSection,
    goToSectionByName,
    next: () => goToSection(state.currentSection + 1),
    prev: () => goToSection(state.currentSection - 1),
    first: () => goToSection(0),
    last: () => goToSection(dom.sections.length - 1),
    
    // Estado y configuración
    getCurrentState,
    getConfig: () => ({ ...CONFIG }),
    setConfig: (newConfig) => Object.assign(CONFIG, newConfig),
    
    // Control del sistema
    init,
    cleanup,
    
    // Utilidades
    isReady: () => state.isInitialized,
    getSections: () => Array.from(dom.sections).map((s, i) => ({
        index: i,
        id: s.id,
        name: s.dataset.name,
        element: s
    }))
};

// Event listeners para cleanup
window.addEventListener('beforeunload', cleanup, { passive: true });

// Inicialización automática mejorada
function autoInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        // Pequeño delay para asegurar que todos los elementos estén listos
        setTimeout(init, 10);
    }
}

// Verificar si debe auto-inicializarse
if (!window.navigationControls?.isReady?.()) {
    autoInit();
}