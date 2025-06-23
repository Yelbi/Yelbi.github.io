<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/classes/User.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    die("Token no proporcionado");
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

if ($user->verifyEmail($token)) {
    $message = "¡Email verificado! Ya puedes iniciar sesión.";
    $success = true;
} else {
    $message = "Token inválido. Solicita un nuevo enlace.";
    $success = false;
}
?>

<!-- HTML mínimo -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificación de Email</title>
    <style>
        .container { max-width: 600px; margin: 50px auto; text-align: center; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <?php if ($success): ?>
            <h1 class="success">¡Verificado!</h1>
            <p><?= $message ?></p>
            <a href="/iniciar.php">Iniciar Sesión</a>
        <?php else: ?>
            <h1 class="error">Error</h1>
            <p><?= $message ?></p>
            <a href="/">Volver al Inicio</a>
        <?php endif; ?>
    </div>
</body>
</html>