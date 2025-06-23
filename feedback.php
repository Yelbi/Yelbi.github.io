<?php
// feedback.php - Versión Mejorada
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
    }
    
    if (empty(trim($data['email']))) {
        $errors['email'] = 'El email es obligatorio';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'El formato del email no es válido';
    }
    
    if (empty(trim($data['subject']))) {
        $errors['subject'] = 'El asunto es obligatorio';
    } elseif (strlen(trim($data['subject'])) < 5) {
        $errors['subject'] = 'El asunto debe tener al menos 5 caracteres';
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
        
        if (empty($validationErrors)) {
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
                'message' => $formData['message']
            ];
            
            if ($feedback->create($feedbackData)) {
                $messageType = $formData['type'] === 'complaint' ? 'queja' : 'sugerencia';
                $success = "¡Gracias por tu mensaje! Hemos recibido tu $messageType correctamente. Te responderemos pronto.";
                // Limpiar formulario después del éxito
                $formData = ['name' => '', 'email' => '', 'type' => 'suggestion', 'subject' => '', 'message' => ''];
            } else {
                $error = "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo en unos minutos.";
            }
        }
    }
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
        <a href="/iniciar.php" class="user-btn" aria-label="Iniciar sesión">
            <i class="fi fi-rr-user"></i>
        </a>
    </header>

    <main class="feedback-container">
        <h1>Buzón de Quejas y Sugerencias</h1>
        <p>Tu opinión es muy importante para nosotros. Comparte tus comentarios, sugerencias o quejas para ayudarnos a mejorar nuestros servicios.</p>
        
        <?php if ($success): ?>
            <div class="alert alert-success" role="alert">
                <strong>¡Éxito!</strong> <?= $success ?>
            </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-error" role="alert">
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
                           aria-describedby="<?= isset($validationErrors['name']) ? 'name-error' : '' ?>">
                    <?php if (isset($validationErrors['name'])): ?>
                        <div class="error-message" id="name-error"><?= $validationErrors['name'] ?></div>
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
                           aria-describedby="<?= isset($validationErrors['email']) ? 'email-error' : '' ?>">
                    <?php if (isset($validationErrors['email'])): ?>
                        <div class="error-message" id="email-error"><?= $validationErrors['email'] ?></div>
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
                        <div class="error-message" id="type-error"><?= $validationErrors['type'] ?></div>
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
                           aria-describedby="<?= isset($validationErrors['subject']) ? 'subject-error' : '' ?>">
                    <?php if (isset($validationErrors['subject'])): ?>
                        <div class="error-message" id="subject-error"><?= $validationErrors['subject'] ?></div>
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
                    <div class="char-counter" id="message-counter">
                        <span id="char-count">0</span>/5000 caracteres
                    </div>
                    <?php if (isset($validationErrors['message'])): ?>
                        <div class="error-message" id="message-error"><?= $validationErrors['message'] ?></div>
                    <?php endif; ?>
                </div>
            </div>
            
            <button type="submit" name="submit_feedback" class="btn" id="submitBtn">
                <span class="btn-text">Enviar Sugerencia</span>
            </button>
        </form>
    </main>

    <script>
        // Funciones utilitarias
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

        // Referencias DOM
        const form = document.getElementById('feedbackForm');
        const typeSelect = document.getElementById('type');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const messageTextarea = document.getElementById('message');
        const charCount = document.getElementById('char-count');
        const charCounter = document.getElementById('message-counter');

        // Cambiar texto del botón según el tipo de mensaje
        function updateSubmitButton() {
            const type = typeSelect.value;
            const buttonTexts = {
                'suggestion': 'Enviar Sugerencia',
                'complaint': 'Enviar Queja'
            };
            btnText.textContent = buttonTexts[type] || 'Enviar Mensaje';
        }

        // Contador de caracteres
        function updateCharCounter() {
            const length = messageTextarea.value.length;
            const maxLength = 5000;
            
            charCount.textContent = length;
            
            // Actualizar clases del contador
            charCounter.classList.remove('warning', 'error');
            if (length > maxLength * 0.9) {
                charCounter.classList.add('warning');
            }
            if (length >= maxLength) {
                charCounter.classList.add('error');
            }
        }

        // Validación en tiempo real
        function validateField(field) {
            const value = field.value.trim();
            const fieldName = field.name;
            const formGroup = field.closest('.form-group');
            
            // Remover estados previos
            formGroup.classList.remove('error', 'success');
            
            // Remover mensajes de error previos
            const existingError = formGroup.querySelector('.error-message');
            if (existingError && !existingError.id.includes('-error')) {
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
                    }
                    break;
                    
                case 'subject':
                    if (!value) {
                        errorMessage = 'El asunto es obligatorio';
                        isValid = false;
                    } else if (value.length < 5) {
                        errorMessage = 'El asunto debe tener al menos 5 caracteres';
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
                    }
                    break;
            }
            
            // Aplicar estilos de validación
            if (isValid && value) {
                formGroup.classList.add('success');
            } else if (!isValid) {
                formGroup.classList.add('error');
                
                // Mostrar mensaje de error si no existe uno con ID específico
                if (!existingError) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = errorMessage;
                    field.parentNode.appendChild(errorDiv);
                }
            }
            
            return isValid;
        }

        // Event Listeners
        typeSelect.addEventListener('change', updateSubmitButton);
        messageTextarea.addEventListener('input', debounce(updateCharCounter, 100));

        // Validación en tiempo real para todos los campos
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        fields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', debounce(() => {
                if (field.classList.contains('error') || field.value.trim()) {
                    validateField(field);
                }
            }, 300));
        });

        // Prevenir envío de formulario inválido
        form.addEventListener('submit', function(e) {
            let isFormValid = true;
            
            // Validar todos los campos
            fields.forEach(field => {
                if (!validateField(field)) {
                    isFormValid = false;
                }
            });
            
            if (!isFormValid) {
                e.preventDefault();
                
                // Scroll al primer error
                const firstError = form.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollInto