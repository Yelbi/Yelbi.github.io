<?php
// detalle.php
require 'config.php';

// Obtener el slug del ser
$slug = $_GET['ser'] ?? '';

if (empty($slug)) {
    header('Location: /Seres/galeria.php');
    exit;
}

try {
    // Obtener información básica del ser
    $stmt = $pdo->prepare("SELECT * FROM seres WHERE slug = ?");
    $stmt->execute([$slug]);
    $ser = $stmt->fetch();
    
    if (!$ser) {
        header('Location: /Seres/galeria.php');
        exit;
    }
    
    // Obtener información detallada
    $stmt = $pdo->prepare("SELECT * FROM seres_detalle WHERE ser_id = ?");
    $stmt->execute([$ser['id']]);
    $detalle = $stmt->fetch();
    
    // Obtener imágenes adicionales
    $stmt = $pdo->prepare("SELECT * FROM seres_imagenes WHERE ser_id = ? ORDER BY es_principal DESC, orden ASC");
    $stmt->execute([$ser['id']]);
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
    <title><?= htmlspecialchars($ser['nombre']) ?> - Seres Místicos</title>
    <link rel="stylesheet" href="/Seres/styles/detalle.css">
    <link rel="stylesheet" href="/Seres/styles/header.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="shortcut icon" href="/Seres/Img/logo.png" />
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="Información completa sobre <?= htmlspecialchars($ser['nombre']) ?>, <?= htmlspecialchars($ser['tipo']) ?> de <?= htmlspecialchars($ser['region']) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($ser['nombre']) ?> - Seres Místicos">
    <meta property="og:description" content="Descubre todo sobre <?= htmlspecialchars($ser['nombre']) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($ser['imagen']) ?>">
</head>
<body>

    <!-- Header -->
    <header class="header">
        <a href="/Seres/index.php" class="logo">
            <img src="/Seres/Img/logo.png" alt="">
        </a>
        <nav class="nav-menu">
            <a href="/Seres/index.php" class="nav-link">Inicio</a>
            <a href="/Seres/galeria.php" class="nav-link">Galería</a>
            <a href="#" class="nav-link">Contacto</a>
        </nav>
        <a href="#" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <!-- Breadcrumb -->
    <nav class="breadcrumb">
        <a href="/Seres/index.php">Inicio</a>
        <span class="separator">></span>
        <a href="/Seres/galeria.php">Galería</a>
        <span class="separator">></span>
        <span class="current"><?= htmlspecialchars($ser['nombre']) ?></span>
    </nav>

    <main class="detail-container">
        <!-- Sección principal con imagen y información básica -->
        <section class="hero-section">
            <div class="hero-content">
                <div class="hero-image">
                    <img src="<?= htmlspecialchars($ser['imagen']) ?>" 
                         alt="<?= htmlspecialchars($ser['nombre']) ?>"
                         class="main-image">
                    <div class="image-overlay"></div>
                </div>
                
                <div class="hero-info">
                    <h1 class="ser-title"><?= htmlspecialchars($ser['nombre']) ?></h1>
                    
                    <div class="basic-info">
                        <div class="info-item">
                            <span class="label">Tipo:</span>
                            <span class="value tipo"><?= htmlspecialchars($ser['tipo']) ?></span>
                        </div>
                        <div class="info-item">
                            <span class="label">Región:</span>
                            <span class="value region"><?= htmlspecialchars($ser['region']) ?></span>
                        </div>
                        <?php if ($detalle): ?>
                            <?php if (!empty($detalle['peligrosidad'])): ?>
                                <div class="info-item">
                                    <span class="label">Peligrosidad:</span>
                                    <span class="value peligrosidad peligrosidad-<?= strtolower($detalle['peligrosidad']) ?>">
                                        <?= htmlspecialchars($detalle['peligrosidad']) ?>
                                    </span>
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($detalle['rareza'])): ?>
                                <div class="info-item">
                                    <span class="label">Rareza:</span>
                                    <span class="value rareza rareza-<?= strtolower(str_replace(' ', '-', $detalle['rareza'])) ?>">
                                        <?= htmlspecialchars($detalle['rareza']) ?>
                                    </span>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </section>

        <?php if ($detalle): ?>
            <!-- Contenido detallado -->
            <section class="content-section">
                <div class="content-grid">
                    
                    <!-- Descripción principal -->
                    <?php if (!empty($detalle['descripcion'])): ?>
                        <div class="content-card description-card">
                            <h2 class="section-title">Descripción</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['descripcion'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Historia -->
                    <?php if (!empty($detalle['historia'])): ?>
                        <div class="content-card history-card">
                            <h2 class="section-title">Historia y Origen</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['historia'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Características -->
                    <?php if (!empty($detalle['caracteristicas'])): ?>
                        <div class="content-card characteristics-card">
                            <h2 class="section-title">Características</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['caracteristicas'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Poderes -->
                    <?php if (!empty($detalle['poderes'])): ?>
                        <div class="content-card powers-card">
                            <h2 class="section-title">Poderes y Habilidades</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['poderes'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Debilidades -->
                    <?php if (!empty($detalle['debilidades'])): ?>
                        <div class="content-card weaknesses-card">
                            <h2 class="section-title">Debilidades</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['debilidades'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Leyendas -->
                    <?php if (!empty($detalle['leyendas'])): ?>
                        <div class="content-card legends-card">
                            <h2 class="section-title">Leyendas y Mitos</h2>
                            <div class="content-text">
                                <?= nl2br(htmlspecialchars($detalle['leyendas'])) ?>
                            </div>
                        </div>
                    <?php endif; ?>

                </div>
            </section>
        <?php endif; ?>

        <!-- Galería de imágenes adicionales -->
        <?php if (!empty($imagenes) && count($imagenes) > 1): ?>
            <section class="gallery-section">
                <h2 class="section-title">Galería de Imágenes</h2>
                <div class="image-gallery">
                    <?php foreach ($imagenes as $imagen): ?>
                        <div class="gallery-item">
                            <img src="<?= htmlspecialchars($imagen['imagen_url']) ?>" 
                                 alt="<?= htmlspecialchars($imagen['descripcion'] ?: $ser['nombre']) ?>"
                                 loading="lazy"
                                 onclick="openModal(this)">
                            <?php if (!empty($imagen['descripcion'])): ?>
                                <div class="image-description">
                                    <?= htmlspecialchars($imagen['descripcion']) ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
        <?php endif; ?>

        <!-- Navegación entre seres -->
        <section class="navigation-section">
            <div class="nav-buttons">
                <a href="/Seres/galeria.php" class="btn-back">
                    <i class="fi fi-rr-arrow-left"></i>
                    Volver a la Galería
                </a>
                
                <?php
                // Obtener ser anterior y siguiente
                $stmt = $pdo->prepare("SELECT slug, nombre FROM seres WHERE id < ? ORDER BY id DESC LIMIT 1");
                $stmt->execute([$ser['id']]);
                $anterior = $stmt->fetch();
                
                $stmt = $pdo->prepare("SELECT slug, nombre FROM seres WHERE id > ? ORDER BY id ASC LIMIT 1");
                $stmt->execute([$ser['id']]);
                $siguiente = $stmt->fetch();
                ?>
                
                <div class="nav-arrows">
                    <?php if ($anterior): ?>
                        <a href="/Seres/detalle.php?ser=<?= urlencode($anterior['slug']) ?>" class="btn-nav prev">
                            <i class="fi fi-rr-arrow-left"></i>
                            <span><?= htmlspecialchars($anterior['nombre']) ?></span>
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($siguiente): ?>
                        <a href="/Seres/detalle.php?ser=<?= urlencode($siguiente['slug']) ?>" class="btn-nav next">
                            <span><?= htmlspecialchars($siguiente['nombre']) ?></span>
                            <i class="fi fi-rr-arrow-right"></i>
                        </a>
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

    <script src="/Seres/JS/detalle.js"></script>

</body>
</html>