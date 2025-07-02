<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="<?= current_lang() ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/admin-panel.css">
    <title><?= __('admin_panel') ?></title>
</head>
<body>
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
                
                <!-- Opción de idioma (siempre visible) -->
                <div class="divider"></div>
                <a href="#" class="dropdown-item" id="languageOption" onclick="toggleLanguage()">
                    <i class="fi fi-rr-globe"></i> <?= __('change_language') ?>
                </a>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="form-container active">
            <div id="profileAlert"></div>
            <div class="user-info">
                <p><strong><?= __('name') ?>:</strong> <span id="profileName"></span></p>
                <p><strong><?= __('email') ?>:</strong> <span id="profileEmail"></span></p>
                
                <!-- Sección para administradores -->
                <div id="adminSection">
                    <h3><?= __('admin_panel') ?></h3>
                    <div class="mailbox-header">
                        <div class="mailbox-title">
                            <?= __('inbox') ?>
                            <span class="message-count" id="messageCount" style="display: none;">0</span>
                        </div>
                        <button class="btn-refresh" onclick="loadAdminMessages()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <?= __('refresh') ?>
                        </button>
                    </div>
    
                    <!-- Toolbar -->
                    <div class="mailbox-toolbar" style="display: none;">
                        <button class="toolbar-btn active"><?= __('all') ?></button>
                        <button class="toolbar-btn"><?= __('unread') ?></button>
                        <button class="toolbar-btn"><?= __('important') ?></button>
                    </div>
    
                    <div id="messagesContainer" class="mailbox-container">
                        <!-- Mensajes se cargarán aquí -->
                    </div>
                </div>
                
                <button class="btn" onclick="logout()"><?= __('logout') ?></button>
            </div>
        </div>
    </div>
    
    <script src="/JS/admin-panel.js"></script>
    <script src="/JS/header.js"></script>
</body>
</html>