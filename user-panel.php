<?php require 'config/i18n.php'; ?>
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
                <img src="/Img/default-avatar.png" alt="Foto de perfil" id="profileImage">
            </div>
            
            <!-- Menú desplegable unificado -->
            <div class="dropdown-menu" id="dropdownMenu">
                <!-- Header para usuarios autenticados -->
                <div class="dropdown-header" id="userHeader" style="display: none;">
                    <img src="/Img/default-avatar.png" alt="Foto de perfil" id="dropdownProfileImage">
                    <span class="dropdown-user-name" id="dropdownUserName">Usuario</span>
                </div>
                
                <!-- Opciones para usuarios no autenticados -->
                <div class="guest-options" id="guestOptions">
                    <a href="/iniciar.php" class="dropdown-item">
                        <i class="fi fi-rr-sign-in"></i> Iniciar sesión
                    </a>
                </div>
                
                <!-- Opciones para usuarios autenticados -->
                <div class="user-options" id="userOptions" style="display: none;">
                    <a href="/user-panel.php" class="dropdown-item">
                        <i class="fi fi-rr-user"></i> Mi perfil
                    </a>
                    <div class="divider"></div>
                    <a href="#" class="dropdown-item" onclick="logout()">
                        <i class="fi fi-rr-sign-out"></i> Cerrar sesión
                    </a>
                </div>
                
                <!-- Opción de idioma (siempre visible) -->
                <div class="divider"></div>
                <a href="#" class="dropdown-item" id="languageOption" onclick="toggleLanguage()">
                    <i class="fi fi-rr-globe"></i> Cambiar idioma
                </a>
            </div>
        </div>
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