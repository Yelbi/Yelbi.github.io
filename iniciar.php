<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/styles/iniciar.css">
    <link rel="stylesheet" href="/styles/header.css">
    <title>Sistema de Usuarios</title>
</head>
<body>
<!-- Header -->
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="<?= __('site_title') ?>">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link"><?= __('home') ?></a>
            <a href="/galeria.php" class="nav-link"><?= __('gallery') ?></a>
            <a href="/mitos.php" class="nav-link"><?= __('mythologies') ?></a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        
        <!-- Botón de login (visible cuando no autenticado) -->
        <a href="/iniciar.php" class="user-btn" id="loginButton">
            <i class="fi fi-rr-user"></i>
        </a>
        
        <!-- Menú de perfil (visible solo cuando autenticado) -->
        <div class="profile-menu" id="profileMenu" style="display: none;">
            <div class="profile-icon" id="profileMenuToggle">
                <img src="/Img/default-avatar.png" alt="Foto de perfil" id="profileImage">
            </div>
            <div class="dropdown-menu" id="dropdownMenu">
                <div class="dropdown-header">
                    <img src="/Img/default-avatar.png" alt="Foto de perfil" id="dropdownProfileImage">
                    <span id="dropdownUserName">Usuario</span>
                </div>
                <a href="/user-panel.php" class="dropdown-item">
                    <i class="fi fi-rr-user"></i> Mi perfil
                </a>
                <a href="#" class="dropdown-item" onclick="toggleLanguage()">
                    <i class="fi fi-rr-globe"></i> Cambiar idioma
                </a>
                <div class="divider"></div>
                <a href="#" class="dropdown-item" onclick="logout()">
                    <i class="fi fi-rr-sign-out"></i> Cerrar sesión
                </a>
            </div>
        </div>
    </header>

<div class="container">
        <!-- Formulario de Inicio de Sesión -->
        <div id="loginForm" class="form-container active">
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
                <button type="submit" class="btn" id="loginBtn">Iniciar Sesión</button>
            </form>
            <a href="#" class="link-btn" onclick="showRegister()">¿No tienes cuenta? Regístrate</a>
            <a href="#" class="link-btn" onclick="showForgotPassword()">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Formulario de Registro -->
        <div id="registerForm" class="form-container">
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
                <button type="submit" class="btn" id="registerBtn">Crear Cuenta</button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()">¿Ya tienes cuenta? Inicia sesión</a>
        </div>

        <!-- Formulario Recuperación -->
        <div id="forgotPasswordForm" class="form-container">
            <h2>Recuperar Contraseña</h2>
            <div id="forgotPasswordAlert"></div>
            <form id="forgotPasswordFormElement">
                <div class="form-group">
                    <label for="forgotEmail">Correo Electrónico</label>
                    <input type="email" id="forgotEmail" required>
                </div>
                <button type="submit" class="btn" id="forgotPasswordBtn">Enviar Enlace</button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()">Volver al inicio de sesión</a>
        </div>

        <!-- Formulario de Restablecer Contraseña -->
        <div id="resetPasswordForm" class="form-container">
            <h2>Restablecer Contraseña</h2>
            <div id="resetPasswordAlert"></div>
            <form id="resetPasswordFormElement">
                <div class="form-group">
                    <label for="resetToken">Token de Recuperación</label>
                    <input type="text" id="resetToken" required readonly>
                    <small class="form-text text-muted">Este token se completó automáticamente</small>
                </div>
                <div class="form-group">
                    <label for="resetNewPassword">Nueva Contraseña *</label>
                    <input type="password" id="resetNewPassword" required>
                    <div id="resetPasswordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="resetConfirmPassword">Confirmar Nueva Contraseña *</label>
                    <input type="password" id="resetConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="resetPasswordBtn">Cambiar Contraseña</button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()">Volver al inicio de sesión</a>
        </div>
    </div>
    <script src="/JS/iniciar.js"></script>
    <script src="/JS/header.js"></script>
</body>
</html>