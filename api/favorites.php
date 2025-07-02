<?php
require_once '../config/connection.php';
require_once '../config/jwt.php';
require_once '../vendor/autoload.php'; // Add this if using firebase/php-jwt or similar library
use Firebase\JWT\JWT;

// Ensure $jwt_secret is defined and is a string
if (!isset($jwt_secret) || !is_string($jwt_secret)) {
    // You can set your secret here or ensure it's set in jwt.php
    $jwt_secret = 'your-secret-key'; // Replace with your actual secret
}

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$token = getBearerToken();

if (!$token) {
    $allowed_alg = 'HS256';
    // Make sure $jwt_secret is defined and is a string
    $decoded = JWT::decode($token, new \Firebase\JWT\Key($jwt_secret, $allowed_alg));
    $userId = $decoded->user_id;
}

try {
    $allowed_alg = 'HS256';
    $decoded = JWT::decode($token, new \Firebase\JWT\Key($jwt_secret, $allowed_alg));
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
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido o expirado']);
    exit;
}

function listFavorites($pdo, $userId) {
    // Define el idioma actual, por ejemplo, desde una variable global, sesión, o por defecto
    $current_lang = 'es'; // Cambia 'es' por el código de idioma que corresponda o hazlo dinámico
    
    $stmt = $pdo->prepare("
        SELECT s.id, s.imagen, st.nombre, st.tipo, st.region 
        FROM user_favorites uf
        JOIN seres s ON uf.ser_id = s.id
        JOIN seres_translations st ON s.id = st.ser_id
        WHERE uf.user_id = ? AND st.language_code = ?
    ");
    $stmt->execute([$userId, $current_lang]); // $current_lang desde i18n.php
    $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['favorites' => $favorites]);
}

function addFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $serId = $data['serId'] ?? null;
    
    if (!$serId) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta serId']);
        exit;
    }
    
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
    $count = $stmt->fetchColumn();
    
    if ($count >= 3) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Límite de favoritos alcanzado',
            'favoritesCount' => $count
        ]);
        exit;
    }
    
    // Agregar a favoritos
    $stmt = $pdo->prepare("INSERT INTO user_favorites (user_id, ser_id) VALUES (?, ?)");
    $stmt->execute([$userId, $serId]);
    
    echo json_encode([
        'success' => true,
        'favoritesCount' => $count + 1
    ]);
}

function removeFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $serId = $data['serId'] ?? null;
    
    if (!$serId) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta serId']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM user_favorites WHERE user_id = ? AND ser_id = ?");
    $stmt->execute([$userId, $serId]);
    
    echo json_encode(['success' => true]);
}

// Función para obtener el token del header
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}