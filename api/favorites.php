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
    error_log("FAVORITES API ERROR: " . $message . " Context: " . json_encode($context));
}

// Función para respuesta de error consistente
function errorResponse($code, $message, $details = null) {
    // Limpiar cualquier salida previa
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code($code);
    $response = ['error' => $message];
    if ($details) {
        $response['details'] = $details;
    }
    echo json_encode($response);
    exit;
}

// Función para respuesta de éxito
function successResponse($data) {
    // Limpiar cualquier salida previa
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code(200);
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
        logError("Table created successfully");
    } catch (PDOException $e) {
        logError("Error creating table", ['error' => $e->getMessage()]);
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
        logError("Raw input received", ['input' => $rawInput]);
        
        if (empty($rawInput)) {
            logError("Empty input received");
            errorResponse(400, "No se recibieron datos");
        }

        $data = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logError("JSON decode error", ['error' => json_last_error_msg()]);
            errorResponse(400, "Datos JSON inválidos");
        }
        
        if (!$data || !isset($data['serId'])) {
            logError("Missing serId", ['data' => $data]);
            errorResponse(400, "Falta serId en los datos");
        }
        
        $serId = (int) $data['serId'];
        
        if ($serId <= 0) {
            logError("Invalid serId", ['serId' => $serId]);
            errorResponse(400, "serId inválido");
        }
        
        // Validar que el ser existe
        $stmt = $pdo->prepare("SELECT id FROM seres WHERE id = ?");
        $stmt->execute([$serId]);
        if (!$stmt->fetch()) {
            logError("Ser not found", ['serId' => $serId]);
            errorResponse(404, "El ser especificado no existe");
        }
        
        // Verificar si ya existe
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        if ($stmt->fetchColumn() > 0) {
            logError("Favorite already exists", ['userId' => $userId, 'serId' => $serId]);
            successResponse(['success' => true, 'message' => 'Ya está en favoritos', 'alreadyExists' => true]);
        }
        
        // Insertar nuevo favorito
        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
        $stmt->execute([$userId, $serId]);

        // Obtener contador actualizado
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favoritesCount = (int)$stmt->fetchColumn();
        
        logError("Favorite added successfully", ['userId' => $userId, 'serId' => $serId, 'count' => $favoritesCount]);
        
        successResponse([
            'success' => true,
            'message' => 'Favorito agregado correctamente',
            'favoritesCount' => $favoritesCount
        ]);
        
    } catch (PDOException $e) {
        logError("PDO Error in addFavorite", ['error' => $e->getMessage(), 'code' => $e->getCode()]);
        errorResponse(500, "Error de base de datos al agregar favorito");
    } catch (Exception $e) {
        logError("General Error in addFavorite", ['error' => $e->getMessage()]);
        errorResponse(500, "Error inesperado al agregar favorito");
    }
}

function removeFavorite($pdo, $userId) {
    try {
        $rawInput = file_get_contents('php://input');
        logError("Raw input received for remove", ['input' => $rawInput]);
        
        if (empty($rawInput)) {
            errorResponse(400, "No se recibieron datos");
        }

        $data = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            logError("JSON decode error in remove", ['error' => json_last_error_msg()]);
            errorResponse(400, "Datos JSON inválidos");
        }
        
        if (!$data || !isset($data['serId'])) {
            logError("Missing serId in remove", ['data' => $data]);
            errorResponse(400, "Falta serId en los datos");
        }
        
        $serId = (int) $data['serId'];
        
        if ($serId <= 0) {
            logError("Invalid serId in remove", ['serId' => $serId]);
            errorResponse(400, "serId inválido");
        }
        
        $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        $affectedRows = $stmt->rowCount();
        
        if ($affectedRows > 0) {
            // Obtener contador actualizado
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
            $stmt->execute([$userId]);
            $favoritesCount = (int)$stmt->fetchColumn();
            
            logError("Favorite removed successfully", ['userId' => $userId, 'serId' => $serId, 'count' => $favoritesCount]);
            
            successResponse([
                'success' => true,
                'message' => 'Favorito eliminado correctamente',
                'favoritesCount' => $favoritesCount
            ]);
        } else {
            logError("Favorite not found for removal", ['userId' => $userId, 'serId' => $serId]);
            errorResponse(404, "Favorito no encontrado");
        }
        
    } catch (PDOException $e) {
        logError("PDO Error in removeFavorite", ['error' => $e->getMessage(), 'code' => $e->getCode()]);
        errorResponse(500, "Error de base de datos al eliminar favorito");
    } catch (Exception $e) {
        logError("General Error in removeFavorite", ['error' => $e->getMessage()]);
        errorResponse(500, "Error inesperado al eliminar favorito");
    }
}

function getBearerToken() {
    $headers = null;
    
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } else {
        // Fallback para cuando apache_request_headers no está disponible
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) === 'HTTP_') {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
    }
    
    // Buscar en diferentes variantes del header Authorization
    $authHeader = $headers['Authorization'] ?? 
                 $headers['AUTHORIZATION'] ?? 
                 $headers['HTTP_AUTHORIZATION'] ?? 
                 $_SERVER['HTTP_AUTHORIZATION'] ?? 
                 '';
    
    if (!empty($authHeader)) {
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?>