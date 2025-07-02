<?php
require 'config/connection.php';
require 'config/i18n.php';

$slug = $_GET['mito'] ?? '';
$lang = $current_lang; // Idioma actual desde i18n.php

if (empty($slug)) {
    header('Location: /galeria.php');
    exit;
}

try {
    // Obtener información básica del mito con traducción
    $stmt = $pdo->prepare("
        SELECT s.*, st.nombre, st.pais, st.region 
        FROM mitos s
        JOIN mitos_translations st ON s.id = st.mito_id
        WHERE s.slug = ? AND st.language_code = ?
    ");
    $stmt->execute([$slug, $lang]);
    $mito = $stmt->fetch();
    
    if (!$mito) {
        header('Location: /galeria.php');
        exit;
    }
    
    // Obtener información detallada con traducción
    $stmt = $pdo->prepare("
        SELECT sd.*, dt.descripcion, dt.origen, dt.historia, dt.seres_principales
        FROM mitos_detalle sd
        JOIN detallem_translations dt ON sd.id = dt.detallem_id
        WHERE sd.mito_id = ? AND dt.language_code = ?
    ");
    $stmt->execute([$mito['id'], $lang]);
    $detallem = $stmt->fetch();
    
    // Obtener imágenes adicionales
    $stmt = $pdo->prepare("SELECT * FROM mitos_imagenes WHERE mito_id = ?");
    $stmt->execute([$mito['id']]);
    $imagenes = $stmt->fetchAll();
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($mito['nombre']) ?> - <?= __('site_title') ?></title>
    <link rel="stylesheet" href="/styles/detallem.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="<?= __('discover') ?> <?= htmlspecialchars($mito['nombre']) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($mito['nombre']) ?> - <?= __('site_title') ?>">
    <meta property="og:description" content="<?= __('discover') ?> <?= htmlspecialchars($mito['nombre']) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($mito['imagen']) ?>">
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

<main class="detail-container">
    <!-- Sección Hero con retrato -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-info">
                <h1 class="mito-title"><?= htmlspecialchars($mito['nombre']) ?></h1>
                <div class="basic-info">
                    <div class="info-item">
                        <span class="label"><?= __('country') ?>:</span>
                        <span class="value pais"><?= htmlspecialchars($mito['pais']) ?></span>
                    </div>
                    <div class="info-item">
                        <span class="label"><?= __('region') ?>:</span>
                        <span class="value region"><?= htmlspecialchars($mito['region']) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <?php if ($detallem): ?>
    <section class="content-section">
        <div class="content-grid">
            <?php if (!empty($detallem['descripcion'])): ?>
            <div class="content-card description-card">
                <h2 class="section-title"><?= __('description') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['descripcion'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['origen'])): ?>
            <div class="content-card characteristics-card">
                <div class="characteristics-grid <?= empty($detallem['origen_img']) ? 'single-column' : '' ?>">
                    <div class="characteristics-text">
                        <h2 class="section-title"><?= __('origin') ?></h2>
                        <div class="content-text"><?= nl2br(htmlspecialchars($detallem['origen'])) ?></div>
                    </div>
                    <?php if (!empty($detallem['origen_img'])): ?>
                    <div class="characteristics-image">
                        <img src="<?= htmlspecialchars($detallem['origen_img']) ?>" alt="<?= htmlspecialchars($mito['nombre']) ?>" loading="lazy">
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['historia'])): ?>
            <div class="content-card history-card">
                <h2 class="section-title"><?= __('history') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['historia'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['seres_principales'])): ?>
            <div class="content-card etymology-card">
                <h2 class="section-title"><?= __('main_beings') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['seres_principales'])) ?></div>
            </div>
            <?php endif; ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- Galería de imágenes estilo Pinterest -->
    <?php if (!empty($imagenes)): ?>
    <section class="gallery-section">
        <h2 class="section-title"><?= __('image_gallery') ?></h2>
        <div class="masonry-gallery">
            <?php foreach ($imagenes as $img): ?>
            <div class="masonry-item">
                <img src="<?= htmlspecialchars($img['imagen_url']) ?>" 
                     alt="<?= htmlspecialchars($mito['nombre']) ?>" 
                     loading="lazy" 
                     onclick="openModal(this)">
            </div>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

<section class="navigation-section">
    <div class="nav-buttons">
        <a href="/mitos.php" class="btn-back"><?= __('back_to_gallery') ?></a>
        <?php
        // CONSULTAS MODIFICADAS PARA ORDEN ALFABÉTICO
        $prev = $pdo->prepare("SELECT slug, nombre FROM mitos WHERE nombre < ? ORDER BY nombre DESC LIMIT 1");
        $prev->execute([$mito['nombre']]);
        $prevItem = $prev->fetch();

        $next = $pdo->prepare("SELECT slug, nombre FROM mitos WHERE nombre > ? ORDER BY nombre ASC LIMIT 1");
        $next->execute([$mito['nombre']]);
        $nextItem = $next->fetch();
        ?>
        <div class="nav-arrows">
            <?php if ($prevItem): ?>
            <a href="/detallem.php?mito=<?= urlencode($prevItem['slug']) ?>" class="btn-nav prev">&larr; <?= htmlspecialchars($prevItem['nombre']) ?></a>
            <?php endif; ?>
            <?php if ($nextItem): ?>
            <a href="/detallem.php?mito=<?= urlencode($nextItem['slug']) ?>" class="btn-nav next"><?= htmlspecialchars($nextItem['nombre']) ?> &rarr;</a>
            <?php endif; ?>
        </div>
    </div>
</section>

</main>

<!-- Modal para imágenes -->
<div id="imageModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <img id="modalImage" src="" alt="">
    </div>
</div>

<script src="/JS/detallem.js"></script>
<script src="/JS/header.js"></script>

</body>
</html>