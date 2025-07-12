<?php
session_start();
require 'config/connection.php';
require 'config/i18n.php';

$slug = $_GET['ser'] ?? '';
$lang = $current_lang; // Idioma actual desde i18n.php

if (empty($slug)) {
    header('Location: /galeria.php');
    exit;
}

try {
    // Obtener información básica del ser con traducción
    $stmt = $pdo->prepare("
        SELECT s.*, st.nombre, st.tipo, st.region 
        FROM seres s
        JOIN seres_translations st ON s.id = st.ser_id
        WHERE s.slug = ? AND st.language_code = ?
    ");
    $stmt->execute([$slug, $lang]);
    $ser = $stmt->fetch();
    
    if (!$ser) {
        header('Location: /galeria.php');
        exit;
    }
    
    // Obtener información detallada con traducción
    $stmt = $pdo->prepare("
        SELECT sd.*, dt.descripcion, dt.caracteristicas, dt.etimologia, dt.historia 
        FROM seres_detalle sd
        JOIN detalle_translations dt ON sd.id = dt.detalle_id
        WHERE sd.ser_id = ? AND dt.language_code = ?
    ");
    $stmt->execute([$ser['id'], $lang]);
    $detalle = $stmt->fetch();
    
    // Obtener imágenes adicionales
    $stmt = $pdo->prepare("SELECT * FROM seres_imagenes WHERE ser_id = ?");
    $stmt->execute([$ser['id']]);
    $imagenes = $stmt->fetchAll();
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}

$approvedImages = [];
try {
    $stmt = $pdo->prepare("
        SELECT image_url 
        FROM gallery_submissions 
        WHERE ser_id = ? AND status = 'approved'
    ");
    $stmt->execute([$ser['id']]);
    $approvedImages = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Manejar error silenciosamente
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($ser['nombre']) ?> - <?= __('site_title') ?></title>
    <link rel="stylesheet" href="/styles/detalle.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="<?= __('description') ?> <?= htmlspecialchars($ser['nombre']) ?>, <?= htmlspecialchars($ser['tipo']) ?> de <?= htmlspecialchars($ser['region']) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($ser['nombre']) ?> - <?= __('site_title') ?>">
    <meta property="og:description" content="<?= __('discover') ?> <?= htmlspecialchars($ser['nombre']) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($ser['imagen']) ?>">
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

<main class="detail-container">
    <!-- Sección Hero con retrato -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-info">
                <h1 class="ser-title"><?= htmlspecialchars($ser['nombre']) ?></h1>
                <div class="basic-info">
                    <div class="info-item">
                        <span class="label"><?= __('type') ?>:</span>
                        <span class="value tipo"><?= htmlspecialchars($ser['tipo']) ?></span>
                    </div>
                    <div class="info-item">
                        <span class="label"><?= __('region') ?>:</span>
                        <span class="value region"><?= htmlspecialchars($ser['region']) ?></span>
                    </div>
                </div>
            </div>
            <?php if ($detalle && !empty($detalle['ser_img'])): ?>
            <div class="hero-portrait">
                <img src="<?= htmlspecialchars($detalle['ser_img']) ?>" alt="<?= __('portrait_of') ?> <?= htmlspecialchars($ser['nombre']) ?>" class="portrait-image">
            </div>
        </div>
    </section>

    <?php if ($detalle): ?>
    <section class="content-section">
        <div class="content-grid">
            <?php if (!empty($detalle['descripcion'])): ?>
            <div class="content-card description-card">
                <h2 class="section-title"><?= __('description') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detalle['descripcion'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detalle['caracteristicas'])): ?>
            <div class="content-card characteristics-card">
                <div class="characteristics-grid <?= empty($detalle['caracteristicas_img']) ? 'single-column' : '' ?>">
                    <div class="characteristics-text">
                        <h2 class="section-title"><?= __('characteristics') ?></h2>
                        <div class="content-text"><?= nl2br(htmlspecialchars($detalle['caracteristicas'])) ?></div>
                    </div>
                    <?php if (!empty($detalle['caracteristicas_img'])): ?>
                    <div class="characteristics-image">
                        <img src="<?= htmlspecialchars($detalle['caracteristicas_img']) ?>" alt="<?= htmlspecialchars($ser['nombre']) ?>" loading="lazy">
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detalle['etimologia'])): ?>
            <div class="content-card etymology-card">
                <h2 class="section-title"><?= __('etymology') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detalle['etimologia'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detalle['historia'])): ?>
            <div class="content-card history-card">
                <h2 class="section-title"><?= __('history') ?></h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detalle['historia'])) ?></div>
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
                     alt="<?= htmlspecialchars($ser['nombre']) ?>" 
                     loading="lazy" 
                     onclick="openModal(this)">
            </div>
            <?php endforeach; ?>
        <?php foreach ($approvedImages as $img): ?>
        <div class="masonry-item">
            <img src="<?= htmlspecialchars($img['image_url']) ?>" 
                 alt="<?= htmlspecialchars($ser['nombre']) ?>" 
                 loading="lazy" 
                 onclick="openModal(this)">
            <div class="image-source">Contribuido por usuarios</div>
        </div>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <p><?= __('no_images') ?></p>
    <?php endif; ?>
    
    <!-- Formulario para subir nuevas imágenes -->
    <?php if (isset($_SESSION['user_id'])): ?>
    <div class="upload-section">
        <h3><?= __('upload_new_image') ?></h3>
        <form id="galleryUploadForm">
            <input type="hidden" name="ser_id" value="<?= $ser['id'] ?>">
            <div class="form-group">
                <label for="imageUrl">URL de la imagen:</label>
                <input type="url" id="imageUrl" name="image_url" required 
                    placeholder="https://ejemplo.com/imagen.jpg">
            </div>
            <button type="submit" class="btn-upload"><?= __('submit_for_approval') ?></button>
        </form>
        <div id="uploadStatus"></div>
    </div>
    <?php else: ?>
    <div class="upload-login-prompt">
        <p><?= __('login_to_upload') ?> <a href="/iniciar.php"><?= __('login') ?></a></p>
    </div>
    <?php endif; ?>
