<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/admin-panel.css">
    <title>Panel de Administración</title>
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
            <div id="profileAlert"></div>
            <div class="user-info">
                <p><strong>Nombre:</strong> <span id="profileName"></span></p>
                <p><strong>Email:</strong> <span id="profileEmail"></span></p>
                
                <!-- Sección para administradores -->
                <div id="adminSection">
                    <h3>Panel de Administración</h3>
                    <div class="mailbox-header">
                        <div class="mailbox-title">
                            Bandeja de entrada
                            <span class="message-count" id="messageCount" style="display: none;">0</span>
                        </div>
                        <button class="btn-refresh" onclick="loadAdminMessages()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Actualizar
                        </button>
                    </div>
    
                    <!-- Toolbar -->
                    <div class="mailbox-toolbar" style="display: none;">
                        <button class="toolbar-btn active">Todos</button>
                        <button class="toolbar-btn">No leídos</button>
                        <button class="toolbar-btn">Importantes</button>
                    </div>
    
                    <div id="messagesContainer" class="mailbox-container">
                        <!-- Mensajes se cargarán aquí -->
                    </div>
                </div>
                
                <button class="btn" onclick="logout()">Cerrar Sesión</button>
            </div>
        </div>
    </div>
    
    <script src="/JS/admin-panel.js"></script>
    <script src="/JS/header.js"></script>
</body>
</html>