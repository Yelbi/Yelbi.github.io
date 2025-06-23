// Configuración y constantes
const CONFIG = {
    DEBOUNCE_DELAY: 300,
    CHAR_COUNTER_UPDATE_DELAY: 100,
    MAX_MESSAGE_LENGTH: 5000,
    VALIDATION_DELAY: 500,
    FORM_SAVE_DELAY: 2000,
    MAX_RETRIES: 3
};

// Utilidades
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

// Referencias DOM con verificación de existencia
const elements = {
    form: document.getElementById('feedbackForm'),
    typeSelect: document.getElementById('type'),
    submitBtn: document.getElementById('submitBtn'),
    btnText: document.querySelector('.btn-text'),
    btnLoader: document.querySelector('.btn-loader'),
    messageTextarea: document.getElementById('message'),
    charCount: document.getElementById('char-count'),
    charCounter: document.getElementById('message-counter'),
    nameField: document.getElementById('name'),
    emailField: document.getElementById('email'),
    subjectField: document.getElementById('subject'),
    menuToggle: document.getElementById('menuToggle'),
    navMenu: document.getElementById('navMenu')
};

// Verificar que los elementos existen
const missingElements = Object.entries(elements).filter(([key, element]) => !element);
if (missingElements.length > 0) {
    console.warn('Elementos DOM faltantes:', missingElements.map(([key]) => key));
}

// Gestión del estado del formulario
class FormState {
    constructor() {
        this.isSubmitting = false;
        this.isValid = false;
        this.validationErrors = new Map();
        this.formData = new Map();
        this.retryCount = 0;
    }

    setSubmitting(status) {
        this.isSubmitting = status;
        this.updateSubmitButton();
    }

    setValidationError(field, error) {
        if (error) {
            this.validationErrors.set(field, error);
        } else {
            this.validationErrors.delete(field);
        }
        this.updateFormValidity();
    }

    updateFormValidity() {
        this.isValid = this.validationErrors.size === 0 && this.hasRequiredFields();
        this.updateSubmitButton();
    }

    hasRequiredFields() {
        const requiredFields = ['name', 'email', 'subject', 'message'];
        return requiredFields.every(field => {
            const element = elements[field + 'Field'] || elements[field] || elements[field + 'Textarea'];
            return element && element.value.trim().length > 0;
        });
    }

    updateSubmitButton() {
        if (!elements.submitBtn) return;

        elements.submitBtn.disabled = this.isSubmitting || !this.isValid;
        
        if (this.isSubmitting) {
            elements.submitBtn.classList.add('loading');
            if (elements.btnText) elements.btnText.style.opacity = '0';
            if (elements.btnLoader) elements.btnLoader.style.display = 'block';
        } else {
            elements.submitBtn.classList.remove('loading');
            if (elements.btnText) elements.btnText.style.opacity = '1';
            if (elements.btnLoader) elements.btnLoader.style.display = 'none';
        }
    }

    saveFormData(field, value) {
        this.formData.set(field, value);
        this.saveToStorage();
    }

