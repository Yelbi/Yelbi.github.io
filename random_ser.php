<?php
require 'config/connection.php';

try {
    // Obtener un ser al azar
    $stmt = $pdo->query("SELECT slug FROM seres ORDER BY RAND() LIMIT 1");
    $ser = $stmt->fetch();
    
    if ($ser) {
        header("Location: /detalle.php?ser=" . urlencode($ser['slug']));
        exit;
    } else {
        header('Location: /galeria.php');
        exit;
    }
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}