<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// api/auth.php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/User.php';
require_once __DIR__ . '/../classes/Security.php';
require_once __DIR__ . '/../utils/helpers.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Configuración CORS
header("Access-Control-Allow-Origin: https://seres.blog");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Clave secreta para JWT
define('JWT_SECRET', '123456789Grandiel$');
define('JWT_ALGORITHM', 'HS256');

$database = new Database();
$db = $database->getConnection();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
            case 'logout':
                logout();
                break;
            case 'submit-complaint':
                submitComplaint($input);
                break;
            case 'delete-complaint':
                deleteComplaint($input);
                break;
            case 'request-password-reset':
                try {
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!isset($data['email'])) {
                        throw new Exception('Email requerido');
                    }
                    
                    // Usar $db en lugar de $pdo
                    createPasswordResetTable($db);
                    cleanExpiredTokens($db);
                    $result = requestPasswordReset($data['email'], $db);
                    
                    http_response_code(200);
                    echo json_encode($result);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode(['error' => $e->getMessage()]);
                }
                break;
                
            case 'reset-password':
                try {
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!isset($data['token']) || !isset($data['new_password'])) {
                        throw new Exception('Token y nueva contraseña requeridos');
                    }
                    
                    // CORRECCIÓN: Usar $db en lugar de $pdo
                    $result = resetPassword($data['token'], $data['new_password'], $db);
                    
                    http_response_code(200);
                    echo json_encode($result);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode(['error' => $e->getMessage()]);
                }
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
            case 'get-complaints':
                getComplaints();
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

        $verification_token = $user->create();

        if ($verification_token) {
            // Enviar email de verificación
            $verification_link = "https://seres.blog/verify.php?token=" . $verification_token;
            $email_body = generateEmailVerificationTemplate($name, $verification_link);
            
            $email_sent = sendEmail($email, "Verifica tu cuenta", $email_body);
            
            // Para debug, incluir el token en desarrollo
            $response = [
                'success' => true,
                'message' => 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
                'user_id' => $user->id
            ];
            
            if (!$email_sent) {
                logError("Fallo al enviar email de verificación a: $email");
                $response['verification_token'] = $verification_token; // Solo para debug
                $response['message'] = 'Cuenta creada, pero no se pudo enviar el email. Usa este token para verificación: ' . $verification_token;
            }

            jsonResponse($response);
        }
        jsonResponse(['error' => 'Error al crear la cuenta'], 500);

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

        if ($security->isBlocked($email, $ip)) {
            jsonResponse(['error' => 'Demasiados intentos fallidos. Intenta en 15 minutos.'], 429);
        }

        $userData = $user->login($email, $password);

        if ($userData) {
            if (!$userData['email_verified']) {
                $security->logLoginAttempt($email, $ip, false);
                jsonResponse(['error' => 'Debes verificar tu email antes de iniciar sesión'], 403);
            }

            // Generar token JWT
            $issuedAt = time();
            $expirationTime = $issuedAt + 3600;
            
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'sub' => $userData['id'],
                'email' => $userData['email'],
                'is_admin' => ($userData['role'] === 'admin')
            ];

            // Generar token
            $jwt = JWT::encode($payload, JWT_SECRET, JWT_ALGORITHM);
            
            $security->logLoginAttempt($email, $ip, true);
            
            jsonResponse([
                'success' => true,
                'message' => 'Login exitoso',
                'token' => $jwt,
                'user' => [
                    'id' => $userData['id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'role' => $userData['role'] // Asegurar que el rol se envía
                ],
                'is_admin' => ($userData['role'] === 'admin') // Para compatibilidad
            ]);
        } else {
            $security->logLoginAttempt($email, $ip, false);
            jsonResponse(['error' => 'Email o contraseña incorrectos'], 401);
        }

    } catch (Exception $e) {
        error_log('Error en login: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
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
function getProfile($user) {
    try {
        $authData = authenticateJWT();
        $userId = $authData['sub'];
        
        $userData = $user->getById($userId);
        if ($userData) {
            jsonResponse([
                'success' => true,
                'user' => [
                    'id' => $userData['id'],
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'role' => $userData['role'] // Asegurar que role está incluido
                ]
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
        if ($user->updateProfile($userId, $name, $email)) {
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

// Enviar queja/sugerencia
function submitComplaint($input) {
    global $db;
    
    try {
        $authData = authenticateJWT();
        $userId = $authData['sub'];
        
        if (!isset($input['subject'], $input['description'])) {
            jsonResponse(['error' => 'Asunto y descripción requeridos'], 400);
        }
        
        $subject = Security::sanitizeInput($input['subject']);
        $description = Security::sanitizeInput($input['description']);
        
        // Guardar en base de datos
        $stmt = $db->prepare("INSERT INTO complaints (user_id, subject, description) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $subject, $description]);
        
        jsonResponse(['success' => true, 'message' => 'Mensaje enviado']);
        
    } catch (Exception $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// Obtener quejas para administrador
function getComplaints() {
    global $db, $user;
    
    try {
        $authData = authenticateJWT();
        
        // Verificar si es administrador usando role
        $userData = $user->getById($authData['sub']);
        if (!$userData || $userData['role'] !== 'admin') {
            jsonResponse(['error' => 'No autorizado'], 403);
        }
        
        // Obtener quejas
        $stmt = $db->query("
            SELECT c.*, u.email AS user_email 
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        ");
        $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(['success' => true, 'complaints' => $complaints]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

function deleteComplaint($input) {
    global $db, $user;
    
    try {
        $authData = authenticateJWT();
        
        // Verificar si es administrador
        $userData = $user->getById($authData['sub']);
        if (!$userData || $userData['role'] !== 'admin') {
            jsonResponse(['error' => 'No autorizado'], 403);
        }
        
        if (!isset($input['id'])) {
            jsonResponse(['error' => 'ID de mensaje requerido'], 400);
        }
        
        $id = (int)$input['id'];
        
        // Eliminar la queja
        $stmt = $db->prepare("DELETE FROM complaints WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse(['success' => true, 'message' => 'Mensaje eliminado']);
        } else {
            jsonResponse(['error' => 'Mensaje no encontrado'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

function requestPasswordReset($email, $pdo) {
    try {
        // Validar email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido');
        }
        
        // Verificar si el email existe y está verificado
        $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE email = ? AND email_verified = 1");
        $stmt->execute([$email]);
        $userData = $stmt->fetch();
        
        if (!$userData) {
            // Por seguridad, no revelar si el email existe
            return [
                'success' => true,
                'message' => 'Si el correo existe, recibirás un enlace de recuperación en breve.'
            ];
        }
        
        // Generar token de recuperación
        $resetToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Eliminar tokens anteriores
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$userData['id']]);
        
        // Insertar nuevo token
        $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$userData['id'], $resetToken, $expiresAt]);
        
        // Enviar email con enlace de recuperación
        $resetLink = "https://seres.blog/iniciar.php?token=" . $resetToken;
        $emailBody = generatePasswordResetTemplate($userData['name'], $resetLink);
        
        $email_sent = sendEmail($email, "Recuperación de contraseña", $emailBody);
        
        if ($email_sent) {
            return [
                'success' => true,
                'message' => 'Se ha enviado un enlace de recuperación a tu correo'
            ];
        } else {
            throw new Exception('Error al enviar el correo de recuperación');
        }
        
    } catch (Exception $e) {
        throw new Exception('Error al procesar la solicitud: ' . $e->getMessage());
    }
}

/**Restablecer contraseña con token*/
function resetPassword($token, $newPassword, $pdo) {
    try {
        // Validar entrada
        if (empty($token) || empty($newPassword)) {
            throw new Exception('Todos los campos son obligatorios');
        }
        
        // Validar contraseña
        if (strlen($newPassword) < 8) {
            throw new Exception('La contraseña debe tener al menos 8 caracteres');
        }
        
        if (!preg_match('/[A-Z]/', $newPassword) || 
            !preg_match('/[a-z]/', $newPassword) || 
            !preg_match('/[0-9]/', $newPassword)) {
            throw new Exception('La contraseña debe contener mayúsculas, minúsculas y números');
        }
        
        // Verificar token
        $stmt = $pdo->prepare("
            SELECT pr.user_id, pr.expires_at, u.email 
            FROM password_resets pr 
            JOIN users u ON pr.user_id = u.id 
            WHERE pr.token = ? AND pr.expires_at > NOW()
        ");
        $stmt->execute([$token]);
        $resetData = $stmt->fetch();
        
        if (!$resetData) {
            throw new Exception('Token inválido o expirado');
        }
        
        // Verificar si el usuario existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$resetData['user_id']]);
        if (!$stmt->fetch()) {
            throw new Exception('Usuario no existe');
        }
        
        // Actualizar contraseña
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $resetData['user_id']]);
        
        // Eliminar token usado
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$resetData['user_id']]);
        
        // Log de seguridad
        error_log("Password reset successful for user: " . $resetData['email']);
        
        return [
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ];
        
    } catch (Exception $e) {
        throw new Exception('Error al restablecer contraseña: ' . $e->getMessage());
    }
}

/**Crear tabla de password_resets si no existe*/
function createPasswordResetTable($pdo) {
    $sql = "CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_expires (expires_at)
    )";
    
    $pdo->exec($sql);
}

function cleanExpiredTokens($pdo) {
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE expires_at < NOW()");
    $stmt->execute();
    return $stmt->rowCount();
}