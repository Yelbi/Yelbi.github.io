<?php
// config/connection.php - Solo para la conexión PDO
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=seres_db",
        "root",
        "",
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