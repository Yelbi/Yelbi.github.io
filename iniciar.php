<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/styles/iniciar.css">
    <link rel="stylesheet" href="/styles/header.css">
    <title>Sistema de Usuarios - Producción</title>
</head>
<body>
<!-- Header -->
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
        <!-- Formulario de Registro -->
        <div id="registerForm" class="form-container active">
            <h2>Crear Cuenta</h2>
            <div id="registerAlert"></div>
            <form id="registerFormElement">
                <div class="form-group">
                    <label for="registerName">Nombre Completo *</label>
                    <input type="text" id="registerName" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Correo Electrónico *</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Contraseña *</label>
                    <input type="password" id="registerPassword" required>
                    <div id="passwordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="registerConfirmPassword">Confirmar Contraseña *</label>
                    <input type="password" id="registerConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="registerBtn">
                    <span class="btn-text">Crear Cuenta</span>
                </button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()">¿Ya tienes cuenta? Inicia sesión</a>
        </div>

        <!-- Formulario de Inicio de Sesión -->
        <div id="loginForm" class="form-container">
            <h2>Iniciar Sesión</h2>
            <div id="loginAlert"></div>
            <form id="loginFormElement">
                <div class="form-group">
                    <label for="loginEmail">Correo Electrónico</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Contraseña</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn" id="loginBtn">
                    <span class="btn-text">Iniciar Sesión</span>
                </button>
            </form>
            <div style="text-align: center; margin: 15px 0;">
                <a href="#" class="link-btn" onclick="showForgotPassword()" style="font-size: 14px;">¿Olvidaste tu contraseña?</a>
            </div>
            <a href="#" class="link-btn" onclick="showRegister()">¿No tienes cuenta? Regístrate</a>
        </div>

        <!-- Formulario de Recuperar Contraseña -->
        <div id="forgotPasswordForm" class="form-container">
            <h2>Recuperar Contraseña</h2>
            <div id="forgotAlert"></div>
            <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
            <form id="forgotPasswordFormElement">
                <div class="form-group">
                    <label for="forgotEmail">Correo Electrónico</label>
                    <input type="email" id="forgotEmail" required>
                </div>
                <button type="submit" class="btn" id="forgotBtn">
                    <span class="btn-text">Enviar Instrucciones</span>
                </button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()">Volver al login</a>
        </div>

        <!-- Panel de Perfil -->
<div id="profilePanel" class="form-container">
    <h2>Mi Perfil</h2>
    <div id="profileAlert"></div>
    <div class="user-info">
        <p><strong>Nombre:</strong> <span id="profileName"></span></p>
        <p><strong>Email:</strong> <span id="profileEmail"></span></p>
        
        <!-- Sección para usuarios normales -->
        <div id="userSection" style="display: none;">
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
                <button type="submit" class="btn">Enviar</button>
            </form>
        </div>
        
        <!-- Sección para administradores -->
<div id="adminSection" style="display: none;">
    <h3>Buzón de Mensajes</h3>
    <div class="mailbox-header">
        <div class="mailbox-stats" id="mailboxStats"></div>
        <button class="btn-refresh" onclick="loadAdminMessages()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Actualizar
        </button>
    </div>
    <div id="messagesContainer" class="mailbox-container">
        <!-- Mensajes se cargarán aquí -->
    </div>
</div>
        
        <button class="btn" onclick="logout()">Cerrar Sesión</button>
    </div>
</div>
    </div>
    <script src="/JS/iniciar.js"></script>
</body>
</html>