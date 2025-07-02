<?php
require_once '../config/connection.php';
require_once '../config/jwt.php';
require_once '../config/i18n.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Define JWT secret key usando la constante existente
if (!defined('JWT_SECRET_KEY')) {
    // Define SECRET_KEY here if not defined elsewhere
    if (!defined('SECRET_KEY')) {
        define('SECRET_KEY', '123456789Grandiel$'); // Replace with your actual secret key
    }
    define('JWT_SECRET_KEY', SECRET_KEY);
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

$action = $_GET['action'] ?? '';
$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    // Usar el método de decodificación existente en jwt.php
    $decoded = JWT::decode($token, new Key('123456789Grandiel$', 'HS256'));
    $userId = $decoded->user_id;
    
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

function listFavorites($pdo, $userId) {
    global $current_lang;
    
    $stmt = $pdo->prepare("
        SELECT s.id, s.imagen, st.nombre, st.tipo, st.region 
        FROM user_favorites uf
        JOIN seres s ON uf.ser_id = s.id
        JOIN seres_translations st ON s.id = st.ser_id
        WHERE uf.user_id = ? AND st.language_code = ?
    ");
    $stmt->execute([$userId, $current_lang]);
    $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['favorites' => $favorites]);
}

function addFavorite($pdo, $userId) {
    // Leer datos JSON directamente del input
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['serId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta serId o datos inválidos']);
        exit;
    }
    
    $serId = (int) $data['serId'];
    
    // Verificar si ya es favorito
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND ser_id = ?");
    $stmt->execute([$userId, $serId]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Verificar límite (max 3)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_favorites WHERE user_id = ?");
    $stmt->execute([$userId]);
    $count = (int) $stmt->fetchColumn();
    
    if ($count >= 3) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Límite de favoritos alcanzado',
            'favoritesCount' => $count
        ]);
        exit;
    }
    
    // Agregar a favoritos
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
        $stmt->execute([$userId, $serId]);
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'favoritesCount' => $count + 1
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
    
    // Obtener el encabezado de autorización
    $authHeader = $headers['Authorization'] ?? $headers['HTTP_AUTHORIZATION'] ?? '';
    
    if (!empty($authHeader)) {
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}