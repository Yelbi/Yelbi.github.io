<?php
// feedback.php - Versión Completa Mejorada
session_start();
require_once 'config/database.php';
require_once 'classes/User.php';

// Definir constantes JWT si no existen
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', 'tu_clave_secreta_aqui');
}
if (!defined('JWT_ALGORITHM')) {
    define('JWT_ALGORITHM', 'HS256');
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$loggedIn = false;
$userData = null;

// Verificar si el usuario está autenticado
if (isset($_SESSION['jwt_token'])) {
    $token = $_SESSION['jwt_token'];
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGORITHM));
        $userId = $decoded->sub;
        $userData = $user->getById($userId);
        $loggedIn = true;
    } catch (Exception $e) {
        // Token inválido, limpiar sesión
        unset($_SESSION['jwt_token']);
    }
}

$success = '';
$error = '';
$validationErrors = [];

// Función para validar datos
function validateFeedbackData($data) {
    $errors = [];
    
    if (empty(trim($data['name']))) {
        $errors['name'] = 'El nombre es obligatorio';
    } elseif (strlen(trim($data['name'])) < 2) {
        $errors['name'] = 'El nombre debe tener al menos 2 caracteres';
    } elseif (strlen(trim($data['name'])) > 100) {
        $errors['name'] = 'El nombre no puede exceder los 100 caracteres';
    }
    
    if (empty(trim($data['email']))) {
        $errors['email'] = 'El email es obligatorio';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'El formato del email no es válido';
    } elseif (strlen($data['email']) > 255) {
        $errors['email'] = 'El email no puede exceder los 255 caracteres';
    }
    
    if (empty(trim($data['subject']))) {
        $errors['subject'] = 'El asunto es obligatorio';
    } elseif (strlen(trim($data['subject'])) < 5) {
        $errors['subject'] = 'El asunto debe tener al menos 5 caracteres';
    } elseif (strlen(trim($data['subject'])) > 200) {
        $errors['subject'] = 'El asunto no puede exceder los 200 caracteres';
    }
    
    if (empty(trim($data['message']))) {
        $errors['message'] = 'El mensaje es obligatorio';
    } elseif (strlen(trim($data['message'])) < 10) {
        $errors['message'] = 'El mensaje debe tener al menos 10 caracteres';
    } elseif (strlen(trim($data['message'])) > 5000) {
        $errors['message'] = 'El mensaje no puede exceder los 5000 caracteres';
    }
    
    if (!in_array($data['type'], ['suggestion', 'complaint'])) {
        $errors['type'] = 'Tipo de mensaje no válido';
    }
    
    return $errors;
}

// Función para limpiar datos
function sanitizeData($data) {
    return array_map(function($value) {
        return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
    }, $data);
}

// Función para detectar spam básico
function isSpamContent($data) {
    $spamKeywords = ['viagra', 'casino', 'loan', 'bitcoin', 'cryptocurrency', 'make money'];
    $content = strtolower($data['message'] . ' ' . $data['subject']);
    
    foreach ($spamKeywords as $keyword) {
        if (strpos($content, $keyword) !== false) {
            return true;
        }
    }
    
    // Verificar si el mensaje tiene demasiados enlaces
    if (preg_match_all('/https?:\/\//', $data['message']) > 3) {
        return true;
    }
    
    return false;
}

