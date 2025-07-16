<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="<?= current_lang() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/styles/iniciar.css">
    <link rel="stylesheet" href="/styles/header.css">
    <title><?= __('user_system') ?></title>
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
            <a href="/mitos.php" class="nav-link"><?= __('myths') ?></a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        
        <!-- Botón unificado de usuario/idioma -->
        <div class="unified-menu">
            <!-- Botón principal (visible cuando no autenticado) -->
            <div class="user-btn" id="unifiedButton">
                <i class="fi fi-rr-user"></i>
            </div>
            
            <!-- Menú de perfil (visible solo cuando autenticado) -->
            <div class="profile-icon" id="profileIcon" style="display: none;">
                <img src="/Img/default-avatar.png" alt="<?= __('profile_picture') ?>" id="profileImage">
            </div>
            
            <!-- Menú desplegable unificado -->
            <div class="dropdown-menu" id="dropdownMenu">
                <!-- Header para usuarios autenticados -->
                <div class="dropdown-header" id="userHeader" style="display: none;">
                    <img src="/Img/default-avatar.png" alt="<?= __('profile_picture') ?>" id="dropdownProfileImage">
                    <span class="dropdown-user-name" id="dropdownUserName"><?= __('user') ?></span>
                </div>
                
                <!-- Opciones para usuarios no autenticados -->
                <div class="guest-options" id="guestOptions">
                    <a href="/iniciar.php" class="dropdown-item">
                        <i class="fi fi-rr-sign-in"></i> <?= __('login') ?>
                    </a>
                </div>
                
                <!-- Opciones para usuarios autenticados -->
                <div class="user-options" id="userOptions" style="display: none;">
                    <a href="/user-panel.php" class="dropdown-item">
                        <i class="fi fi-rr-user"></i> <?= __('my_profile') ?>
                    </a>
                    <div class="divider"></div>
                    <a href="#" class="dropdown-item" onclick="logout()">
                        <i class="fi fi-rr-sign-out"></i> <?= __('logout') ?>
                    </a>
                </div>
                
                <!-- Opción de idioma mejorada -->
                <div class="divider"></div>
                <a href="#" class="dropdown-item language-toggle" id="languageOption" 
                   title="<?= __('switch_to') ?> <?= lang_name(alt_lang()) ?>">
                    <i class="fi fi-rr-globe"></i>
                    <span class="lang-text"><?= lang_name(alt_lang()) ?></span>
                    <span class="lang-flag"><?= current_lang() === 'es' ? '🇺🇸' : '🇪🇸' ?></span>
                </a>
            </div>
        </div>
    </header>

<div class="container">
        <!-- Formulario de Inicio de Sesión -->
        <div id="loginForm" class="form-container active">
            <h2><?= __('login') ?></h2>
            <div id="loginAlert"></div>
            <form id="loginFormElement">
                <div class="form-group">
                    <label for="loginEmail"><?= __('email') ?></label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword"><?= __('password') ?></label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn" id="loginBtn"><?= __('login') ?></button>
            </form>
            <a href="#" class="link-btn" onclick="showRegister()"><?= __('no_account_register') ?></a>
            <a href="#" class="link-btn" onclick="showForgotPassword()"><?= __('forgot_password') ?></a>
        </div>

        <!-- Formulario de Registro -->
        <div id="registerForm" class="form-container">
            <h2><?= __('create_account') ?></h2>
            <div id="registerAlert"></div>
            <form id="registerFormElement">
                <div class="form-group">
                    <label for="registerName"><?= __('full_name') ?> *</label>
                    <input type="text" id="registerName" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail"><?= __('email') ?> *</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword"><?= __('password') ?> *</label>
                    <input type="password" id="registerPassword" required>
                    <div id="passwordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="registerConfirmPassword"><?= __('confirm_password') ?> *</label>
                    <input type="password" id="registerConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="registerBtn"><?= __('create_account') ?></button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()"><?= __('already_have_account') ?></a>
        </div>

        <!-- Formulario Recuperación -->
        <div id="forgotPasswordForm" class="form-container">
            <h2><?= __('recover_password') ?></h2>
            <div id="forgotPasswordAlert"></div>
            <form id="forgotPasswordFormElement">
                <div class="form-group">
                    <label for="forgotEmail"><?= __('email') ?></label>
                    <input type="email" id="forgotEmail" required>
                </div>
                <button type="submit" class="btn" id="forgotPasswordBtn"><?= __('send_link') ?></button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()"><?= __('back_to_login') ?></a>
        </div>

        <!-- Formulario de Restablecer Contraseña -->
        <div id="resetPasswordForm" class="form-container">
            <h2><?= __('reset_password') ?></h2>
            <div id="resetPasswordAlert"></div>
            <form id="resetPasswordFormElement">
                <div class="form-group">
                    <label for="resetToken"><?= __('recovery_token') ?></label>
                    <input type="text" id="resetToken" required readonly>
                    <small class="form-text text-muted"><?= __('token_auto_filled') ?></small>
                </div>
                <div class="form-group">
                    <label for="resetNewPassword"><?= __('new_password') ?> *</label>
                    <input type="password" id="resetNewPassword" required>
                    <div id="resetPasswordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="resetConfirmPassword"><?= __('confirm_new_password') ?> *</label>
                    <input type="password" id="resetConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="resetPasswordBtn"><?= __('change_password') ?></button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()"><?= __('back_to_login') ?></a>
        </div>
    </div>
    <script src="/JS/iniciar.js"></script>
    <script src="/JS/header.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>