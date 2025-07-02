<?php
require_once '../config/connection.php';
require_once '../config/jwt.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Define JWT secret key usando la constante existente
if (!defined('JWT_SECRET_KEY')) {
    define('JWT_SECRET_KEY', '123456789Grandiel$');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Manejar solicitudes OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Crear tabla de favoritos si no existe
createFavoritesTable($pdo);

$action = $_GET['action'] ?? '';
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    // Usar el método de decodificación existente en jwt.php
    $decoded = JWT::decode($token, new Key(JWT_SECRET_KEY, 'HS256'));
    
    // CORRECCIÓN CLAVE: Usar 'sub' en lugar de 'user_id'
    $userId = $decoded->sub;
    
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
            http_response_code(400);
            echo json_encode(['error' => 'Acción inválida']);
            exit;
    }
} catch (PDOException $e) {
    error_log("Error PDO en favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
    exit;
} catch (Exception $e) {
    error_log("Error JWT en favorites.php: " . $e->getMessage());
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado']);
    exit;
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
    } catch (PDOException $e) {
        error_log("Error creando tabla user_favorites: " . $e->getMessage());
    }
}

function listFavorites($pdo, $userId) {
    try {
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
        
        echo json_encode(['favorites' => $favorites]);
    } catch (Exception $e) {
        error_log("Error en listFavorites: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error obteniendo favoritos: ' . $e->getMessage()]);
        exit;
    }
}

function addFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['serId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta serId o datos inválidos']);
        exit;
    }
    
    $serId = (int) $data['serId'];
    
    // Validar que el ser existe
    try {
        $stmt = $pdo->prepare("SELECT id FROM seres WHERE id = ?");
        $stmt->execute([$serId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'El ser especificado no existe']);
            exit;
        }
    } catch (PDOException $e) {
        error_log("Error validando ser: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error validando datos']);
        exit;
    }
    
    try {
        // Verificar si ya existe
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => true, 'message' => 'Ya está en favoritos']);
            exit;
        }
        
        // Insertar nuevo favorito
        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
        $stmt->execute([$userId, $serId]);

        // Obtener contador actualizado
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favoritesCount = (int)$stmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'favoritesCount' => $favoritesCount
        ]);
    } catch (PDOException $e) {
        error_log("Error en addFavorite: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error al agregar favorito']);
        exit;
    }
}

function removeFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['serId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta serId o datos inválidos']);
        exit;
    }
    
    $serId = (int) $data['serId'];
    
    try {
        $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        $affectedRows = $stmt->rowCount();
        
        if ($affectedRows > 0) {
            // Obtener contador actualizado
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
            $stmt->execute([$userId]);
            $favoritesCount = (int)$stmt->fetchColumn();
            
            echo json_encode([
                'success' => true,
                'favoritesCount' => $favoritesCount
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Favorito no encontrado']);
        }
    } catch (PDOException $e) {
        error_log("Error en removeFavorite: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar favorito']);
        exit;
    }
}

function getBearerToken() {
    $headers = null;
    
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } else {
        $headers = $_SERVER;
    }
    
    $authHeader = $headers['Authorization'] ?? $headers['HTTP_AUTHORIZATION'] ?? '';
    
    if (!empty($authHeader)) {
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?>