// Procesar envío de formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_feedback'])) {
    // Verificar token CSRF
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $error = "Token de seguridad inválido. Por favor, recarga la página e inténtalo de nuevo.";
    } else {
        $formData = [
            'name' => $_POST['name'] ?? '',
            'email' => $_POST['email'] ?? '',
            'type' => $_POST['type'] ?? 'suggestion',
            'subject' => $_POST['subject'] ?? '',
            'message' => $_POST['message'] ?? ''
        ];
        
        // Validar datos
        $validationErrors = validateFeedbackData($formData);
        
        // Verificar spam
        if (empty($validationErrors) && isSpamContent($formData)) {
            $error = "Tu mensaje parece contener spam. Por favor, revisa el contenido e inténtalo de nuevo.";
        }
        
        if (empty($validationErrors) && empty($error)) {
            // Limpiar datos
            $formData = sanitizeData($formData);
            
            require_once 'classes/Feedback.php';
            $feedback = new Feedback($db);
            
            $feedbackData = [
                'user_id' => $loggedIn ? $userId : null,
                'name' => $formData['name'],
                'email' => $formData['email'],
                'type' => $formData['type'],
                'subject' => $formData['subject'],
                'message' => $formData['message'],
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ];
            
            if ($feedback->create($feedbackData)) {
                $messageType = $formData['type'] === 'complaint' ? 'queja' : 'sugerencia';
                $success = "¡Gracias por tu mensaje! Hemos recibido tu $messageType correctamente. Te responderemos pronto.";
                
                // Limpiar formulario después del éxito
                $formData = ['name' => '', 'email' => '', 'type' => 'suggestion', 'subject' => '', 'message' => ''];
                
                // Envío de email de notificación (opcional)
                try {
                    sendNotificationEmail($feedbackData);
                } catch (Exception $e) {
                    error_log("Error enviando notificación: " . $e->getMessage());
                }
            } else {
                $error = "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo en unos minutos.";
            }
        }
    }
}

