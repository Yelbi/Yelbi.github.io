<?php
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
        $query = "INSERT INTO users 
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
        $stmt->bindParam(":id", $password_hash); 
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
        $query = "INSERT INTO " . $this->table_name . " 
            SET name=:name, email=:email, password=:password, 
            email_verification_token=:token, phone=:phone";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // Login
    public function login($email, $password) {
        // Consulta simplificada - solo campos esenciales
        $query = "SELECT id, name, email, password, email_verified 
                FROM users 
                WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['password'])) {
                // Guardar ID de usuario en sesión
                $_SESSION['user_id'] = $row['id'];
        
                $this->updateLastLogin($row['id']);
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

        // CORRECCIÓN: Vincular el ID correctamente
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