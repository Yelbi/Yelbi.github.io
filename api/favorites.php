<?php
// Desactivar display de errores para evitar salida HTML
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Capturar cualquier salida no deseada
ob_start();

require_once '../config/connection.php';
require_once '../config/jwt.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Define JWT secret key usando la constante existente
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', '123456789Grandiel$');
}

// Limpiar cualquier salida previa
ob_clean();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// Función para log de errores mejorado
function logError($message, $context = []) {
    $logMessage = "FAVORITES API: " . $message;
    if (!empty($context)) {
        $logMessage .= " | Context: " . json_encode($context);
    }
    error_log($logMessage);
}

// Función para respuesta de error consistente
function errorResponse($code, $message, $details = null) {
    // Limpiar cualquier salida previa
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code($code);
    $response = ['error' => $message];
    if ($details) {
        $response['details'] = $details;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Función para respuesta de éxito
function successResponse($data) {
    // Limpiar cualquier salida previa
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Verificar que PDO existe
if (!isset($pdo)) {
    logError("PDO connection not available");
    errorResponse(500, "Error de conexión a la base de datos");
}

// Crear tabla de favoritos si no existe
try {
    createFavoritesTable($pdo);
} catch (Exception $e) {
    logError("Error creating favorites table", ['error' => $e->getMessage()]);
    errorResponse(500, "Error inicializando base de datos");
}

$action = $_GET['action'] ?? '';
$token = getBearerToken();

if (!$token) {
    logError("No token provided", ['headers' => getallheaders()]);
    errorResponse(401, "No autorizado - Token requerido");
}

try {
    // Verificar que la clase JWT existe
    if (!class_exists('Firebase\\JWT\\JWT')) {
        logError("JWT class not found");
        errorResponse(500, "Error de configuración del servidor");
    }

    // Usar el método de decodificación existente en jwt.php
    $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
    
    // CORRECCIÓN CLAVE: Usar 'sub' en lugar de 'user_id'
    $userId = $decoded->sub ?? $decoded->user_id ?? null;
    
    if (!$userId) {
        logError("No user ID in token", ['decoded' => (array)$decoded]);
        errorResponse(401, "Token inválido - No se encontró ID de usuario");
    }

    logError("Processing action", ['action' => $action, 'userId' => $userId]);
    
    switch ($action) {
        case 'list':
            listFavorites($pdo, $userId);
            break;
        case 'add':
            addFavorite($pdo, $userId);
            break;
        case 'remove':
            removeFavorite($pdo, $userId);
            break;
        default:
            logError("Invalid action", ['action' => $action]);
            errorResponse(400, "Acción inválida");
            break;
    }
} catch (PDOException $e) {
    logError("PDO Exception", ['error' => $e->getMessage(), 'code' => $e->getCode()]);
    errorResponse(500, "Error de base de datos");
} catch (Exception $e) {
    logError("General Exception", ['error' => $e->getMessage(), 'code' => $e->getCode()]);
    errorResponse(401, "Token inválido o expirado");
}

function createFavoritesTable($pdo) {
    try {
        $sql = "CREATE TABLE IF NOT EXISTS user_favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ser_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_ser (user_id, ser_id),
            INDEX idx_user_id (user_id),
            INDEX idx_ser_id (ser_id)
        )";
        
        $pdo->exec($sql);
        logError("Favorites table created/verified successfully");
    } catch (PDOException $e) {
        logError("Error creating favorites table", ['error' => $e->getMessage()]);
        throw $e;
    }
}

function listFavorites($pdo, $userId) {
    try {
        // Verificar que la tabla seres existe
        $stmt = $pdo->prepare("SHOW TABLES LIKE 'seres'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            logError("Table 'seres' does not exist");
            errorResponse(500, "Error de configuración de base de datos");
        }

        // Consulta simplificada sin verificar tablas de traducción
        $stmt = $pdo->prepare("
            SELECT s.id, s.imagen, s.nombre, s.tipo, s.region 
            FROM user_favorites uf
            INNER JOIN seres s ON uf.ser_id = s.id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC
        ");
        $stmt->execute([$userId]);
        
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Asegurar que siempre devolvemos un array
        if (!is_array($favorites)) {
            $favorites = [];
        }
        
        logError("Favorites retrieved successfully", ['count' => count($favorites)]);
        successResponse(['success' => true, 'favorites' => $favorites]);
    } catch (Exception $e) {
        logError("Error in listFavorites", ['error' => $e->getMessage()]);
        errorResponse(500, "Error obteniendo favoritos");
    }
}

function addFavorite($pdo, $userId) {
    try {
        $rawInput = file_get_contents('php://input');
        logError("Add favorite request", ['userId' => $userId, 'inputLength' => strlen($rawInput)]);
        
        if (empty($rawInput)) {
            logError("Empty input received for add favorite");
            errorResponse(400, "No se recibieron datos");
        }

        $data = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logError("JSON decode error in add favorite", ['error' => json_last_error_msg(), 'input' => $rawInput]);
            errorResponse(400, "Datos JSON inválidos: " . json_last_error_msg());
        }
        
        if (!isset($data['serId'])) {
            logError("Missing serId in add favorite", ['data' => $data]);
            errorResponse(400, "Falta el parámetro serId");
        }
        
        $serId = (int) $data['serId'];
        
        if ($serId <= 0) {
            logError("Invalid serId in add favorite", ['serId' => $serId]);
            errorResponse(400, "El serId debe ser un número positivo");
        }
        
        // Verificar que el ser existe
        $stmt = $pdo->prepare("SELECT id FROM seres WHERE id = ?");
        $stmt->execute([$serId]);
        if (!$stmt->fetch()) {
            logError("Ser not found in add favorite", ['serId' => $serId]);
            errorResponse(404, "El ser especificado no existe");
        }
        
        // Verificar si ya existe el favorito
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        
        if ($stmt->fetchColumn() > 0) {
            logError("Favorite already exists", ['userId' => $userId, 'serId' => $serId]);
            successResponse([
                'success' => true, 
                'message' => 'Ya está en favoritos',
                'alreadyExists' => true
            ]);
        }
        
        // Insertar nuevo favorito
        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
        $result = $stmt->execute([$userId, $serId]);
        
        if (!$result) {
            logError("Failed to insert favorite", ['userId' => $userId, 'serId' => $serId]);
            errorResponse(500, "Error al guardar el favorito");
        }
        
        logError("Favorite added successfully", ['userId' => $userId, 'serId' => $serId]);
        
        successResponse([
            'success' => true,
            'message' => 'Favorito agregado correctamente'
        ]);
        
    } catch (PDOException $e) {
        logError("Database error in add favorite", [
            'error' => $e->getMessage(), 
            'code' => $e->getCode(),
            'userId' => $userId ?? 'unknown'
        ]);
        
        // Verificar si es error de duplicado
        if ($e->getCode() == 23000) {
            successResponse([
                'success' => true,
                'message' => 'Ya está en favoritos',
                'alreadyExists' => true
            ]);
        } else {
            errorResponse(500, "Error de base de datos al agregar favorito");
        }
    } catch (Exception $e) {
        logError("Unexpected error in add favorite", [
            'error' => $e->getMessage(),
            'userId' => $userId ?? 'unknown'
        ]);
        errorResponse(500, "Error inesperado al agregar favorito");
    }
}

function removeFavorite($pdo, $userId) {
    try {
        $rawInput = file_get_contents('php://input');
        logError("Remove favorite request", ['userId' => $userId, 'inputLength' => strlen($rawInput)]);
        
        if (empty($rawInput)) {
            logError("Empty input received for remove favorite");
            errorResponse(400, "No se recibieron datos");
        }

        $data = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logError("JSON decode error in remove favorite", ['error' => json_last_error_msg(), 'input' => $rawInput]);
            errorResponse(400, "Datos JSON inválidos: " . json_last_error_msg());
        }
        
        if (!isset($data['serId'])) {
            logError("Missing serId in remove favorite", ['data' => $data]);
            errorResponse(400, "Falta el parámetro serId");
        }
        
        $serId = (int) $data['serId'];
        
        if ($serId <= 0) {
            logError("Invalid serId in remove favorite", ['serId' => $serId]);
            errorResponse(400, "El serId debe ser un número positivo");
        }
        
        // Eliminar el favorito
        $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $result = $stmt->execute([$userId, $serId]);
        
        if (!$result) {
            logError("Failed to execute delete query", ['userId' => $userId, 'serId' => $serId]);
            errorResponse(500, "Error al eliminar el favorito");
        }
        
        $affectedRows = $stmt->rowCount();
        
        if ($affectedRows > 0) {
            logError("Favorite removed successfully", ['userId' => $userId, 'serId' => $serId]);
            successResponse([
                'success' => true,
                'message' => 'Favorito eliminado correctamente'
            ]);
        } else {
            logError("Favorite not found for removal", ['userId' => $userId, 'serId' => $serId]);
            errorResponse(404, "El favorito no existe");
        }
        
    } catch (PDOException $e) {
        logError("Database error in remove favorite", [
            'error' => $e->getMessage(), 
            'code' => $e->getCode(),
            'userId' => $userId ?? 'unknown'
        ]);
        errorResponse(500, "Error de base de datos al eliminar favorito");
    } catch (Exception $e) {
        logError("Unexpected error in remove favorite", [
            'error' => $e->getMessage(),
            'userId' => $userId ?? 'unknown'
        ]);
        errorResponse(500, "Error inesperado al eliminar favorito");
    }
}

function getBearerToken() {
    // Revisar diferentes fuentes del token
    $authHeader = '';
    
    // Método 1: apache_request_headers()
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['AUTHORIZATION'] ?? '';
    }
    
    // Método 2: $_SERVER variables
    if (empty($authHeader)) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? 
                     $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 
                     '';
    }
    
    // Método 3: Construir headers manualmente
    if (empty($authHeader)) {
        foreach ($_SERVER as $key => $value) {
            if (strtolower(substr($key, 0, 5)) === 'http_') {
                $headerName = str_replace('_', '-', strtolower(substr($key, 5)));
                if ($headerName === 'authorization') {
                    $authHeader = $value;
                    break;
                }
            }
        }
    }
    
    logError("Auth header search", ['found' => !empty($authHeader), 'header' => substr($authHeader, 0, 20) . '...']);
    
    if (!empty($authHeader)) {
        if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?>