// Función para enviar email de notificación
function sendNotificationEmail($data) {
    $to = 'admin@tusitio.com'; // Cambiar por tu email
    $subject = 'Nuevo mensaje de contacto: ' . $data['subject'];
    $message = "
    Nuevo mensaje recibido:
    
    Nombre: {$data['name']}
    Email: {$data['email']}
    Tipo: " . ($data['type'] === 'complaint' ? 'Queja' : 'Sugerencia') . "
    Asunto: {$data['subject']}
    
    Mensaje:
    {$data['message']}
    
    IP: {$data['ip_address']}
    Navegador: {$data['user_agent']}
    Fecha: " . date('Y-m-d H:i:s') . "
    ";
    
    $headers = [
        'From: noreply@tusitio.com',
        'Reply-To: ' . $data['email'],
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

// Generar token CSRF
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Preparar datos para el formulario
if (!isset($formData)) {
    $formData = [
        'name' => $loggedIn && $userData ? $userData['name'] : '',
        'email' => $loggedIn && $userData ? $userData['email'] : '',
        'type' => 'suggestion',
        'subject' => '',
        'message' => ''
    ];
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buzón de Quejas y Sugerencias - Seres</title>
    <meta name="description" content="Comparte tus opiniones, quejas y sugerencias con nosotros. Tu feedback es importante para mejorar nuestros servicios.">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Buzón de Quejas y Sugerencias - Seres">
    <meta property="og:description" content="Tu opinión es importante. Comparte tus comentarios y sugerencias.">
    <meta property="og:type" content="website">
    
    <!-- Preload critical CSS -->
    <link rel="preload" href="/styles/header.css" as="style">
    <link rel="preload" href="/styles/feedback.css" as="style">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/feedback.css">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/Img/favicon.ico">
    
    <!-- JSON-LD Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Buzón de Quejas y Sugerencias",
        "description": "Formulario de contacto para quejas y sugerencias",
        "url": "<?= $_SERVER['REQUEST_URI'] ?>"
    }
    </script>
</head>
<body>
    <header class="header">
        <a href="/index.php" class="logo" aria-label="Ir al inicio">
            <img src="/Img/logo.png" alt="Logo de Seres" width="120" height="40">
        </a>
        <nav class="nav-menu" id="navMenu" role="navigation" aria-label="Navegación principal">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="/feedback.php" class="nav-link" aria-current="page">Contacto</a>
        </nav>
        <div class="menu-toggle" id="menuToggle" aria-label="Abrir menú" role="button" tabindex="0">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn" aria-label="<?= $loggedIn ? 'Mi perfil' : 'Iniciar sesión' ?>">
            <i class="fi fi-rr-user"></i>
        </a>
    </header>

    <main class="feedback-container">
        <h1>Buzón de Quejas y Sugerencias</h1>
        <p>Tu opinión es muy importante para nosotros. Comparte tus comentarios, sugerencias o quejas para ayudarnos a mejorar nuestros servicios.</p>
        
        <?php if ($success): ?>
            <div class="alert alert-success" role="alert" aria-live="polite">
                <strong>¡Éxito!</strong> <?= $success ?>
            </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-error" role="alert" aria-live="assertive">
                <strong>Error:</strong> <?= $error ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" id="feedbackForm" novalidate>
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
            
            <div class="form-row">
                <div class="form-group has-icon name-field <?= isset($validationErrors['name']) ? 'error' : '' ?>">
                    <label for="name">Nombre completo *</label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           value="<?= htmlspecialchars($formData['name']) ?>" 
                           required 
                           maxlength="100"
                           autocomplete="name"
                           aria-describedby="<?= isset($validationErrors['name']) ? 'name-error' : '' ?>"
                           <?= $loggedIn && $userData ? 'readonly' : '' ?>>
                    <?php if (isset($validationErrors['name'])): ?>
                        <div class="error-message" id="name-error" role="alert"><?= $validationErrors['name'] ?></div>
                    <?php endif; ?>
                </div>
                
                <div class="form-group has-icon email-field <?= isset($validationErrors['email']) ? 'error' : '' ?>">
                    <label for="email">Correo electrónico *</label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           value="<?= htmlspecialchars($formData['email']) ?>" 
                           required 
                           maxlength="255"
                           autocomplete="email"
                           aria-describedby="<?= isset($validationErrors['email']) ? 'email-error' : '' ?>"
                           <?= $loggedIn && $userData ? 'readonly' : '' ?>>
                    <?php if (isset($validationErrors['email'])): ?>
                        <div class="error-message" id="email-error" role="alert"><?= $validationErrors['email'] ?></div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group <?= isset($validationErrors['type']) ? 'error' : '' ?>">
                    <label for="type">Tipo de mensaje *</label>
                    <select id="type" 
                            name="type" 
                            required
                            aria-describedby="<?= isset($validationErrors['type']) ? 'type-error' : '' ?>">
                        <option value="suggestion" <?= $formData['type'] === 'suggestion' ? 'selected' : '' ?>>
                            💡 Sugerencia
                        </option>
                        <option value="complaint" <?= $formData['type'] === 'complaint' ? 'selected' : '' ?>>
                            ⚠️ Queja
                        </option>
                    </select>
                    <?php if (isset($validationErrors['type'])): ?>
                        <div class="error-message" id="type-error" role="alert"><?= $validationErrors['type'] ?></div>
                    <?php endif; ?>
                </div>
                
                <div class="form-group has-icon subject-field <?= isset($validationErrors['subject']) ? 'error' : '' ?>">
                    <label for="subject">Asunto *</label>
                    <input type="text" 
                           id="subject" 
                           name="subject" 
                           value="<?= htmlspecialchars($formData['subject']) ?>" 
                           required 
                           maxlength="200"
                           placeholder="Breve descripción del tema"
                           aria-describedby="<?= isset($validationErrors['subject']) ? 'subject-error' : '' ?>">
                    <?php if (isset($validationErrors['subject'])): ?>
                        <div class="error-message" id="subject-error" role="alert"><?= $validationErrors['subject'] ?></div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="form-row single">
                <div class="form-group <?= isset($validationErrors['message']) ? 'error' : '' ?>">
                    <label for="message">Mensaje detallado *</label>
                    <textarea id="message" 
                              name="message" 
                              rows="6" 
                              required 
                              maxlength="5000"
                              placeholder="Describe tu sugerencia o queja de manera detallada..."
                              aria-describedby="message-counter <?= isset($validationErrors['message']) ? 'message-error' : '' ?>"><?= htmlspecialchars($formData['message']) ?></textarea>
                    <div class="char-counter" id="message-counter" aria-live="polite">
                        <span id="char-count">0</span>/5000 caracteres
                    </div>
                    <?php if (isset($validationErrors['message'])): ?>
                        <div class="error-message" id="message-error" role="alert"><?= $validationErrors['message'] ?></div>
                    <?php endif; ?>
                </div>
            </div>
            
            <button type="submit" name="submit_feedback" class="btn" id="submitBtn">
                <span class="btn-text">Enviar Sugerencia</span>
                <span class="btn-loader" aria-hidden="true"></span>
            </button>
        </form>
        
        <div class="contact-info">
            <h3>Información de Contacto</h3>
            <div class="contact-methods">
                <div class="contact-method">
                    <i class="fi fi-rr-envelope"></i>
                    <span>contacto@seres.com</span>
                </div>
                <div class="contact-method">
                    <i class="fi fi-rr-phone-call"></i>
                    <span>+1 (809) 555-0123</span>
                </div>
                <div class="contact-method">
                    <i class="fi fi-rr-clock"></i>
                    <span>Lun - Vie: 9:00 AM - 6:00 PM</span>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Configuración y constantes
        const CONFIG = {
            DEBOUNCE_DELAY: 300,
            CHAR_COUNTER_UPDATE_DELAY: 100,
            MAX_MESSAGE_LENGTH: 5000,
            VALIDATION_DELAY: 500
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
            subjectField: document.getElementById('subject')
        };

        // Verificar que los elementos existen
        const missingElements = Object.entries(elements).filter(([key, element]) => !element);
        if (missingElements.length > 0) {
            console.error('Elementos DOM faltantes:', missingElements.map(([key]) => key));
        }

        // Gestión del estado del formulario
        class FormState {
            constructor() {
                this.isSubmitting = false;
                this.isValid = false;
                this.validationErrors = new Map();
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
                this.isValid = this.validationErrors.size === 0;
                this.updateSubmitButton();
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
        }

        // Contador de caracteres mejorado
        function updateCharCounter() {
            if (!elements.messageTextarea || !elements.charCount || !elements.charCounter) return;
            
            const length = elements.messageTextarea.value.length;
            const maxLength = CONFIG.MAX_MESSAGE_LENGTH;
            
            elements.charCount.textContent = length;
            
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
                setTimeout(() => elements.charCounter.setAttribute('aria-live', 'polite'), 1000);
            }
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
            }
            
            // Aplicar estilos de validación
            if (isValid && value) {
                formGroup.classList.add('success');
                formState.setValidationError(fieldName, null);
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

        // Manejo de eventos
        function setupEventListeners() {
            // Cambio de tipo de mensaje
            if (elements.typeSelect) {
                elements.typeSelect.addEventListener('change', updateSubmitButton);
            }

            // Contador de caracteres
            if (elements.messageTextarea) {
                elements.messageTextarea.addEventListener('input', 
                    throttle(updateCharCounter, CONFIG.CHAR_COUNTER_UPDATE_DELAY)
                );
            }

            // Validación en tiempo real para todos los campos requeridos
            const fields = elements.form?.querySelectorAll('input[required], select[required], textarea[required]') || [];
            fields.forEach(field => {
                // Validación al salir del campo
                field.addEventListener('blur', () => validateField(field));
                
                // Validación durante la escritura (con debounce)
                field.addEventListener('input', debounce(() => {
                    if (field.classList.contains('error') || field.value.trim()) {
                        validateField(field);
                    }
                }, CONFIG.VALIDATION_DELAY));
            });

            // Envío del formulario
            if (elements.form) {
                elements.form.addEventListener('submit', handleFormSubmit);
            }

            // Navegación por teclado mejorada
            document.addEventListener('keydown', handleKeyboardNavigation);
        }

        // Manejo del envío del formulario
        function handleFormSubmit(e) {
            if (!validateForm()) {
                e.preventDefault();
                
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
                        setTimeout(() => errorField.focus(), 500);
                    }
                }
                
                return false;
            }

            // Mostrar estado de carga
            formState.setSubmitting(true);
        }

        // Navegación por teclado
        function handleKeyboardNavigation(e) {
            // Envío con Ctrl+Enter en el textarea
            if (e.ctrlKey && e.key === 'Enter' && document.activeElement === elements.messageTextarea) {
                if (validateForm()) {
                    elements.form.submit();
                }
            }
        }

        // Inicialización
        function init() {
            try {
                // Configurar event listeners
                setupEventListeners();