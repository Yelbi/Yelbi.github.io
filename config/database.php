<?php
// config/database.php
class Database {
    private $host = 'localhost';
    private $db_name = 'tu_base_de_datos';
    private $username = 'tu_usuario';
    private $password = 'tu_contraseña';
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
            die("Error de conexión a la base de datos");
        }
        return $this->conn;
    }
}

// classes/User.php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $email_verified;
    public $status;
    public $role;
    public $avatar;
    public $phone;
    public $created_at;
    public $updated_at;
    public $last_login;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear usuario
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET name=:name, email=:email, password=:password, 
                     email_verification_token=:token, phone=:phone";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        
        // Hash password
        $password_hash = password_hash($this->password, PASSWORD_DEFAULT);
        $verification_token = bin2hex(random_bytes(32));

        // Bind valores
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":token", $verification_token);
        $stmt->bindParam(":phone", $this->phone);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $verification_token;
        }
        return false;
    }

    // Verificar email
    public function verifyEmail($token) {
        $query = "UPDATE " . $this->table_name . " 
                 SET email_verified=1, email_verification_token=NULL 
                 WHERE email_verification_token=:token";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // Login
    public function login($email, $password) {
        $query = "SELECT id, name, email, password, email_verified, status, role, avatar, phone 
                 FROM " . $this->table_name . " 
                 WHERE email = :email AND status = 'active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['password'])) {
                // Actualizar último login
                $this->updateLastLogin($row['id']);
                
                // Devolver datos del usuario (sin password)
                unset($row['password']);
                return $row;
            }
        }
        return false;
    }

    // Actualizar último login
    private function updateLastLogin($user_id) {
        $query = "UPDATE " . $this->table_name . " SET last_login = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
    }

    // Obtener usuario por email
    public function getByEmail($email) {
        $query = "SELECT id, name, email, email_verified, status, role, avatar, phone, created_at 
                 FROM " . $this->table_name . " WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Obtener usuario por ID
    public function getById($id) {
        $query = "SELECT id, name, email, email_verified, status, role, avatar, phone, created_at 
                 FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Actualizar perfil
    public function updateProfile($id, $name, $email, $phone = null) {
        $query = "UPDATE " . $this->table_name . " 
                 SET name=:name, email=:email, phone=:phone, updated_at=NOW() 
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($name));
        $this->email = htmlspecialchars(strip_tags($email));
        $this->phone = htmlspecialchars(strip_tags($phone));

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);

        return $stmt->execute();
    }

    // Cambiar contraseña
    public function changePassword($id, $new_password) {
        $query = "UPDATE " . $this->table_name . " 
                 SET password=:password, updated_at=NOW() 
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":password", $password_hash);

        return $stmt->execute();
    }

    // Generar token de reset de contraseña
    public function generatePasswordResetToken($email) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $query = "UPDATE " . $this->table_name . " 
                 SET password_reset_token=:token, password_reset_expires=:expires 
                 WHERE email=:email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires", $expires);
        $stmt->bindParam(":email", $email);

        if($stmt->execute() && $stmt->rowCount() > 0) {
            return $token;
        }
        return false;
    }

    // Reset contraseña
    public function resetPassword($token, $new_password) {
        $query = "UPDATE " . $this->table_name . " 
                 SET password=:password, password_reset_token=NULL, password_reset_expires=NULL 
                 WHERE password_reset_token=:token AND password_reset_expires > NOW()";

        $stmt = $this->conn->prepare($query);
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);

        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":token", $token);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // Verificar si existe email
    public function emailExists($email, $exclude_id = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email";
        if($exclude_id) {
            $query .= " AND id != :exclude_id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        if($exclude_id) {
            $stmt->bindParam(":exclude_id", $exclude_id);
        }
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}

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

// classes/Session.php
class Session {
    private $conn;
    private $table_name = "user_sessions";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear sesión
    public function create($user_id, $ip = null, $user_agent = null) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));

        $query = "INSERT INTO " . $this->table_name . " 
                 SET user_id=:user_id, session_token=:token, expires_at=:expires, 
                     ip_address=:ip, user_agent=:user_agent";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires", $expires);
        $stmt->bindParam(":ip", $ip);
        $stmt->bindParam(":user_agent", $user_agent);

        if($stmt->execute()) {
            return $token;
        }
        return false;
    }

    // Validar sesión
    public function validate($token) {
        $query = "SELECT s.user_id, u.name, u.email, u.role, u.status 
                 FROM " . $this->table_name . " s 
                 JOIN users u ON s.user_id = u.id 
                 WHERE s.session_token=:token AND s.expires_at > NOW() AND u.status='active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    // Eliminar sesión
    public function destroy($token) {
        $query = "DELETE FROM " . $this->table_name . " WHERE session_token=:token";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        return $stmt->execute();
    }

    // Limpiar sesiones expiradas
    public function cleanup() {
        $query = "DELETE FROM " . $this->table_name . " WHERE expires_at < NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    }
}

// utils/helpers.php
function sendEmail($to, $subject, $message, $headers = '') {
    // Configurar según tu servidor de correo
    $default_headers = "From: noreply@tudominio.com\r\n";
    $default_headers .= "Reply-To: noreply@tudominio.com\r\n";
    $default_headers .= "MIME-Version: 1.0\r\n";
    $default_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $default_headers . $headers);
}

function logError($message, $file = 'error.log') {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($file, $log_message, FILE_APPEND | LOCK_EX);
}

function generateEmailVerificationTemplate($name, $verification_link) {
    return "
    <html>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px;'>
            <h2 style='color: #333;'>¡Bienvenido $name!</h2>
            <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu email haciendo clic en el enlace:</p>
            <a href='$verification_link' style='display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;'>Verificar Email</a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:<br>
            <small>$verification_link</small></p>
            <p><small>Este enlace expirará en 24 horas.</small></p>
        </div>
    </body>
    </html>";
}

function generatePasswordResetTemplate($name, $reset_link) {
    return "
    <html>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px;'>
            <h2 style='color: #333;'>Restablecer Contraseña</h2>
            <p>Hola $name,</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace para crear una nueva:</p>
            <a href='$reset_link' style='display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;'>Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            <p><small>Este enlace expirará en 1 hora.</small></p>
        </div>
    </body>
    </html>";
}

// Función para generar respuesta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Función para obtener IP del cliente
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Autoload simple
function autoload($class) {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
}
spl_autoload_register('autoload');

// Configuración de sesiones
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);
?>