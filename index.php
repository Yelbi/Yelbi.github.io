<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/index.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('site_title') ?></title>
</head>
<body>
    <!-- Header con selector de idioma -->
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

    <div class="container" id="container">
        <!-- Sección 1 -->
        <section class="section section1 active" id="section1">
            <canvas id="starfield"></canvas>
            <div class="section-content">
                <p style="margin: 0;"><?= __('welcome') ?></p>
                <h1>Seres</h1>
                <p><?= __('welcome_sub') ?></p>
                <a href="/galeria.php" class="btn"><?= __('explore') ?></a>
            </div>
        </section>
        
        <!-- Sección 2 -->
        <section class="section section2" id="section2">
            <a-hole-section2>
                <canvas class="js-canvas"></canvas>
            </a-hole-section2>
            <div class="section-content">
                <a href="/random_ser.php" class="btn random-btn">
                    <i class="fi fi-rr-shuffle"></i> <?= __('discover_random') ?>
                </a>
            </div>
        </section>

        <!-- Sección 3 -->
        <section class="section section3" id="section3">
            <canvas id="infinity-canvas"></canvas>
            <div class="section-content">
                <h1><?= __('contact') ?></h1>
                <p><?= __('contact_sub') ?></p>
                <a href="/iniciar.php" class="btn"><?= __('here') ?></a>
            </div>
        </section>

        <!-- Navegación por puntos -->
        <div class="nav-dots">
            <div class="nav-dot active" data-section="0"></div>
            <div class="nav-dot" data-section="1"></div>
            <div class="nav-dot" data-section="2"></div>
        </div>

        <!-- Indicador de scroll -->
        <div class="scroll-indicator" id="scrollIndicator">
            <div><?= __('swipe_to_explore') ?></div>
            <span class="scroll-arrow">↓</span>
        </div>

        <script src="/JS/header.js"></script>
        <script src="/JS/index.js"></script>
        <script src="/JS/backspace.js"></script>
        <script type="module" src="/JS/backhole.js"></script>
        <script src="/JS/infinity.js"></script>
    </div>
</body>
</html>