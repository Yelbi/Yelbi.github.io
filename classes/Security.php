<?php
// classes/Security.php
class Security {
    private $conn;
    private $attempts_table = "login_attempts";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Registrar intento de login
    public function logLoginAttempt($email, $ip, $success = false) {
        $query = "INSERT INTO " . $this->attempts_table . " 
                 SET email=:email, ip_address=:ip, success=:success";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":ip", $ip);
        $stmt->bindParam(":success", $success, PDO::PARAM_BOOL);
        $stmt->execute();
    }

    // Verificar si IP está bloqueada
    public function isBlocked($email, $ip) {
        $query = "SELECT COUNT(*) as attempts FROM " . $this->attempts_table . " 
                 WHERE email=:email AND ip_address=:ip AND success=0 
                 AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":ip", $ip);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['attempts'] >= 5; // Bloquear después de 5 intentos fallidos
    }

    // Limpiar intentos antiguos
    public function cleanOldAttempts() {
        $query = "DELETE FROM " . $this->attempts_table . " 
                 WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 1 DAY)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }

    // Generar token seguro
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    // Validar email
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    // Validar contraseña
    public static function validatePassword($password) {
        return strlen($password) >= 8 && 
               preg_match('/[A-Z]/', $password) && 
               preg_match('/[a-z]/', $password) && 
               preg_match('/[0-9]/', $password);
    }

    // Sanitizar entrada
    public static function sanitizeInput($input) {
        return htmlspecialchars(strip_tags(trim($input)));
    }
}