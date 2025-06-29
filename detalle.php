<?php
// detalle.php
require 'config/connection.php';
require 'config/i18n.php';

$slug = $_GET['ser'] ?? '';

if (empty($slug)) {
    header('Location: /galeria.php');
    exit;
}

try {
    // Obtener información básica del ser
    $stmt = $pdo->prepare("SELECT * FROM seres WHERE slug = ?");
    $stmt->execute([$slug]);
    $ser = $stmt->fetch();
    
    if (!$ser) {
        header('Location: /galeria.php');
        exit;
    }
    
    // Obtener información detallada
    $stmt = $pdo->prepare("SELECT * FROM seres_detalle WHERE ser_id = ?");
    $stmt->execute([$ser['id']]);
    $detalle = $stmt->fetch();
    
    // Obtener imágenes adicionales
    $stmt = $pdo->prepare("SELECT * FROM seres_imagenes WHERE ser_id = ?");
    $stmt->execute([$ser['id']]);
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
    <nav class="nav-menu">
        <a href="/index.php" class="nav-link"><?= __('home') ?></a>
        <a href="/galeria.php" class="nav-link"><?= __('gallery') ?></a>
        <a href="/mitos.php" class="nav-link"><?= __('mythologies') ?></a>
    </nav>
    
    <!-- Selector de idioma -->
    <div class="language-switcher">
        <a href="?lang=es" class="<?= $current_lang === 'es' ? 'active' : '' ?>">ES</a> 
        <span>|</span>
        <a href="?lang=en" class="<?= $current_lang === 'en' ? 'active' : '' ?>">EN</a>
    </div>
    
    <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
</header>

<main class="detail-container">
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
            <?php endif; ?>
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
        </div>
    </section>
    <?php endif; ?>

<section class="navigation-section">
    <div class="nav-buttons">
        <a href="/galeria.php" class="btn-back"><?= __('back_to_gallery') ?></a>
        <?php
        // CONSULTAS MODIFICADAS PARA ORDEN ALFABÉTICO
        $prev = $pdo->prepare("SELECT slug, nombre FROM seres WHERE nombre < ? ORDER BY nombre DESC LIMIT 1");
        $prev->execute([$ser['nombre']]);
        $prevItem = $prev->fetch();
        
        $next = $pdo->prepare("SELECT slug, nombre FROM seres WHERE nombre > ? ORDER BY nombre ASC LIMIT 1");
        $next->execute([$ser['nombre']]);
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

<script>
    // Pasar traducciones a JavaScript
    const TRANSLATIONS = {
        image_not_available: "<?= __('image_not_available') ?>",
        view_details: "<?= __('view_details') ?>",
        enlarge_image: "<?= __('enlarge_image') ?>",
        enlarged_image: "<?= __('enlarged_image') ?>",
        gallery_initialized: "<?= __('gallery_initialized') ?>",
        gallery_init_error: "<?= __('gallery_init_error') ?>",
        detail_js_loaded: "<?= __('detail_js_loaded') ?>",
        modal_not_found: "<?= __('modal_not_found') ?>",
        menu_elements_not_found: "<?= __('menu_elements_not_found') ?>"
    };
</script>
<script src="/JS/detalle.js"></script>
<script src="/JS/header.js"></script>

</body>
</html>