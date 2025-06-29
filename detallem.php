<?php
// detallem.php
require 'config/connection.php';

$slug = $_GET['mito'] ?? '';

if (empty($slug)) {
    header('Location: /mitos.php');
    exit;
}

try {
    // Obtener información básica del mito
    $stmt = $pdo->prepare("SELECT * FROM mitos WHERE slug = ?");
    $stmt->execute([$slug]);
    $mito = $stmt->fetch();

    if (!$mito) {
        header('Location: /mitos.php');
        exit;
    }
    
    // Obtener información detallada
    $stmt = $pdo->prepare("SELECT * FROM mitos_detalle WHERE mito_id = ?");
    $stmt->execute([$mito['id']]);
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
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($mito['nombre']) ?> - Seres</title>
    <link rel="stylesheet" href="/styles/detallem.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="Información completa sobre <?= htmlspecialchars($mito['nombre']) ?>, <?= htmlspecialchars($mito['pais']) ?> de <?= htmlspecialchars($mito['region']) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($mito['nombre']) ?> - Seres">
    <meta property="og:description" content="Descubre todo sobre <?= htmlspecialchars($mito['nombre']) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($mito['imagen']) ?>">
</head>
<body>

<!-- Header -->
<header class="header">
    <a href="/index.php" class="logo">
        <img src="/Img/logo.png" alt="">
    </a>
    <nav class="nav-menu">
        <a href="/index.php" class="nav-link">Inicio</a>
        <a href="/galeria.php" class="nav-link">Galería</a>
        <a href="/mitos.php" class="nav-link">Mitologías</a>
    </nav>
    <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
</header>

<main class="detail-container">
    <!-- Sección Hero con retrato -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-info">
                <h1 class="mito-title"><?= htmlspecialchars($mito['nombre']) ?></h1>
                <div class="basic-info">
                    <div class="info-item">
                        <span class="value pais"><?= htmlspecialchars($mito['pais']) ?></span>
                    </div>
                    <div class="info-item">
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
                <h2 class="section-title">Descripción</h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['descripcion'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['origen'])): ?>
            <div class="content-card characteristics-card">
                <div class="characteristics-grid <?= empty($detallem['origen_img']) ? 'single-column' : '' ?>">
                    <div class="characteristics-text">
                        <h2 class="section-title">Origen</h2>
                        <div class="content-text"><?= nl2br(htmlspecialchars($detallem['origen'])) ?></div>
                    </div>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['historia'])): ?>
            <div class="content-card history-card">
                <h2 class="section-title">Historia</h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['historia'])) ?></div>
            </div>
            <?php endif; ?>

            <?php if (!empty($detallem['seres_principales'])): ?>
            <div class="content-card etymology-card">
                <h2 class="section-title">Seres Principaless</h2>
                <div class="content-text"><?= nl2br(htmlspecialchars($detallem['seres_principales'])) ?></div>
            </div>
            <?php endif; ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- Galería de imágenes estilo Pinterest -->
    <?php if (!empty($imagenes)): ?>
    <section class="gallery-section">
        <h2 class="section-title">Galería de Imágenes</h2>
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
            <a href="/mitos.php" class="btn-back">Volver a la Galería</a>
            <?php
            $prev = $pdo->prepare("SELECT slug, nombre FROM mitos WHERE id < ? ORDER BY id DESC LIMIT 1");
            $prev->execute([$mito['id']]);
            $prevItem = $prev->fetch();
            $next = $pdo->prepare("SELECT slug, nombre FROM mitos WHERE id > ? ORDER BY id ASC LIMIT 1");
            $next->execute([$mito['id']]);
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