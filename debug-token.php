<?php
// debug-token.php - Página temporal para debuggear tokens
// ELIMINAR EN PRODUCCIÓN

session_start();

$token = $_GET['token'] ?? '';
$debug_info = [];

if (!empty($token)) {
    // Incluir archivos necesarios
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/classes/User.php';
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        $user = new User($db);
        
        // Verificar token directamente
        $verification = $user->verifyResetToken($token);
        $debug_info['verification'] = $verification;
        
        // Buscar directamente en la base de datos
        $stmt = $db->prepare("SELECT id, email, reset_token, reset_expiry, NOW() as now FROM users WHERE reset_token = ?");
        $stmt->execute([$token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $debug_info['database_result'] = $result;
        
        // Contar todos los tokens activos
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE reset_token IS NOT NULL");
        $stmt->execute();
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        $debug_info['active_tokens'] = $count['count'];
        
    } catch (Exception $e) {
        $debug_info['error'] = $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Token</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .debug-box { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .success { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        pre { white-space: pre-wrap; word-break: break-all; }
    </style>
</head>
<body>
    <h1>Debug Token Reset</h1>
    
    <form method="GET">
        <label>Token a verificar:</label><br>
        <input type="text" name="token" value="<?= htmlspecialchars($token) ?>" style="width: 100%; padding: 5px;">
        <br><br>
        <button type="submit">Verificar Token</button>
    </form>

    <?php if (!empty($debug_info)): ?>
        <h2>Información de Debug:</h2>
        
        <div class="debug-box">
            <h3>Token ingresado:</h3>
            <pre><?= htmlspecialchars($token) ?></pre>
        </div>
        
        <div class="debug-box <?= $debug_info['verification']['valid'] ? 'success' : 'error' ?>">
            <h3>Resultado de verificación:</h3>
            <pre><?= json_encode($debug_info['verification'], JSON_PRETTY_PRINT) ?></pre>
        </div>
        
        <div class="debug-box">
            <h3>Resultado directo de base de datos:</h3>
            <pre><?= json_encode($debug_info['database_result'], JSON_PRETTY_PRINT) ?></pre>
        </div>
        
        <div class="debug-box">
            <h3>Tokens activos en el sistema:</h3>
            <pre><?= $debug_info['active_tokens'] ?></pre>
        </div>
        
        <?php if (isset($debug_info['error'])): ?>
            <div class="debug-box error">
                <h3>Error:</h3>
                <pre><?= htmlspecialchars($debug_info['error']) ?></pre>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</body>
</html>