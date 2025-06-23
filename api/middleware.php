<?php
require_once __DIR__ . 'auth.php'; // Para tener las constantes JWT
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function authenticate() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGORITHM));
            return (array) $decoded;
        } catch (Exception $e) {
            jsonResponse(['error' => 'Token inválido: ' . $e->getMessage()], 401);
            exit;
        }
    }

    jsonResponse(['error' => 'Token no proporcionado'], 401);
    exit;
}