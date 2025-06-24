<?php
// config/database.php
class Database {
    // Configuración REAL para Hostinger (¡ACTUALIZAR ESTOS VALORES!)
    private $host = 'localhost'; // Servidor de Hostinger
    private $db_name = 'seres_db'; // Nombre real de tu DB
    private $username = 'root';    // Usuario de la DB
    private $password = ''; // Contraseña
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // Mensaje amigable en producción
            die("Error de conexión a la base de datos. Por favor, inténtalo más tarde.");
        }
        return $this->conn;
    }
}
?>