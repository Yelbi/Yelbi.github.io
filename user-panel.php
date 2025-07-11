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
    <link rel="stylesheet" href="/styles/user-panel.css">
    <title><?= __('my_profile') ?></title>
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
        <!-- Header del perfil -->
        <div class="profile-header">
            <div id="profileAlert"></div>
            <div class="user-info">
                <div class="user-details">
                    <p><strong><?= __('name') ?>:</strong> <span id="profileName"><?= __('loading') ?>...</span></p>
                    <p><strong><?= __('email') ?>:</strong> <span id="profileEmail"><?= __('loading') ?>...</span></p>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <i class="fi fi-rr-sign-out-alt"></i>
                    <?= __('logout') ?>
                </button>
            </div>
        </div>

<div class="profile-picture-section">
    <h3><i class="fi fi-rr-camera"></i> <?= __('profile_picture') ?></h3>
    <div class="current-picture">
        <img id="currentProfileImage" src="/Img/default-avatar.png" alt="<?= __('your_current_photo') ?>">
    </div>
    <form id="profilePictureForm" enctype="multipart/form-data">
        <div class="form-group">
            <label for="newProfileImage">
                <i class="fi fi-rr-upload"></i> <?= __('select_new_image') ?>:
            </label>
            <input type="file" 
                   id="newProfileImage" 
                   name="newProfileImage" 
                   accept="image/jpeg,image/png,image/gif,image/webp"
                   required>
            <div id="fileInfo" class="file-info"></div>
        </div>
        <button type="submit" class="btn">
            <i class="fi fi-rr-upload"></i> <?= __('update_photo') ?>
        </button>
    </form>
</div>

        <!-- Grid de secciones -->
        <div class="sections-grid">
            <!-- Sección de Quejas y Sugerencias -->
            <div class="section">
                <div class="section-header">
                    <div class="section-icon">
                        <i class="fi fi-rr-comment-alt"></i>
                    </div>
                    <h2 class="section-title"><?= __('complaints_suggestions_box') ?></h2>
                </div>
                
                <form id="complaintForm">
                    <div class="form-group">
                        <label for="complaintSubject"><?= __('subject') ?> *</label>
                        <input type="text" id="complaintSubject" placeholder="<?= __('write_message_subject') ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="complaintDescription"><?= __('description') ?> *</label>
                        <textarea id="complaintDescription" rows="4" placeholder="<?= __('describe_complaint_suggestion') ?>" required></textarea>
                    </div>
                    <button type="submit" class="btn">
                        <i class="fi fi-rr-paper-plane"></i>
                        <?= __('send_message') ?>
                    </button>
                </form>
            </div>

            <!-- Sección de Favoritos -->
            <div class="section favorites-section">
                <div class="section-header">
                    <div class="section-icon">
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <h2 class="section-title"><?= __('my_favorites') ?></h2>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/JS/user-panel.js"></script>
    <script src="/JS/favorites.js"></script>
    <script>
        // Renderizar favoritos cuando se cargue la página
        document.addEventListener('DOMContentLoaded', async () => {
            // Esperar a que se inicialice el user-panel
            setTimeout(async () => {
                if (window.favoritesManager && window.favoritesManager.isAuthenticated) {
                    await renderFavorites();
                }
            }, 1000);
        });
    </script>
    <script src="/JS/header.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>