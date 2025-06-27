<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/user-panel.css">
    <title>Mi Perfil</title>
</head>
<body>
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="Logo de Seres">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="#" class="nav-link">Contacto</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <div class="container">
        <div class="form-container active">
            <h2>Mi Perfil</h2>
            <div id="profileAlert"></div>
            <div class="user-info">
                <p><strong>Nombre:</strong> <span id="profileName"></span></p>
                <p><strong>Email:</strong> <span id="profileEmail"></span></p>
                
                <!-- Sección para usuarios normales -->
                <div id="userSection">
                    <h3>Buzón de Quejas y Sugerencias</h3>
                    <form id="complaintForm">
                        <div class="form-group">
                            <label for="complaintSubject">Asunto *</label>
                            <input type="text" id="complaintSubject" required>
                        </div>
                        <div class="form-group">
                            <label for="complaintDescription">Descripción *</label>
                            <textarea id="complaintDescription" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn">Enviar Mensaje</button>
                    </form>
                </div>
                
                <button class="btn" onclick="logout()">Cerrar Sesión</button>
            </div>
        </div>
    </div>
    
    <script src="/JS/user-panel.js"></script>
    <script src="/JS/header.js"></script>
</body>
</html>