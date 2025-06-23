<?php
// verify.php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/classes/User.php';
require_once __DIR__ . '/utils/helpers.php';

// Obtener token de la URL
$token = $_GET['token'] ?? '';

if (empty($token)) {
    die("Token no proporcionado");
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Verificar el token
if ($user->verifyEmail($token)) {
    $message = "¡Tu email ha sido verificado exitosamente! Ahora puedes iniciar sesión.";
    $success = true;
} else {
    $message = "Token inválido o expirado. Por favor, solicita un nuevo enlace de verificación.";
    $success = false;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Email - Seres</title>
    <link rel="stylesheet" href="/styles/iniciar.css">
    <style>
        .verification-container {
            max-width: 600px;
            margin: 100px auto;
            padding: 40px;
            text-align: center;
            border-radius: 20px;
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .success {
            color: #28a745;
        }
        
        .error {
            color: #dc3545;
        }
        
        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="Logo de Seres">
        </a>
    </header>

    <div class="verification-container">
        <?php if ($success): ?>
            <h1 class="success">¡Verificación Exitosa!</h1>
            <p><?= $message ?></p>
            <a href="/iniciar.php" class="btn">Iniciar Sesión</a>
        <?php else: ?>
            <h1 class="error">Error de Verificación</h1>
            <p><?= $message ?></p>
            <a href="/iniciar.php" class="btn">Volver al Inicio</a>
        <?php endif; ?>
    </div>
</body>
</html>