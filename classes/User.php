<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO users 
                 SET name=:name, email=:email, password=:password, 
                     email_verification_token=:token";

        $stmt = $this->conn->prepare($query);

        $password_hash = password_hash($this->password, PASSWORD_DEFAULT);
        $verification_token = bin2hex(random_bytes(32));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":token", $verification_token);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $verification_token;
        }
        return false;
    }

    public function verifyEmail($token) {
        $query = "UPDATE " . $this->table_name . " 
                 SET email_verified = 1, 
                     email_verification_token = NULL 
                 WHERE email_verification_token = :token";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    public function login($email, $password) {
        $query = "SELECT id, name, email, password, email_verified, role 
                  FROM users 
                  WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($password, $row['password'])) {
                return $row;
            }
        }
        return false;
    }

    public function getById($id) {
        $query = "SELECT id, name, email, email_verified, role, created_at 
                 FROM " . $this->table_name . " 
                 WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    public function getByEmail($email) {
        $query = "SELECT id, name, email, email_verified, role, created_at 
                 FROM " . $this->table_name . " 
                 WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    public function updateProfile($id, $name, $email) {
        $query = "UPDATE " . $this->table_name . " 
                 SET name=:name, email=:email, updated_at=NOW() 
                 WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        $name = htmlspecialchars(strip_tags($name));
        $email = htmlspecialchars(strip_tags($email));

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);

        return $stmt->execute();
    }

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

public function generatePasswordResetToken($email) {
    // Obtener usuario por email
    $user = $this->getByEmail($email);
    if (!$user) {
        error_log("Usuario no encontrado para email: $email");
        return false;
    }

    // Generar token único
    $token = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', time() + 3600); // 1 hora de validez

    error_log("Generando token para usuario ID: " . $user['id']);
    error_log("Token: $token");
    error_log("Expiry: $expiry");

    // Actualizar usuario con token
    $query = "UPDATE users SET reset_token = :token, reset_expiry = :expiry WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':token', $token);
    $stmt->bindParam(':expiry', $expiry);
    $stmt->bindParam(':id', $user['id']);
    
    if ($stmt->execute()) {
        error_log("Token guardado exitosamente");
        
        // Verificar que se guardó correctamente
        $verifyQuery = "SELECT reset_token, reset_expiry FROM users WHERE id = :id";
        $verifyStmt = $this->conn->prepare($verifyQuery);
        $verifyStmt->bindParam(':id', $user['id']);
        $verifyStmt->execute();
        $result = $verifyStmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Token verificado en BD: " . $result['reset_token']);
        error_log("Expiry verificado en BD: " . $result['reset_expiry']);
        
        return $token;
    }
    
    error_log("Error al guardar token en BD");
    return false;
}


public function resetPassword($token, $newPassword) {
    try {
        // 1. Buscar usuario por token válido (no expirado)
        $query = "SELECT * FROM users 
                  WHERE reset_token = :token 
                  AND reset_expiry > NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Token inválido o expirado
            return false;
        }

        // Validación básica de contraseña
        if (strlen($newPassword) < 8) {
            throw new Exception('La contraseña debe tener al menos 8 caracteres');
        }
        if (!preg_match('/[a-z]/', $newPassword) || 
            !preg_match('/[A-Z]/', $newPassword) || 
            !preg_match('/[0-9]/', $newPassword)) {
            throw new Exception('La contraseña debe incluir mayúsculas, minúsculas y números');
        }

        // 3. Hashear nueva contraseña - usar PASSWORD_DEFAULT en lugar de PASSWORD_BCRYPT
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // 4. Actualizar contraseña y limpiar token
        $updateQuery = "UPDATE users 
                        SET password = :password,
                            reset_token = NULL,
                            reset_expiry = NULL,
                            updated_at = NOW()
                        WHERE id = :id";
        
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':password', $hashedPassword);
        $updateStmt->bindParam(':id', $user['id']);
        
        // 5. Ejecutar y retornar resultado
        if ($updateStmt->execute()) {
            return true;
        } else {
            error_log("Error al ejecutar UPDATE en resetPassword");
            return false;
        }
        
    } catch (Exception $e) {
        error_log("Error resetPassword: " . $e->getMessage());
        return false;
    }
}
}