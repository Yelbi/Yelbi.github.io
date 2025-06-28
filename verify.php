<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/classes/User.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    die("Token no proporcionado");
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

if ($user->verifyEmail($token)) {
    $message = "¡Email verificado! Ya puedes iniciar sesión.";
    $success = true;
} else {
    $message = "Token inválido. Solicita un nuevo enlace.";
    $success = false;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Email</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounceIn 0.8s ease-out 0.2s both;
        }

        @keyframes bounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }

        .success .icon {
            color: #10b981;
        }

        .error .icon {
            color: #ef4444;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .success h1 {
            color: #047857;
            text-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .error h1 {
            color: #dc2626;
            text-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        p {
            font-size: 1.1rem;
            color: #64748b;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .error .btn {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }

        .error .btn:hover {
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
        }

        .decorative-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }

        .floating-shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
            width: 80px;
            height: 80px;
            top: 10%;
            left: 10%;
            animation-delay: 0s;
        }

        .shape-2 {
            width: 120px;
            height: 120px;
            top: 70%;
            right: 10%;
            animation-delay: 2s;
        }

        .shape-3 {
            width: 60px;
            height: 60px;
            top: 30%;
            right: 20%;
            animation-delay: 4s;
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
                margin: 10px;
            }

            h1 {
                font-size: 2rem;
            }

            .icon {
                font-size: 3rem;
            }

            p {
                font-size: 1rem;
            }

            .btn {
                padding: 12px 25px;
                font-size: 0.9rem;
            }
        }

        /* Pulse animation for success */
        .success .icon {
            animation: bounceIn 0.8s ease-out 0.2s both, pulse 2s infinite 1s;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
    </style>
</head>
<body>
    <div class="decorative-elements">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
    </div>

    <div class="container <?php echo $success ? 'success' : 'error'; ?>">
        <?php if ($success): ?>
            <div class="icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h1>¡Verificado!</h1>
            <p><?= htmlspecialchars($message) ?></p>
            <a href="/iniciar.php" class="btn">
                <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </a>
        <?php else: ?>
            <div class="icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Error</h1>
            <p><?= htmlspecialchars($message) ?></p>
            <a href="/" class="btn">
                <i class="fas fa-home"></i> Volver al Inicio
            </a>
        <?php endif; ?>
    </div>
</body>
</html>