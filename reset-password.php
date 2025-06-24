<?php
// reset-password.php
session_start();

$token = $_GET['token'] ?? '';
$error = '';
$success = false;
$debug_info = '';

// Para debugging - verifica el token al cargar la página
if (!empty($token)) {
    $verifyData = ['token' => $token];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://seres.blog/api/auth.php?action=verify-reset-token');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($verifyData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $verifyResponse = curl_exec($ch);
    $verifyHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($verifyResponse !== false) {
        $verifyResult = json_decode($verifyResponse, true);
        if (!$verifyResult['valid']) {
            $debug_info = 'Token verificación: ' . $verifyResult['reason'];
        }
    }
}

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    error_log('POST recibido - Token: ' . $token);
    error_log('POST recibido - Password length: ' . strlen($newPassword));
    
    // Validar contraseñas
    if ($newPassword !== $confirmPassword) {
        $error = 'Las contraseñas no coinciden';
    } elseif (strlen($newPassword) < 8 || !preg_match('/[a-z]/', $newPassword) || !preg_match('/[A-Z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
        $error = 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
    } else {
        // Llamar a la API para restablecer la contraseña
        $data = [
            'token' => $token,
            'password' => $newPassword
        ];
        
        error_log('Enviando datos a API: ' . json_encode($data));
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://seres.blog/api/auth.php?action=reset-password');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Aumentar timeout
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        error_log('Respuesta API - HTTP Code: ' . $httpCode);
        error_log('Respuesta API - Response: ' . $response);
        error_log('Respuesta API - cURL Error: ' . $curlError);
        
        if ($response === false) {
            $error = 'Error de conexión con el servidor: ' . $curlError;
        } else {
            $result = json_decode($response, true);
            
            if ($httpCode === 200 && isset($result['success']) && $result['success']) {
                $success = true;
            } else {
                $error = $result['error'] ?? 'Error desconocido (HTTP: ' . $httpCode . ')';
                error_log('Error final: ' . $error);
            }
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
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
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
        
        .alert-warning {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
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
        
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #1a2a6c;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .debug-info {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 15px;
            font-size: 12px;
            color: #6c757d;
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
                
                <?php if ($debug_info): ?>
                    <div class="debug-info">Debug: <?= htmlspecialchars($debug_info) ?></div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>
                
                <?php if (empty($token)): ?>
                    <div class="alert alert-error">Token no proporcionado o inválido</div>
                    <a href="iniciar.php" class="link-btn">Volver a Iniciar Sesión</a>
                <?php else: ?>
                    <div class="loading" id="loading">
                        <div class="spinner"></div>
                        <p>Procesando...</p>
                    </div>
                    
                    <form method="POST" action="" id="resetForm">
                        <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">
                        
                        <div class="form-group">
                            <label for="new_password">Nueva Contraseña</label>
                            <input type="password" id="new_password" name="new_password" required>
                            <div class="password-strength">
                                <div class="password-strength-meter" id="passwordStrengthMeter"></div>
                            </div>
                            <div class="password-rules">
                                La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm_password">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirm_password" name="confirm_password" required>
                        </div>
                        
                        <button type="submit" class="btn" id="submitBtn">Restablecer Contraseña</button>
                    </form>
                <?php endif; ?>
            <?php endif; ?>
            
            <?php if (!$success): ?>
                <a href="iniciar.php" class="link-btn">Volver a Iniciar Sesión</a>
            <?php endif; ?>
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
        
        // Validar formulario
        document.getElementById('resetForm').addEventListener('submit', function(e) {
            const password = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const submitBtn = document.getElementById('submitBtn');
            const loading = document.getElementById('loading');
            const form = document.getElementById('resetForm');
            
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
            
            // Mostrar loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
            loading.style.display = 'block';
            form.style.opacity = '0.6';
            
            return true;
        });
    </script>
</body>
</html>