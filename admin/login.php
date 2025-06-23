<?php
// admin/login.php
session_start();
require_once '../config/database.php';
require_once '../classes/User.php';
require_once '../classes/Security.php';

$database = new Database();
$db = $database->getConnection();
$security = new Security($db);
$user = new User($db);

// Redirigir si ya está autenticado
if ($security->isAdmin()) {
    header("Location: feedback.php");
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $userData = $user->login($email, $password);
    
    if ($userData && $security->isAdmin()) {
        header("Location: feedback.php");
        exit;
    } else {
        $error = "Credenciales incorrectas o no tienes permisos de administrador";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Administrador - Seres</title>
    <link rel="stylesheet" href="../styles/iniciar.css">
</head>
<body>
    <div class="container">
        <div class="form-container active">
            <h2>Acceso Administrador</h2>
            <?php if ($error): ?>
                <div class="alert alert-error"><?= $error ?></div>
            <?php endif; ?>
            <form method="POST">
                <div class="form-group">
                    <label for="adminEmail">Correo Electrónico</label>
                    <input type="email" id="adminEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Contraseña</label>
                    <input type="password" id="adminPassword" name="password" required>
                </div>
                <button type="submit" class="btn">Acceder al Panel</button>
            </form>
        </div>
    </div>
</body>
</html>