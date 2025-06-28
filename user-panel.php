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
            <a href="/mitos.php" class="nav-link">Mitologías</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">☰</div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <div class="container">
        <!-- Header del perfil -->
        <div class="profile-header">
            <div id="profileAlert"></div>
            <div class="user-info">
                <div class="user-details">
                    <p><strong>Nombre:</strong> <span id="profileName">Cargando...</span></p>
                    <p><strong>Email:</strong> <span id="profileEmail">Cargando...</span></p>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="fi fi-rr-sign-out-alt"></i>
                    Cerrar Sesión
                </button>
            </div>
        </div>

        <!-- Grid de secciones -->
        <div class="sections-grid">
            <!-- Sección de Quejas y Sugerencias -->
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">
                        <i class="fi fi-rr-comment-alt"></i>
                    </div>
                    <h2 class="section-title">Buzón de Quejas y Sugerencias</h2>
                </div>
                
                <form id="complaintForm">
                    <div class="form-group">
                        <label for="complaintSubject">Asunto *</label>
                        <input type="text" id="complaintSubject" placeholder="Escribe el asunto de tu mensaje" required>
                    </div>
                    <div class="form-group">
                        <label for="complaintDescription">Descripción *</label>
                        <textarea id="complaintDescription" rows="4" placeholder="Describe tu queja o sugerencia en detalle" required></textarea>
                    </div>
                    <button type="submit" class="btn">
                        <i class="fi fi-rr-paper-plane"></i>
                        Enviar Mensaje
                    </button>
                </form>
            </div>

            <!-- Sección de Favoritos -->
            <div class="section favorites-section">
                <div class="section-header">
                    <div class="section-icon">
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <h2 class="section-title">Mis Favoritos</h2>
                </div>
                
                <div class="empty-state">
                    <div>
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <p>Aún no tienes elementos favoritos</p>
                    <p>Cuando marques contenido como favorito, aparecerá aquí</p>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/JS/user-panel.js"></script>
    <script src="/JS/header.js"></script>
</body>
</html>