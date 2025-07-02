<?php
require 'config/connection.php';
require 'config/i18n.php';

$lang = $current_lang; // Idioma actual desde i18n.php

try {
    // Obtener todos los seres con traducción
    $stmt = $pdo->prepare("
        SELECT s.id, s.slug, s.imagen, st.nombre, st.tipo, st.region 
        FROM seres s
        JOIN seres_translations st ON s.id = st.ser_id
        WHERE st.language_code = ?
        ORDER BY st.nombre ASC
    ");
    $stmt->execute([$lang]);
    $seres = $stmt->fetchAll();

    // Obtener tipos únicos (traducidos)
    $stmt_tipos = $pdo->prepare("
        SELECT DISTINCT st.tipo 
        FROM seres_translations st
        WHERE st.language_code = ?
        ORDER BY st.tipo ASC
    ");
    $stmt_tipos->execute([$lang]);
    $tipos = $stmt_tipos->fetchAll(PDO::FETCH_COLUMN);

    // Obtener regiones únicas (traducidas)
    $stmt_regiones = $pdo->prepare("
        SELECT DISTINCT st.region 
        FROM seres_translations st
        WHERE st.language_code = ?
        ORDER BY st.region ASC
    ");
    $stmt_regiones->execute([$lang]);
    $regiones = $stmt_regiones->fetchAll(PDO::FETCH_COLUMN);

} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= __('gallery') ?> - <?= __('site_title') ?></title>
  <link rel="stylesheet" href="/styles/galeria.css">
  <link rel="stylesheet" href="/styles/header.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
  <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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

<!-- Panel de Filtros -->
<section class="filter-panel collapsed">
    <div class="filter-container">
      <div class="filter-header">
        <h2 class="filter-title">
          <i class="fi fi-rr-filter"></i>
          <?= __('filter_title') ?>
        </h2>
        
        <div class="search-and-toggle">
          <div class="search-wrapper">
            <input type="text" id="searchInput" placeholder="<?= __('search_placeholder') ?>" class="search-input">
            <i class="fi fi-rr-search search-icon"></i>
          </div>

          <button id="toggleFilters" class="btn-toggle">
            <?= __('show_filters') ?>
            <i class="fi fi-rr-angle-down"></i>
          </button>
        </div>
      </div>
      
      <div class="filter-content">
        <div class="filter-groups">
          <div class="filter-group">
            <label class="filter-label"><?= __('type') ?>:</label>
            <select id="tipoFilter" class="filter-select">
              <option value=""><?= __('all_types') ?></option>
              <?php foreach ($tipos as $tipo): ?>
                <option value="<?= htmlspecialchars($tipo) ?>"><?= htmlspecialchars($tipo) ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label"><?= __('region') ?>:</label>
            <select id="regionFilter" class="filter-select">
              <option value=""><?= __('all_regions') ?></option>
              <?php foreach ($regiones as $region): ?>
                <option value="<?= htmlspecialchars($region) ?>"><?= htmlspecialchars($region) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <button id="clearFilters" class="btn-clear">
            <i class="fi fi-rr-refresh"></i>
            <?= __('clear_filters') ?>
          </button>
        </div>
      </div>
    </div>

    <div class="results-counter">
      <span id="resultsCount"><?= count($seres) ?></span> <?= __('beings_found') ?>
    </div>
</section>

<main class="grid-container" id="galeriaGrid">
    <?php foreach ($seres as $index => $s): ?>
      <a href="/detalle.php?ser=<?= urlencode($s['slug']) ?>" 
         class="card <?= $index < 4 ? 'image-loaded' : '' ?>" 
         data-tipo="<?= htmlspecialchars($s['tipo']) ?>" 
         data-region="<?= htmlspecialchars($s['region']) ?>"
         data-nombre="<?= strtolower(htmlspecialchars($s['nombre'])) ?>">
        <img src="<?= htmlspecialchars($s['imagen']) ?>" 
             alt="<?= htmlspecialchars($s['nombre']) ?>" 
             loading="lazy"
             <?= $index < 4 ? 'class="loaded"' : '' ?>>
        <div class="card-info">
          <div class="nombre"><?= htmlspecialchars($s['nombre']) ?></div>
          <div class="info-badges">
            <button class="badge tipo" 
                    data-filter="tipo" 
                    data-value="<?= htmlspecialchars($s['tipo']) ?>">
              <?= htmlspecialchars($s['tipo']) ?>
            </button>
            <button class="badge region" 
                    data-filter="region" 
                    data-value="<?= htmlspecialchars($s['region']) ?>">
              <?= htmlspecialchars($s['region']) ?>
            </button>
          </div>
        </div>
        <!-- Botón de favoritos actualizado -->
        <button class="favorite-btn" 
                data-ser-id="<?= $s['id'] ?>" 
                aria-label="Agregar a favoritos">
            <i class="fi fi-rr-heart"></i>
        </button>
      </a>
    <?php endforeach; ?>
</main>

<div class="no-results" id="noResults" style="display: none;">
    <div class="no-results-content">
      <i class="fi fi-rr-search-alt"></i>
      <h3><?= __('no_results') ?></h3>
      <p><?= __('adjust_filters') ?></p>
    </div>
</div>

<script>
// Pasamos traducciones a JavaScript
const translations = {
    show_filters: "<?= __('show_filters') ?>",
    hide_filters: "<?= __('hide_filters') ?>",
    beings_found: "<?= __('beings_found') ?>"
};
</script>

<script src="/JS/galeria.js"></script>
<script src="/JS/header.js"></script>

</body>
</html>