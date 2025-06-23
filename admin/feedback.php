<?php
// admin/feedback.php
session_start();
require_once '../config/database.php';
require_once '../classes/User.php';
require_once '../classes/Feedback.php';
require_once '../classes/Security.php';

$database = new Database();
$db = $database->getConnection();
$security = new Security($db);

// Redirigir a login si no es administrador
if (!$security->isAdmin()) {
    header("Location: login.php");
    exit;
}

$feedback = new Feedback($database->getConnection());
$messages = $feedback->getAll();

// Actualizar estado de un mensaje
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $id = $_POST['id'];
    $status = $_POST['status'];
    
    if ($feedback->updateStatus($id, $status)) {
        $success = "Estado actualizado correctamente";
    } else {
        $error = "Error al actualizar el estado";
    }
    
    // Recargar los mensajes
    $messages = $feedback->getAll();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Buzón de Seres</title>
    <link rel="stylesheet" href="../styles/admin.css">
</head>
<body>
    <div class="admin-container">
        <h1>Buzón de Quejas y Sugerencias</h1>
        <p>Gestiona los mensajes recibidos de los usuarios</p>
        
        <?php if (isset($success)): ?>
            <div class="alert alert-success"><?= $success ?></div>
        <?php elseif (isset($error)): ?>
            <div class="alert alert-error"><?= $error ?></div>
        <?php endif; ?>
        
        <div class="feedback-list">
            <?php if (empty($messages)): ?>
                <div class="empty-state">No hay mensajes pendientes</div>
            <?php else: ?>
                <?php foreach ($messages as $message): ?>
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <div class="feedback-meta">
                                <span class="feedback-type <?= $message['type'] ?>">
                                    <?= $message['type'] === 'complaint' ? 'Queja' : 'Sugerencia' ?>
                                </span>
                                <span class="feedback-status <?= $message['status'] ?>">
                                    <?= $this->translateStatus($message['status']) ?>
                                </span>
                                <span class="feedback-date">
                                    <?= date('d/m/Y H:i', strtotime($message['created_at'])) ?>
                                </span>
                            </div>
                            <h3 class="feedback-subject"><?= $message['subject'] ?></h3>
                            <p class="feedback-user">
                                <?= $message['name'] ?> 
                                <?php if ($message['user_name']): ?>
                                    (Usuario: <?= $message['user_name'] ?>)
                                <?php endif; ?>
                            </p>
                            <p class="feedback-email"><?= $message['email'] ?></p>
                        </div>
                        
                        <div class="feedback-body">
                            <p><?= nl2br($message['message']) ?></p>
                        </div>
                        
                        <div class="feedback-actions">
                            <form method="POST" class="status-form">
                                <input type="hidden" name="id" value="<?= $message['id'] ?>">
                                <select name="status" onchange="this.form.submit()">
                                    <option value="new" <?= $message['status'] === 'new' ? 'selected' : '' ?>>Nuevo</option>
                                    <option value="in_progress" <?= $message['status'] === 'in_progress' ? 'selected' : '' ?>>En Progreso</option>
                                    <option value="resolved" <?= $message['status'] === 'resolved' ? 'selected' : '' ?>>Resuelto</option>
                                </select>
                                <input type="submit" name="update_status" value="Actualizar" class="btn-small">
                            </form>
                            
                            <a href="mailto:<?= $message['email'] ?>?subject=Respuesta: <?= $message['subject'] ?>" 
                                class="btn-small reply-btn">
                                Responder
                            </a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>