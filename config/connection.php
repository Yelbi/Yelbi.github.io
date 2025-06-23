<?php
// config/connection.php - Solo para la conexión PDO
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=u186781529_seres_db;charset=utf8", // ← CORREGIDO: nombre completo de la DB
        "u186781529_Yelbi",
        "123456789Grandiel$",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $exception) {
    error_log("Connection error: " . $exception->getMessage());
    die("Error de conexión a la base de datos");
}
?>