    saveToStorage() {
        try {
            const formDataObj = Object.fromEntries(this.formData);
            sessionStorage.setItem('feedbackFormData', JSON.stringify(formDataObj));
        } catch (e) {
            console.warn('No se pudo guardar los datos del formulario:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = sessionStorage.getItem('feedbackFormData');
            if (saved) {
                const formDataObj = JSON.parse(saved);
                Object.entries(formDataObj).forEach(([key, value]) => {
                    const element = elements[key + 'Field'] || elements[key] || elements[key + 'Textarea'];
                    if (element && !element.value) {
                        element.value = value;
                        this.formData.set(key, value);
                    }
                });
                this.updateCharCounter();
                this.updateSubmitButton();
            }
        } catch (e) {
            console.warn('No se pudo cargar los datos del formulario:', e);
        }
    }

    clearStorage() {
        try {
            sessionStorage.removeItem('feedbackFormData');
        } catch (e) {
            console.warn('No se pudo limpiar el almacenamiento:', e);
        }
    }
}

const formState = new FormState();

// Gestión del texto del botón según el tipo
function updateSubmitButton() {
    if (!elements.typeSelect || !elements.btnText) return;
    
    const type = elements.typeSelect.value;
    const buttonTexts = {
        'suggestion': 'Enviar Sugerencia',
        'complaint': 'Enviar Queja'
    };
    elements.btnText.textContent = buttonTexts[type] || 'Enviar Mensaje';
    
    // Actualizar placeholder del mensaje según el tipo
    if (elements.messageTextarea) {
        const placeholders = {
            'suggestion': 'Describe tu sugerencia de manera detallada. ¿Qué mejorarías o qué nueva función te gustaría ver?',
            'complaint': 'Describe tu queja de manera detallada. ¿Qué problema experimentaste y cómo te afectó?'
        };
        elements.messageTextarea.placeholder = placeholders[type] || 'Describe tu mensaje de manera detallada...';
    }
}

// Contador de caracteres mejorado
function updateCharCounter() {
    if (!elements.messageTextarea || !elements.charCount || !elements.charCounter) return;
    
    const length = elements.messageTextarea.value.length;
    const maxLength = CONFIG.MAX_MESSAGE_LENGTH;
    
    elements.charCount.textContent = length.toLocaleString();
    
    // Actualizar clases del contador
    elements.charCounter.classList.remove('warning', 'error');
    if (length > maxLength * 0.9) {
        elements.charCounter.classList.add('warning');
    }
    if (length >= maxLength) {
        elements.charCounter.classList.add('error');
    }

    // Anunciar para lectores de pantalla
    if (length === maxLength) {
        elements.charCounter.setAttribute('aria-live', 'assertive');
        announceToScreenReader('Se alcanzó el límite máximo de caracteres');
        setTimeout(() => elements.charCounter.setAttribute('aria-live', 'polite'), 1000);
    }
}

// Función para anunciar mensajes a lectores de pantalla
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Validación mejorada de campos
function validateField(field) {
    if (!field) return true;
    
    const value = field.value.trim();
    const fieldName = field.name;
    const formGroup = field.closest('.form-group');
    
    if (!formGroup) return true;

    // Remover estados previos
    formGroup.classList.remove('error', 'success');
    
    // Remover mensajes de error dinámicos previos
    const existingError = formGroup.querySelector('.error-message:not([id$="-error"])');
    if (existingError) {
        existingError.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones específicas
    switch (fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'El nombre es obligatorio';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'El nombre debe tener al menos 2 caracteres';
                isValid = false;
            } else if (value.length > 100) {
                errorMessage = 'El nombre no puede exceder los 100 caracteres';
                isValid = false;
            } else if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(value)) {
                errorMessage = 'El nombre solo puede contener letras y espacios';
                isValid = false;
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'El email es obligatorio';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = 'El formato del email no es válido';
                isValid = false;
            } else if (value.length > 255) {
                errorMessage = 'El email no puede exceder los 255 caracteres';
                isValid = false;
            }
            break;
            
        case 'subject':
            if (!value) {
                errorMessage = 'El asunto es obligatorio';
                isValid = false;
            } else if (value.length < 5) {
                errorMessage = 'El asunto debe tener al menos 5 caracteres';
                isValid = false;
            } else if (value.length > 200) {
                errorMessage = 'El asunto no puede exceder los 200 caracteres';
                isValid = false;
            }
            break;
            
        case 'message':
            if (!value) {
                errorMessage = 'El mensaje es obligatorio';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                isValid = false;
            } else if (value.length > CONFIG.MAX_MESSAGE_LENGTH) {
                errorMessage = 'El mensaje no puede exceder los 5000 caracteres';
                isValid = false;
            }
            break;
            
        case 'type':
            if (!['suggestion', 'complaint'].includes(value)) {
                errorMessage = 'Tipo de mensaje no válido';
                isValid = false;
            }
            break;
    }
    
    // Aplicar estilos de validación
    if (isValid && value) {
        formGroup.classList.add('success');
        formState.setValidationError(fieldName, null);
        
        // Guardar dato válido
        formState.saveFormData(fieldName, value);
    } else if (!isValid) {
        formGroup.classList.add('error');
        formState.setValidationError(fieldName, errorMessage);
        
        // Mostrar mensaje de error si no existe uno con ID específico
        const existingServerError = formGroup.querySelector('[id$="-error"]');
        if (!existingServerError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.setAttribute('role', 'alert');
            errorDiv.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorDiv);
        }
    } else {
        formState.setValidationError(fieldName, null);
    }
    
    return isValid;
}