</section>
    <?php endif; ?>

<section class="navigation-section">
    <div class="nav-buttons">
        <a href="/galeria.php" class="btn-back"><?= __('back_to_gallery') ?></a>
        <?php
        // CONSULTAS MODIFICADAS PARA ORDEN ALFABÉTICO (en el idioma actual)
        $prev = $pdo->prepare("
            SELECT s.slug, st.nombre 
            FROM seres s
            JOIN seres_translations st ON s.id = st.ser_id
            WHERE st.language_code = ? AND st.nombre < ? 
            ORDER BY st.nombre DESC 
            LIMIT 1
        ");
        $prev->execute([$lang, $ser['nombre']]);
        $prevItem = $prev->fetch();
        
        $next = $pdo->prepare("
            SELECT s.slug, st.nombre 
            FROM seres s
            JOIN seres_translations st ON s.id = st.ser_id
            WHERE st.language_code = ? AND st.nombre > ? 
            ORDER BY st.nombre ASC 
            LIMIT 1
        ");
        $next->execute([$lang, $ser['nombre']]);
        $nextItem = $next->fetch();
        ?>
        <div class="nav-arrows">
            <?php if ($prevItem): ?>
            <a href="/detalle.php?ser=<?= urlencode($prevItem['slug']) ?>" class="btn-nav prev">&larr; <?= htmlspecialchars($prevItem['nombre']) ?></a>
            <?php endif; ?>
            <?php if ($nextItem): ?>
            <a href="/detalle.php?ser=<?= urlencode($nextItem['slug']) ?>" class="btn-nav next"><?= htmlspecialchars($nextItem['nombre']) ?> &rarr;</a>
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

<script src="/JS/detalle.js"></script>
<script src="/JS/header.js"></script>

</body>
</html>