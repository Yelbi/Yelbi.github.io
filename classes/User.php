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
    try {
        // Obtener usuario por email
        $user = $this->getByEmail($email);
        if (!$user) {
            error_log("Usuario no encontrado para email: $email");
            return false;
        }

        // Generar token único
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 7200); // 1 hora de validez

        error_log("Generando token para usuario ID: " . $user['id']);
        error_log("Token: $token");
        error_log("Expiry: $expiry");

        // Limpiar tokens anteriores antes de crear uno nuevo
        $cleanQuery = "UPDATE users SET reset_token = NULL, reset_expiry = NULL WHERE id = :id";
        $cleanStmt = $this->conn->prepare($cleanQuery);
        $cleanStmt->bindParam(':id', $user['id']);
        $cleanStmt->execute();

        // Actualizar usuario con nuevo token
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
        
    } catch (Exception $e) {
        error_log("Error en generatePasswordResetToken: " . $e->getMessage());
        return false;
    }
}

// Función corregida para resetear password
public function resetPassword($token, $newPassword) {
    try {
        // Log para debug
        error_log("=== RESET PASSWORD DEBUG ===");
        error_log("Token recibido: $token");
        error_log("Password length: " . strlen($newPassword));
        
        // 1. Primero verificar que el token existe y está válido
        $verification = $this->verifyResetToken($token);
        if (!$verification['valid']) {
            error_log("Token inválido: " . $verification['reason']);
            return false;
        }
        
        $user = $verification['user'];
        error_log("Usuario encontrado: " . $user['email']);
        
        // 2. Validar la nueva contraseña
        if (strlen($newPassword) < 8) {
            error_log("Contraseña muy corta");
            return false;
        }
        
        if (!preg_match('/[a-z]/', $newPassword) || 
            !preg_match('/[A-Z]/', $newPassword) || 
            !preg_match('/[0-9]/', $newPassword)) {
            error_log("Contraseña no cumple requisitos");
            return false;
        }
        
        // 3. Hashear la nueva contraseña
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        error_log("Password hasheado correctamente");
        
        // 4. Actualizar la contraseña y limpiar el token
        $updateQuery = "UPDATE users 
                        SET password = :password,
                            reset_token = NULL,
                            reset_expiry = NULL,
                            updated_at = NOW()
                        WHERE id = :id";
        
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':password', $hashedPassword);
        $updateStmt->bindParam(':id', $user['id']);
        
        if ($updateStmt->execute()) {
            error_log("Contraseña actualizada exitosamente");
            
            // Verificar que realmente se actualizó
            $rowsAffected = $updateStmt->rowCount();
            error_log("Filas afectadas: $rowsAffected");
            
            return $rowsAffected > 0;
        } else {
            error_log("Error al ejecutar UPDATE");
            error_log("Error info: " . print_r($updateStmt->errorInfo(), true));
            return false;
        }
        
    } catch (Exception $e) {
        error_log("Excepción en resetPassword: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return false;
    }
}

// Función adicional para verificar token (útil para debug)
public function verifyResetToken($token) {
    try {
        error_log("=== VERIFY RESET TOKEN DEBUG ===");
        error_log("Token a verificar: $token");
        
        // Buscar el token en la base de datos
        $query = "SELECT id, email, reset_token, reset_expiry, 
                         NOW() as current_time,
                         CASE 
                            WHEN reset_expiry > NOW() THEN 'valid'
                            ELSE 'expired'
                         END as status
                  FROM users 
                  WHERE reset_token = :token";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Registros encontrados: " . $stmt->rowCount());
        
        if (!$user) {
            error_log("Token no encontrado en la base de datos");
            
            // Verificar si existen tokens en la tabla (para debug)
            $debugQuery = "SELECT COUNT(*) as total, 
                                 COUNT(CASE WHEN reset_token IS NOT NULL THEN 1 END) as with_token
                          FROM users";
            $debugStmt = $this->conn->prepare($debugQuery);
            $debugStmt->execute();
            $debugResult = $debugStmt->fetch(PDO::FETCH_ASSOC);
            error_log("Debug - Total usuarios: " . $debugResult['total'] . ", Con token: " . $debugResult['with_token']);
            
            return ['valid' => false, 'reason' => 'Token no encontrado'];
        }
        
        error_log("Usuario encontrado: " . $user['email']);
        error_log("Token en BD: " . $user['reset_token']);
        error_log("Expiry en BD: " . $user['reset_expiry']);
        error_log("Tiempo actual: " . $user['current_time']);
        error_log("Status: " . $user['status']);
        
        if ($user['status'] === 'expired') {
            error_log("Token expirado");
            return ['valid' => false, 'reason' => 'Token expirado', 'expiry' => $user['reset_expiry']];
        }
        
        error_log("Token válido");
        return ['valid' => true, 'user' => $user];
        
    } catch (Exception $e) {
        error_log("Error en verifyResetToken: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return ['valid' => false, 'reason' => 'Error interno: ' . $e->getMessage()];
    }
}
}