// Validación completa del formulario
function validateForm() {
    if (!elements.form) return false;
    
    const fields = elements.form.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

// Detección de spam mejorada
function detectSpam() {
    const message = elements.messageTextarea?.value || '';
    const subject = elements.subjectField?.value || '';
    const email = elements.emailField?.value || '';
    
    // Patrones de spam
    const spamPatterns = [
        /viagra|casino|lottery|bitcoin|cryptocurrency/i,
        /make.*money.*fast/i,
        /click.*here.*now/i,
        /urgent.*action.*required/i,
        /congratulations.*winner/i
    ];
    
    const content = (message + ' ' + subject + ' ' + email).toLowerCase();
    
    // Verificar patrones de spam
    for (const pattern of spamPatterns) {
        if (pattern.test(content)) {
            return true;
        }
    }
    
    // Verificar exceso de enlaces
    const linkCount = (message.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) {
        return true;
    }
    
    // Verificar texto repetitivo
    const words = message.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (words.length > 50 && uniqueWords.size / words.length < 0.5) {
        return true;
    }
    
    return false;
}

// Manejo de eventos mejorado
function setupEventListeners() {
    // Cambio de tipo de mensaje
    if (elements.typeSelect) {
        elements.typeSelect.addEventListener('change', () => {
            updateSubmitButton();
            formState.saveFormData('type', elements.typeSelect.value);
        });
    }

    // Contador de caracteres
    if (elements.messageTextarea) {
        elements.messageTextarea.addEventListener('input', 
            throttle(() => {
                updateCharCounter();
                validateField(elements.messageTextarea);
            }, CONFIG.CHAR_COUNTER_UPDATE_DELAY)
        );
    }

    // Validación en tiempo real para todos los campos requeridos
    const fields = elements.form?.querySelectorAll('input[required], select[required], textarea[required]') || [];
    fields.forEach(field => {
        // Validación al salir del campo
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        // Validación durante la escritura (con debounce)
        field.addEventListener('input', debounce(() => {
            if (field.classList.contains('error') || field.value.trim()) {
                validateField(field);
            }
        }, CONFIG.VALIDATION_DELAY));

        // Autoguardado
        field.addEventListener('input', debounce(() => {
            formState.saveFormData(field.name, field.value);
        }, CONFIG.FORM_SAVE_DELAY));
    });

    // Envío del formulario
    if (elements.form) {
        elements.form.addEventListener('submit', handleFormSubmit);
    }

    // Navegación por teclado mejorada
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Menú móvil
    if (elements.menuToggle && elements.navMenu) {
        elements.menuToggle.addEventListener('click', toggleMobileMenu);
        elements.menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (elements.navMenu && 
            elements.navMenu.classList.contains('active') && 
            !elements.navMenu.contains(e.target) && 
            !elements.menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Manejo de resize para cerrar menú en desktop
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && elements.navMenu?.classList.contains('active')) {
            closeMobileMenu();
        }
    }, 250));

    // Prevenir pérdida de datos
    window.addEventListener('beforeunload', (e) => {
        if (formState.formData.size > 0 && !formState.isSubmitting) {
            e.preventDefault();
            e.returnValue = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
        }
    });
}

