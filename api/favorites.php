<?php
require_once '../config/connection.php';
require_once '../config/jwt.php';
require_once '../config/i18n.php';

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
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
    exit;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado: ' . $e->getMessage()]);
    exit;
}

function createFavoritesTable($pdo) {
    try {
        $sql = "CREATE TABLE IF NOT EXISTS user_favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ser_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, ser_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (ser_id) REFERENCES seres(id) ON DELETE CASCADE
        )";
        $pdo->exec($sql);
    } catch (PDOException $e) {
        error_log("Error creando tabla user_favorites: " . $e->getMessage());
    }
}

function listFavorites($pdo, $userId) {
    global $current_lang; // Usar la variable global de idioma
    
    try {
        // Verificar que el idioma esté definido
        if (!isset($current_lang) || empty($current_lang)) {
            throw new Exception('El idioma no está configurado');
        }
        
        $stmt = $pdo->prepare("
            SELECT s.id, s.imagen, st.nombre, st.tipo, st.region 
            FROM user_favorites uf
            INNER JOIN seres s ON uf.ser_id = s.id
            INNER JOIN seres_translations st ON s.id = st.ser_id
            WHERE uf.user_id = ? AND st.language_code = ?
        ");
        $stmt->execute([$userId, $current_lang]); // Usar $current_lang aquí
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['favorites' => $favorites]);
    } catch (Exception $e) {
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
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode(['success' => true]);
            exit;
        }
        
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
        $stmt->execute([$userId, $serId]);
        $pdo->commit();

        // Get the updated count of favorites for the user
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favoritesCount = (int)$stmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'favoritesCount' => $favoritesCount
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Error al agregar favorito: ' . $e->getMessage()]);
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
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND ser_id = ?");
        $stmt->execute([$userId, $serId]);
        $affectedRows = $stmt->rowCount();
        $pdo->commit();
        
        if ($affectedRows > 0) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Favorito no encontrado']);
        }
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Error al eliminar favorito: ' . $e->getMessage()]);
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