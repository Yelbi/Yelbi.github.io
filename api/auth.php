<?php
// api/auth.php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/User.php';
require_once __DIR__ . '/../classes/Security.php';
require_once __DIR__ . '/../utils/helpers.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Configuración CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clave secreta para JWT - ¡CAMBIA ESTO POR UNA CLAVE SEGURA EN PRODUCCIÓN!
define('JWT_SECRET', '123456789Grandiel$');
define('JWT_ALGORITHM', 'HS256');

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$security = new Security($db);

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'register':
                register($user, $security, $input);
                break;
            case 'login':
                login($user, $security, $input);
                break;
            case 'verify-email':
                verifyEmail($user, $input);
                break;
            case 'forgot-password':
                forgotPassword($user, $input);
                break;
            case 'reset-password':
                resetPassword($user, $input);
                break;
            case 'logout':
                logout();
                break;
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'profile':
                getProfile($user);
                break;
            case 'verify-session':
                verifySession();
                break;
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'PUT':
        switch ($action) {
            case 'profile':
                updateProfile($user, $input);
                break;
            case 'change-password':
                changePassword($user, $input);
                break;
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}

// Función de registro
function register($user, $security, $input) {
    try {
        // Validar datos
        if (!isset($input['name'], $input['email'], $input['password'])) {
            jsonResponse(['error' => 'Faltan campos requeridos'], 400);
        }

        $name = Security::sanitizeInput($input['name']);
        $email = Security::sanitizeInput($input['email']);
        $password = $input['password'];
        $phone = Security::sanitizeInput($input['phone'] ?? '');

        // Validaciones
        if (strlen($name) < 2) {
            jsonResponse(['error' => 'El nombre debe tener al menos 2 caracteres'], 400);
        }

        if (!Security::validateEmail($email)) {
            jsonResponse(['error' => 'Email no válido'], 400);
        }

        if (!Security::validatePassword($password)) {
            jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'], 400);
        }

        // Verificar si el email ya existe
        if ($user->emailExists($email)) {
            jsonResponse(['error' => 'Ya existe una cuenta con este email'], 400);
        }

        // Crear usuario
        $user->name = $name;
        $user->email = $email;
        $user->password = $password;
        $user->phone = $phone;

        $verification_token = $user->create();

        if ($verification_token) {
            // Enviar email de verificación
            $verification_link = "https://tudominio.com/verify.php?token=" . $verification_token;
            $email_body = generateEmailVerificationTemplate($name, $verification_link);
            
            if (sendEmail($email, "Verifica tu cuenta", $email_body)) {
                jsonResponse([
                    'success' => true,
                    'message' => 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
                    'user_id' => $user->id
                ]);
            } else {
                jsonResponse([
                    'success' => true,
                    'message' => 'Cuenta creada, pero no se pudo enviar el email de verificación.',
                    'user_id' => $user->id
                ]);
            }
        } else {
            jsonResponse(['error' => 'Error al crear la cuenta'], 500);
        }

    } catch (Exception $e) {
        logError('Error en registro: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Función de login
function login($user, $security, $input) {
    try {
        if (!isset($input['email'], $input['password'])) {
            jsonResponse(['error' => 'Email y contraseña requeridos'], 400);
        }

        $email = Security::sanitizeInput($input['email']);
        $password = $input['password'];
        $ip = getClientIP();

        // Verificar si está bloqueado
        if ($security->isBlocked($email, $ip)) {
            jsonResponse(['error' => 'Demasiados intentos fallidos. Intenta en 15 minutos.'], 429);
        }

        // Intentar login
        $userData = $user->login($email, $password);

        if ($userData) {
            // Verificar si el email está verificado
            if (!$userData['email_verified']) {
                $security->logLoginAttempt($email, $ip, false);
                jsonResponse(['error' => 'Debes verificar tu email antes de iniciar sesión'], 403);
            }

            // Generar token JWT
            $issuedAt = time();
            $expirationTime = $issuedAt + 3600; // 1 hora de validez
            
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'sub' => $userData['id'],
                'email' => $userData['email']
            ];

            $jwt = JWT::encode($payload, JWT_SECRET, JWT_ALGORITHM);
            
            $security->logLoginAttempt($email, $ip, true);
            
            jsonResponse([
                'success' => true,
                'message' => 'Login exitoso',
                'user' => $userData,
                'token' => $jwt
            ]);
        } else {
            $security->logLoginAttempt($email, $ip, false);
            jsonResponse(['error' => 'Credenciales incorrectas'], 401);
        }

    } catch (Exception $e) {
        logError('Error en login: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Verificar email
function verifyEmail($user, $input) {
    try {
        if (!isset($input['token'])) {
            jsonResponse(['error' => 'Token requerido'], 400);
        }

        $token = Security::sanitizeInput($input['token']);

        if ($user->verifyEmail($token)) {
            jsonResponse([
                'success' => true,
                'message' => 'Email verificado exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'Token inválido o expirado'], 400);
        }

    } catch (Exception $e) {
        logError('Error en verificación de email: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Recuperar contraseña
function forgotPassword($user, $input) {
    try {
        if (!isset($input['email'])) {
            jsonResponse(['error' => 'Email requerido'], 400);
        }

        $email = Security::sanitizeInput($input['email']);

        if (!Security::validateEmail($email)) {
            jsonResponse(['error' => 'Email no válido'], 400);
        }

        $userData = $user->getByEmail($email);
        if (!$userData) {
            // Por seguridad, no revelamos si el email existe o no
            jsonResponse([
                'success' => true,
                'message' => 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
            ]);
        }

        $resetToken = $user->generatePasswordResetToken($email);
        if ($resetToken) {
            $resetLink = "https://tudominio.com/reset-password.php?token=" . $resetToken;
            $emailBody = generatePasswordResetTemplate($userData['name'], $resetLink);
            
            sendEmail($email, "Restablecer contraseña", $emailBody);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
        ]);

    } catch (Exception $e) {
        logError('Error en recuperar contraseña: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Restablecer contraseña
function resetPassword($user, $input) {
    try {
        if (!isset($input['token'], $input['password'])) {
            jsonResponse(['error' => 'Token y contraseña requeridos'], 400);
        }

        $token = Security::sanitizeInput($input['token']);
        $password = $input['password'];

        if (!Security::validatePassword($password)) {
            jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'], 400);
        }

        if ($user->resetPassword($token, $password)) {
            jsonResponse([
                'success' => true,
                'message' => 'Contraseña restablecida exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'Token inválido o expirado'], 400);
        }

    } catch (Exception $e) {
        logError('Error al restablecer contraseña: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Obtener perfil
function getProfile($user) {
    try {
        $authData = authenticateJWT();
        $userId = $authData['sub'];
        
        $userData = $user->getById($userId);
        if ($userData) {
            jsonResponse([
                'success' => true,
                'user' => $userData
            ]);
        } else {
            jsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

    } catch (Exception $e) {
        jsonResponse(['error' => $e->getMessage()], 401);
    }
}

// Verificar sesión (token JWT)
function verifySession() {
    try {
        $authData = authenticateJWT();
        jsonResponse(['valid' => true, 'user' => $authData]);
    } catch (Exception $e) {
        jsonResponse(['valid' => false, 'error' => $e->getMessage()], 401);
    }
}

// Actualizar perfil
function updateProfile($user, $input) {
    try {
        $authData = authenticateJWT();
        $userId = $authData['sub'];

        if (!isset($input['name'], $input['email'])) {
            jsonResponse(['error' => 'Nombre y email requeridos'], 400);
        }

        $name = Security::sanitizeInput($input['name']);
        $email = Security::sanitizeInput($input['email']);
        $phone = Security::sanitizeInput($input['phone'] ?? '');

        // Validaciones
        if (strlen($name) < 2) {
            jsonResponse(['error' => 'El nombre debe tener al menos 2 caracteres'], 400);
        }

        if (!Security::validateEmail($email)) {
            jsonResponse(['error' => 'Email no válido'], 400);
        }

        // Verificar si el email ya existe (excluyendo el usuario actual)
        if ($user->emailExists($email, $userId)) {
            jsonResponse(['error' => 'Ya existe una cuenta con este email'], 400);
        }

        // Actualizar perfil
        if ($user->updateProfile($userId, $name, $email, $phone)) {
            jsonResponse([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'Error al actualizar perfil'], 500);
        }

    } catch (Exception $e) {
        logError('Error al actualizar perfil: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Cambiar contraseña
function changePassword($user, $input) {
    try {
        $authData = authenticateJWT();
        $userId = $authData['sub'];

        if (!isset($input['new_password'])) {
            jsonResponse(['error' => 'Nueva contraseña requerida'], 400);
        }

        $newPassword = $input['new_password'];

        if (!Security::validatePassword($newPassword)) {
            jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'], 400);
        }

        if ($user->changePassword($userId, $newPassword)) {
            jsonResponse([
                'success' => true,
                'message' => 'Contraseña cambiada exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'Error al cambiar contraseña'], 500);
        }

    } catch (Exception $e) {
        logError('Error al cambiar contraseña: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Cerrar sesión (solo para el frontend)
function logout() {
    jsonResponse([
        'success' => true,
        'message' => 'Sesión cerrada exitosamente'
    ]);
}

// Middleware de autenticación JWT
function authenticateJWT() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGORITHM));
            return (array) $decoded;
        } catch (Exception $e) {
            throw new Exception('Token inválido: ' . $e->getMessage());
        }
    }

    throw new Exception('Token no proporcionado');
}

// Limpiar logs de intentos fallidos (ejecutar en cron job)
if (isset($_GET['cleanup']) && $_GET['cleanup'] === 'true') {
    try {
        $security->cleanOldAttempts();
        jsonResponse(['success' => true, 'message' => 'Limpieza completada']);
    } catch (Exception $e) {
        logError('Error en limpieza: ' . $e->getMessage());
        jsonResponse(['error' => 'Error en limpieza'], 500);
    }
}