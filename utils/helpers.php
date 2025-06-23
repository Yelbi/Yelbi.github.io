<?php
// utils/helpers.php
function sendEmail($to, $subject, $message, $headers = '') {
    // Configurar según tu servidor de correo
    $default_headers = "From: bgrandiel@seres.blog\r\n";
    $default_headers .= "Reply-To: bgrandiel@seres.blog\r\n";
    $default_headers .= "MIME-Version: 1.0\r\n";
    $default_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $default_headers . $headers);
}

function logError($message, $file = 'error.log') {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($file, $log_message, FILE_APPEND | LOCK_EX);
}

function generateEmailVerificationTemplate($name, $verification_link) {
    return "
    <html>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px;'>
            <h2 style='color: #333;'>¡Bienvenido $name!</h2>
            <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu email haciendo clic en el enlace:</p>
            <a href='$verification_link' style='display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;'>Verificar Email</a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:<br>
            <small>$verification_link</small></p>
            <p><small>Este enlace expirará en 24 horas.</small></p>
        </div>
    </body>
    </html>";
}

function generatePasswordResetTemplate($name, $reset_link) {
    return "
    <html>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px;'>
            <h2 style='color: #333;'>Restablecer Contraseña</h2>
            <p>Hola $name,</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace para crear una nueva:</p>
            <a href='$reset_link' style='display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;'>Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            <p><small>Este enlace expirará en 1 hora.</small></p>
        </div>
    </body>
    </html>";
}

// Función para generar respuesta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Función para obtener IP del cliente
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Autoload simple
function autoload($class) {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
}
spl_autoload_register('autoload');

// Configuración de sesiones PHP nativas
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);