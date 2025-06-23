<?php
// feedback.php
session_start();
require_once 'config/database.php';
require_once 'classes/User.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$loggedIn = false;

// Verificar si el usuario está autenticado
if (isset($_SESSION['jwt_token'])) {
    $token = $_SESSION['jwt_token'];
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGORITHM));
        $userId = $decoded->sub;
        $userData = $user->getById($userId);
        $loggedIn = true;
    } catch (Exception $e) {
        // Token inválido
    }
}

// Procesar envío de formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $type = $_POST['type'] ?? 'suggestion';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    
    require_once 'classes/Feedback.php';
    $feedback = new Feedback($db);
    
    $feedbackData = [
        'user_id' => $loggedIn ? $userId : null,
        'name' => $name,
        'email' => $email,
        'type' => $type,
        'subject' => $subject,
        'message' => $message
    ];
    
    if ($feedback->create($feedbackData)) {
        $success = "¡Gracias por tu mensaje! Hemos recibido tu $type.";
    } else {
        $error = "Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buzón de Quejas y Sugerencias - Seres</title>
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/feedback.css">
</head>
<body>
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="Logo de Seres">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="/feedback.php" class="nav-link">Contacto</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <div class="feedback-container">
        <h1>Buzón de Quejas y Sugerencias</h1>
        <p>Tu opinión es importante para nosotros. Por favor, completa el formulario a continuación:</p>
        
        <?php if (isset($success)): ?>
            <div class="alert alert-success"><?= $success ?></div>
        <?php elseif (isset($error)): ?>
            <div class="alert alert-error"><?= $error ?></div>
        <?php endif; ?>
        
        <form method="POST" id="feedbackForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="name">Nombre *</label>
                    <input type="text" id="name" name="name" 
                           value="<?= $loggedIn ? $userData['name'] : '' ?>" 
                           required>
                </div>
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" 
                           value="<?= $loggedIn ? $userData['email'] : '' ?>" 
                           required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="type">Tipo de mensaje *</label>
                    <select id="type" name="type" required>
                        <option value="suggestion">Sugerencia</option>
                        <option value="complaint">Queja</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="subject">Asunto *</label>
                    <input type="text" id="subject" name="subject" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="message">Mensaje *</label>
                <textarea id="message" name="message" rows="6" required></textarea>
            </div>
            
            <button type="submit" class="btn">Enviar Mensaje</button>
        </form>
    </div>

    <script>
        // Cambiar texto del botón según el tipo de mensaje
        document.getElementById('type').addEventListener('change', function() {
            const submitBtn = document.querySelector('.btn');
            if (this.value === 'complaint') {
                submitBtn.textContent = 'Enviar Queja';
            } else {
                submitBtn.textContent = 'Enviar Sugerencia';
            }
        });
    </script>
</body>
</html>