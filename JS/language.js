/**
 * Language Manager - Gestor de idiomas para el frontend
 */
class LanguageManager {
    constructor() {
        this.currentLang = document.documentElement.lang || 'es';
        this.availableLangs = ['es', 'en'];
        this.init();
    }
    
    init() {
        this.setupLanguageToggle();
        this.updateLanguageButton();
        this.addLanguageIndicators();
    }
    
    /**
     * Configura el botón de cambio de idioma
     */
    setupLanguageToggle() {
        const languageButton = document.getElementById('languageOption');
        if (languageButton) {
            languageButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLanguage();
            });
        }
    }
    
    /**
     * Actualiza el texto del botón de idioma
     */
    updateLanguageButton() {
        const languageButton = document.getElementById('languageOption');
        if (languageButton) {
            const altLang = this.getAlternativeLanguage();
            const langName = this.getLanguageName(altLang);
            const icon = languageButton.querySelector('i');
            const text = languageButton.childNodes[languageButton.childNodes.length - 1];
            
            if (text && text.nodeType === Node.TEXT_NODE) {
                text.textContent = ` ${langName}`;
            }
            
            // Actualizar título del botón
            languageButton.title = this.currentLang === 'es' 
                ? `Cambiar a ${langName}` 
                : `Switch to ${langName}`;
        }
    }
    
    /**
     * Agrega indicadores visuales de idioma
     */
    addLanguageIndicators() {
        // Agregar clase de idioma al body
        document.body.classList.add(`lang-${this.currentLang}`);
        
        // Agregar atributo data-lang
        document.body.setAttribute('data-lang', this.currentLang);
    }
    
    /**
     * Cambia al idioma alternativo
     */
    toggleLanguage() {
        const newLang = this.getAlternativeLanguage();
        this.changeLanguage(newLang);
    }
    
    /**
     * Cambia a un idioma específico
     */
    changeLanguage(lang) {
        if (!this.isValidLanguage(lang)) {
            console.error(`Idioma no válido: ${lang}`);
            return false;
        }
        
        // Mostrar indicador de carga
        this.showLoadingIndicator();
        
        // Construir nueva URL
        const newUrl = this.buildLanguageUrl(lang);
        
        // Redirigir con efecto suave
        this.smoothTransition(() => {
            window.location.href = newUrl;
        });
        
        return true;
    }
    
    /**
     * Construye URL con parámetro de idioma
     */
    buildLanguageUrl(lang) {
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        return url.toString();
    }
    
    /**
     * Obtiene el idioma alternativo
     */
    getAlternativeLanguage() {
        return this.currentLang === 'es' ? 'en' : 'es';
    }
    
    /**
     * Obtiene el nombre del idioma
     */
    getLanguageName(lang) {
        const names = {
            'es': 'Español',
            'en': 'English'
        };
        return names[lang] || lang;
    }
    
    /**
     * Valida si un idioma es válido
     */
    isValidLanguage(lang) {
        return this.availableLangs.includes(lang);
    }
    
    /**
     * Muestra indicador de carga
     */
    showLoadingIndicator() {
        const languageButton = document.getElementById('languageOption');
        if (languageButton) {
            const icon = languageButton.querySelector('i');
            if (icon) {
                icon.className = 'fi fi-rr-spinner';
                icon.style.animation = 'spin 1s linear infinite';
            }
        }
        
        // Agregar spinner CSS si no existe
        if (!document.getElementById('language-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'language-spinner-style';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Transición suave antes del cambio
     */
    smoothTransition(callback) {
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            callback();
        }, 150);
    }
    
    /**
     * Detecta cambios en el idioma del navegador
     */
    detectBrowserLanguageChange() {
        // Detectar cambios en localStorage si se usa
        window.addEventListener('storage', (e) => {
            if (e.key === 'preferred_language') {
                this.handleLanguageChange(e.newValue);
            }
        });
    }
    
    /**
     * Maneja cambios de idioma
     */
    handleLanguageChange(newLang) {
        if (this.isValidLanguage(newLang) && newLang !== this.currentLang) {
            this.changeLanguage(newLang);
        }
    }
    
    /**
     * Obtiene traducciones desde el servidor (para uso futuro)
     */
    async fetchTranslations(lang) {
        try {
            const response = await fetch(`/api/translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching translations:', error);
            return null;
        }
    }
    
    /**
     * Inicializa tooltips con traducciones
     */
    initializeTooltips() {
        const elements = document.querySelectorAll('[data-tooltip-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-tooltip-key');
            if (key) {
                // Aquí se podría implementar la lógica para tooltips dinámicos
                element.title = this.translate(key);
            }
        });
    }
    
    /**
     * Actualiza elementos con atributos de traducción dinámicos
     */
    updateDynamicTranslations() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                // Implementar lógica de traducción dinámica si es necesario
                console.log(`Dynamic translation needed for: ${key}`);
            }
        });
    }
}

/**
 * Funciones globales para compatibilidad
 */

// Función global para cambiar idioma (compatible con el código existente)
function toggleLanguage() {
    if (window.languageManager) {
        window.languageManager.toggleLanguage();
    } else {
        console.warn('Language manager not initialized');
    }
}

// Función para cambiar a un idioma específico
function changeLanguage(lang) {
    if (window.languageManager) {
        return window.languageManager.changeLanguage(lang);
    }
    return false;
}

// Función para obtener el idioma actual
function getCurrentLanguage() {
    return document.documentElement.lang || 'es';
}

// Función para obtener idiomas disponibles
function getAvailableLanguages() {
    return ['es', 'en'];
}

/**
 * Inicialización automática
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el gestor de idiomas
    window.languageManager = new LanguageManager();
    
    // Agregar clase de carga completada
    document.body.classList.add('language-system-ready');
    
    console.log('Language Manager initialized');
});

// Manejar cambios de visibilidad de la página
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.languageManager) {
        // Verificar si el idioma cambió mientras la página no estaba visible
        const currentPageLang = document.documentElement.lang;
        const cookieLang = getCookie('lang');
        
        if (cookieLang && cookieLang !== currentPageLang) {
            window.location.reload();
        }
    }
});

/**
 * Utilidad para leer cookies
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}