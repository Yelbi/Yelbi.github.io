<?php
// classes/Feedback.php
class Feedback {
    private $conn;
    private $table_name = "feedback";

    public $id;
    public $user_id;
    public $name;
    public $email;
    public $type;
    public $subject;
    public $message;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 SET user_id=:user_id, name=:name, email=:email, 
                     type=:type, subject=:subject, message=:message";

        $stmt = $this->conn->prepare($query);

        // Sanitizar datos
        $this->user_id = htmlspecialchars(strip_tags($data['user_id']));
        $this->name = htmlspecialchars(strip_tags($data['name']));
        $this->email = htmlspecialchars(strip_tags($data['email']));
        $this->type = htmlspecialchars(strip_tags($data['type']));
        $this->subject = htmlspecialchars(strip_tags($data['subject']));
        $this->message = htmlspecialchars(strip_tags($data['message']));

        // Vincular valores
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":subject", $this->subject);
        $stmt->bindParam(":message", $this->message);

        // Ejecutar consulta
        if ($stmt->execute()) {
            // Enviar notificación por correo
            $this->sendNotification();
            return true;
        }
        return false;
    }

    private function sendNotification() {
        $to = "bgrandiel@seres.blog";
        $subject = "Nuevo mensaje en el buzón de Seres";
        
        $message = "<html><body>";
        $message .= "<h2>Tienes un nuevo mensaje en el buzón de Seres</h2>";
        $message .= "<p><strong>Tipo:</strong> " . ucfirst($this->type) . "</p>";
        $message .= "<p><strong>Nombre:</strong> " . $this->name . "</p>";
        $message .= "<p><strong>Email:</strong> " . $this->email . "</p>";
        $message .= "<p><strong>Asunto:</strong> " . $this->subject . "</p>";
        $message .= "<p><strong>Mensaje:</strong></p>";
        $message .= "<p>" . nl2br($this->message) . "</p>";
        $message .= "</body></html>";
        
        $headers = "From: no-reply@seres.blog\r\n";
        $headers .= "Reply-To: " . $this->email . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        
        @mail($to, $subject, $message, $headers);
    }

    // Método para obtener todos los mensajes (para panel de administración)
    public function getAll() {
        $query = "SELECT f.*, u.name as user_name 
                 FROM " . $this->table_name . " f
                 LEFT JOIN users u ON f.user_id = u.id
                 ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Método para actualizar el estado de un mensaje
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " 
                 SET status = :status, updated_at = NOW() 
                 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);
        
        return $stmt->execute();
    }
}