// Manejo del menú móvil
function toggleMobileMenu() {
    if (!elements.navMenu || !elements.menuToggle) return;
    
    const isActive = elements.navMenu.classList.toggle('active');
    elements.menuToggle.setAttribute('aria-expanded', isActive);
    elements.menuToggle.setAttribute('aria-label', isActive ? 'Cerrar menú' : 'Abrir menú');
    
    // Cambiar icono
    const icon = elements.menuToggle.querySelector('i');
    if (icon) {
        icon.className = isActive ? 'fi fi-rr-cross' : 'fi fi-rr-menu-burger';
    }
    
    // Gestionar focus
    if (isActive) {
        const firstLink = elements.navMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
}

function closeMobileMenu() {
    if (!elements.navMenu || !elements.menuToggle) return;
    
    elements.navMenu.classList.remove('active');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
    elements.menuToggle.setAttribute('aria-label', 'Abrir menú');
    
    const icon = elements.menuToggle.querySelector('i');
    if (icon) {
        icon.className = 'fi fi-rr-menu-burger';
    }
}

// Manejo del envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        // Scroll al primer error con animación suave
        const firstError = elements.form.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Focus en el campo con error
            const errorField = firstError.querySelector('input, select, textarea');
            if (errorField) {
                setTimeout(() => {
                    errorField.focus();
                    announceToScreenReader('Por favor, corrige los errores en el formulario');
                }, 500);
            }
        }
        return false;
    }

    // Verificar spam
    if (detectSpam()) {
        showNotification('Tu mensaje parece contener spam. Por favor, revisa el contenido e inténtalo de nuevo.', 'error');
        return false;
    }

    // Mostrar estado de carga
    formState.setSubmitting(true);
    
    try {
        // Simular envío (en el código real, esto sería el envío real del formulario)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Si llegamos aquí, el formulario se envió correctamente
        formState.clearStorage();
        showNotification('Mensaje enviado correctamente. Te responderemos pronto.', 'success');
        
        // Reset del formulario
        elements.form.reset();
        formState.formData.clear();
        formState.validationErrors.clear();
        
        // Limpiar estados visuales
        const formGroups = elements.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const dynamicError = group.querySelector('.error-message:not([id$="-error"])');
            if (dynamicError) {
                dynamicError.remove();
            }
        });
        
        updateCharCounter();
        updateSubmitButton();
        
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        
        formState.retryCount++;
        if (formState.retryCount < CONFIG.MAX_RETRIES) {
            showNotification(`Error al enviar el mensaje. Reintentando... (${formState.retryCount}/${CONFIG.MAX_RETRIES})`, 'warning');
            setTimeout(() => handleFormSubmit(e), 2000);
        } else {
            showNotification('No se pudo enviar el mensaje después de varios intentos. Por favor, inténtalo más tarde.', 'error');
            formState.retryCount = 0;
        }
    } finally {
        formState.setSubmitting(false);
    }
}

// Sistema de notificaciones
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" aria-label="Cerrar notificación">×</button>
    `;
    
    // Estilos
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '10000',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: '0'
    });
    
    // Colores según tipo
    const colors = {
        success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' }
    };
    
    const color = colors[type] || colors.info;
    Object.assign(notification.style, {
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`
    });
    
    document.body.appendChild(notification);
    
    // Mostrar animación
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });
    
    // Botón cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => hideNotification(notification));
    
    // Auto-ocultar
    if (duration > 0) {
        setTimeout(() => hideNotification(notification), duration);
    }
    
    return notification;
}

function hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Navegación por teclado
function handleKeyboardNavigation(e) {
    // Envío con Ctrl+Enter en el textarea
    if (e.ctrlKey && e.key === 'Enter' && document.activeElement === elements.messageTextarea) {
        e.preventDefault();
        if (validateForm()) {
            handleFormSubmit(e);
        }
    }
    
    // Navegación en el menú móvil
    if (elements.navMenu?.classList.contains('active')) {
        const menuLinks = elements.navMenu.querySelectorAll('a');
        const currentIndex = Array.from(menuLinks).indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % menuLinks.length;
                menuLinks[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? menuLinks.length - 1 : currentIndex - 1;
                menuLinks[prevIndex].focus();
                break;
                
            case 'Escape':
                e.preventDefault();
                closeMobileMenu();
                elements.menuToggle.focus();
                break;
        }
    }
}

// Funciones de utilidad adicionales
function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Inicialización mejorada
function init() {
    try {
        // Verificar soporte de características
        if (!('querySelector' in document)) {
            console.error('Navegador no soportado');
            return;
        }
        
        // Configurar event listeners
        setupEventListeners();
        
        // Inicializar estados
        updateSubmitButton();
        updateCharCounter();
        
        // Cargar datos guardados
        formState.loadFromStorage();
        
        // Validación inicial
        formState.updateFormValidity();
        
        // Mostrar mensaje de bienvenida solo en desarrollo
        if (window.location.hostname === 'localhost') {
            console.log('Formulario de feedback inicializado correctamente');
        }
        
        // Anunciar carga completa para lectores de pantalla
        announceToScreenReader('Formulario de contacto cargado y listo para usar');
        
    } catch (error) {
        console.error('Error inicializando el formulario:', error);
        
        // Fallback para funcionalidad básica
        if (elements.form) {
            elements.form.addEventListener('submit', (e) => {
                if (!confirm('¿Enviar formulario? (Validación reducida activa)')) {
                    e.preventDefault();
                }
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exportar funciones para uso externo si es necesario
window.FeedbackForm = {
    validateForm,
    showNotification,
    hideNotification,
    init
};