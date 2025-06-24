<?php
// reset-password.php
session_start();
require_once __DIR__ . '/utils/helpers.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/classes/User.php';
require_once __DIR__ . '/classes/Security.php';

// Establecer conexión con la base de datos
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$token = $_GET['token'] ?? '';
$error = '';
$success = false;
$newPassword = '';
$confirmPassword = '';

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Validar contraseñas
    if ($newPassword !== $confirmPassword) {
        $error = 'Las contraseñas no coinciden';
    } elseif (!Security::validatePassword($newPassword)) {
        $error = 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
    } else {
        // Intentar restablecer la contraseña
        if ($user->resetPassword($token, $newPassword)) {
            $success = true;
        } else {
            $error = 'Token inválido o expirado';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña | SERES</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 450px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            padding: 40px;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo h1 {
            color: #1a2a6c;
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .logo span {
            color: #fdbb2d;
        }
        
        .form-container {
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        h2 {
            color: #333;
            margin-bottom: 25px;
            text-align: center;
            font-weight: 600;
            font-size: 1.8rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border 0.3s, box-shadow 0.3s;
        }
        
        input:focus {
            border-color: #1a2a6c;
            box-shadow: 0 0 0 3px rgba(26, 42, 108, 0.2);
            outline: none;
        }
        
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(to right, #1a2a6c, #b21f1f);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-size: 15px;
            text-align: center;
        }
        
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .link-btn {
            display: block;
            text-align: center;
            color: #1a2a6c;
            margin-top: 20px;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .link-btn:hover {
            color: #fdbb2d;
            text-decoration: underline;
        }
        
        .password-strength {
            height: 5px;
            background: #eee;
            border-radius: 3px;
            margin-top: 5px;
            overflow: hidden;
        }
        
        .password-strength-meter {
            height: 100%;
            width: 0;
            background: #ff0000;
            transition: width 0.3s, background 0.3s;
        }
        
        .password-rules {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }
        
        .success-icon {
            display: block;
            text-align: center;
            font-size: 60px;
            color: #28a745;
            margin: 20px 0;
        }
        
        .success-message {
            text-align: center;
            margin-bottom: 25px;
            color: #333;
            font-size: 18px;
            line-height: 1.6;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 25px;
            }
            
            .logo h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>SERES<span>.</span></h1>
        </div>
        
        <div class="form-container">
            <?php if ($success): ?>
                <div class="success-icon">✓</div>
                <div class="success-message">
                    ¡Tu contraseña ha sido restablecida exitosamente!
                </div>
                <a href="iniciar.php" class="btn">Iniciar Sesión</a>
            <?php else: ?>
                <h2>Restablecer Contraseña</h2>
                
                <?php if ($error): ?>
                    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                
                <?php if (empty($token)): ?>
                    <div class="alert alert-error">Token no proporcionado o inválido</div>
                <?php else: ?>
                    <form method="POST">
                        <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">
                        
                        <div class="form-group">
                            <label for="new_password">Nueva Contraseña</label>
                            <input type="password" id="new_password" name="new_password" required value="<?= htmlspecialchars($newPassword) ?>">
                            <div class="password-strength">
                                <div class="password-strength-meter" id="passwordStrengthMeter"></div>
                            </div>
                            <div class="password-rules">
                                La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm_password">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirm_password" name="confirm_password" required value="<?= htmlspecialchars($confirmPassword) ?>">
                        </div>
                        
                        <button type="submit" class="btn">Restablecer Contraseña</button>
                    </form>
                <?php endif; ?>
            <?php endif; ?>
            
            <a href="iniciar.php" class="link-btn">Volver a Iniciar Sesión</a>
        </div>
    </div>

    <script>
        // Validación de fortaleza de contraseña en tiempo real
        document.getElementById('new_password').addEventListener('input', function() {
            const password = this.value;
            const strengthMeter = document.getElementById('passwordStrengthMeter');
            let strength = 0;
            
            // Longitud mínima
            if (password.length >= 8) strength += 25;
            
            // Contiene letras minúsculas
            if (/[a-z]/.test(password)) strength += 25;
            
            // Contiene letras mayúsculas
            if (/[A-Z]/.test(password)) strength += 25;
            
            // Contiene números
            if (/\d/.test(password)) strength += 25;
            
            strengthMeter.style.width = strength + '%';
            
            // Cambiar color según fortaleza
            if (strength < 50) {
                strengthMeter.style.backgroundColor = '#ff0000';
            } else if (strength < 75) {
                strengthMeter.style.backgroundColor = '#ff9900';
            } else {
                strengthMeter.style.backgroundColor = '#28a745';
            }
        });
        
        // Validar que las contraseñas coincidan
        document.querySelector('form').addEventListener('submit', function(e) {
            const password = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Las contraseñas no coinciden');
                return false;
            }
            
            // Validación básica de requisitos
            if (password.length < 8) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 8 caracteres');
                return false;
            }
            
            if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
                e.preventDefault();
                alert('La contraseña debe incluir mayúsculas, minúsculas y números');
                return false;
            }
            
            return true;
        });
    </script>
</body>
</html>