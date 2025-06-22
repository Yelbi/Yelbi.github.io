<?php
// api/auth.php
require_once '../config/database.php';
require_once '../classes/User.php';
require_once '../classes/Security.php';
require_once '../classes/Session.php';
require_once '../utils/helpers.php';

// Configuración CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$security = new Security($db);
$session = new Session($db);

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
                login($user, $security, $session, $input);
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
                logout($session, $input);
                break;
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'profile':
                getProfile($user, $session);
                break;
            case 'verify-session':
                verifySession($session);
                break;
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'PUT':
        switch ($action) {
            case 'profile':
                updateProfile($user, $session, $input);
                break;
            case 'change-password':
                changePassword($user, $session, $input);
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
function login($user, $security, $session, $input) {
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

            // Crear sesión
            $sessionToken = $session->create(
                $userData['id'], 
                $ip, 
                $_SERVER['HTTP_USER_AGENT'] ?? ''
            );

            if ($sessionToken) {
                $security->logLoginAttempt($email, $ip, true);
                
                jsonResponse([
                    'success' => true,
                    'message' => 'Login exitoso',
                    'user' => $userData,
                    'session_token' => $sessionToken
                ]);
            } else {
                jsonResponse(['error' => 'Error al crear sesión'], 500);
            }
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

// Obtener perfil
function getProfile($user, $session) {
    try {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            jsonResponse(['error' => 'Token de autorización requerido'], 401);
        }

        $sessionData = $session->validate($token);
        if (!$sessionData) {
            jsonResponse(['error' => 'Sesión inválida o expirada'], 401);
        }

        $userData = $user->getById($sessionData['user_id']);
        if ($userData) {
            jsonResponse([
                'success' => true,
                'user' => $userData
            ]);
        } else {
            jsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

    } catch (Exception $e) {
        logError('Error al obtener perfil: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Verificar sesión
function verifySession($session) {
    try {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            jsonResponse(['valid' => false, 'error' => 'Token requerido'], 401);
        }

        $sessionData = $session->validate($token);
        if ($sessionData) {
            jsonResponse(['valid' => true, 'user' => $sessionData]);
        } else {
            jsonResponse(['valid' => false, 'error' => 'Sesión inválida'], 401);
        }

    } catch (Exception $e) {
        logError('Error al verificar sesión: ' . $e->getMessage());
        jsonResponse(['valid' => false, 'error' => 'Error interno del servidor'], 500);
    }
}

// Actualizar perfil
function updateProfile($user, $session, $input) {
    try {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            jsonResponse(['error' => 'Token de autorización requerido'], 401);
        }

        $sessionData = $session->validate($token);
        if (!$sessionData) {
            jsonResponse(['error' => 'Sesión inválida o expirada'], 401);
        }

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
        if ($user->emailExists($email, $sessionData['user_id'])) {
            jsonResponse(['error' => 'Ya existe una cuenta con este email'], 400);
        }

        // Actualizar perfil
        if ($user->updateProfile($sessionData['user_id'], $name, $email, $phone)) {
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
function changePassword($user, $session, $input) {
    try {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            jsonResponse(['error' => 'Token de autorización requerido'], 401);
        }

        $sessionData = $session->validate($token);
        if (!$sessionData) {
            jsonResponse(['error' => 'Sesión inválida o expirada'], 401);
        }

        if (!isset($input['new_password'])) {
            jsonResponse(['error' => 'Nueva contraseña requerida'], 400);
        }

        $newPassword = $input['new_password'];

        if (!Security::validatePassword($newPassword)) {
            jsonResponse(['error' => 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números'], 400);
        }

        if ($user->changePassword($sessionData['user_id'], $newPassword)) {
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

// Cerrar sesión
function logout($session, $input) {
    try {
        $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = str_replace('Bearer ', '', $token);

        if (!$token) {
            jsonResponse(['error' => 'Token de autorización requerido'], 401);
        }

        if ($session->destroy($token)) {
            jsonResponse([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'Error al cerrar sesión'], 500);
        }

    } catch (Exception $e) {
        logError('Error al cerrar sesión: ' . $e->getMessage());
        jsonResponse(['error' => 'Error interno del servidor'], 500);
    }
}

// Limpiar logs y sesiones antiguas (ejecutar en cron job)
if (isset($_GET['cleanup']) && $_GET['cleanup'] === 'true') {
    try {
        $security->cleanOldAttempts();
        $session->cleanup();
        jsonResponse(['success' => true, 'message' => 'Limpieza completada']);
    } catch (Exception $e) {
        logError('Error en limpieza: ' . $e->getMessage());
        jsonResponse(['error' => 'Error en limpieza'], 500);
    }
}
?><?php