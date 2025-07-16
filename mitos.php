<?php
require 'config/connection.php';
require 'config/i18n.php';

$lang = $current_lang; // Idioma actual desde i18n.php

try {
    // Obtener todos los mitos con traducción
    $stmt = $pdo->prepare("
        SELECT s.id, s.slug, s.imagen, st.nombre, st.pais, st.region 
        FROM mitos s
        JOIN mitos_translations st ON s.id = st.mito_id
        WHERE st.language_code = ?
        ORDER BY st.nombre ASC
    ");
    $stmt->execute([$lang]);
    $mitos = $stmt->fetchAll();

    // Obtener paises únicos (traducidos)
    $stmt_paises = $pdo->prepare("
        SELECT DISTINCT st.pais 
        FROM mitos_translations st
        WHERE st.language_code = ?
        ORDER BY st.pais ASC
    ");
    $stmt_paises->execute([$lang]);
    $paises = $stmt_paises->fetchAll(PDO::FETCH_COLUMN);

    // Obtener regiones únicas (traducidas)
    $stmt_regiones = $pdo->prepare("
        SELECT DISTINCT st.region 
        FROM mitos_translations st
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
  <title><?= __('Myths') ?> - <?= __('site_title') ?></title>
  <link rel="stylesheet" href="/styles/mitos.css">
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
            <a href="/mitos.php" class="nav-link"><?= __('myths') ?></a>
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

  <!-- Panel de Filtros -->
  <section class="filter-panel collapsed">
    <div class="filter-container">
      <!-- Header siempre visible -->
      <div class="filter-header">
        <h2 class="filter-title">
          <i class="fi fi-rr-filter"></i>
          <?= __('filter_title') ?>
        </h2>
        
        <div class="search-and-toggle">
          <!-- Barra de búsqueda (siempre visible) -->
          <div class="search-wrapper">
            <input type="text" id="searchInput" placeholder="<?= __('search_placeholder') ?>" class="search-input">
            <i class="fi fi-rr-search search-icon"></i>
          </div>

          <!-- Botón para mostrar/ocultar filtros -->
          <button id="toggleFilters" class="btn-toggle">
            <?= __('show_filters') ?>
            <i class="fi fi-rr-angle-down"></i>
          </button>
        </div>
      </div>
      
      <!-- Contenido colapsable -->
      <div class="filter-content">
        <div class="filter-groups">
          <!-- Filtro por pais -->
          <div class="filter-group">
            <label class="filter-label"><?= __('country') ?>:</label>
            <select id="paisFilter" class="filter-select">
              <option value=""><?= __('all_countries') ?></option>
              <?php foreach ($paises as $pais): ?>
                <option value="<?= htmlspecialchars($pais) ?>"><?= htmlspecialchars($pais) ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Filtro por Región -->
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

        <!-- Botones de acción -->
        <div class="filter-actions">
          <button id="clearFilters" class="btn-clear">
            <i class="fi fi-rr-refresh"></i>
            <?= __('clear_filters') ?>
          </button>
        </div>
      </div>
    </div>

    <!-- Contador de resultados -->
    <div class="results-counter">
      <span id="resultsCount"><?= count($mitos) ?></span> <?= __('Myths_found') ?>
    </div>
  </section>

  <!-- Grid de la galería -->
  <main class="grid-container" id="mitosGrid">
    <?php foreach ($mitos as $index => $s): ?>
      <a href="/detallem.php?mito=<?= urlencode($s['slug']) ?>" 
         class="card" 
         data-pais="<?= htmlspecialchars($s['pais']) ?>" 
         data-region="<?= htmlspecialchars($s['region']) ?>"
         data-nombre="<?= strtolower(htmlspecialchars($s['nombre'])) ?>">
        <img src="<?= htmlspecialchars($s['imagen']) ?>" 
             alt="<?= htmlspecialchars($s['nombre']) ?>" 
             loading="lazy">
        <div class="card-info">
          <div class="nombre"><?= htmlspecialchars($s['nombre']) ?></div>
<div class="info-badges">
  <button class="badge pais" 
          data-filter="pais" 
          data-value="<?= htmlspecialchars($s['pais']) ?>">
    <?= htmlspecialchars($s['pais']) ?>
  </button>
  <button class="badge region" 
          data-filter="region" 
          data-value="<?= htmlspecialchars($s['region']) ?>">
    <?= htmlspecialchars($s['region']) ?>
  </button>
</div>
        </div>
      </a>
    <?php endforeach; ?>
  </main>

  <!-- Mensaje cuando no hay resultados -->
  <div class="no-results" id="noResults" style="display: none;">
    <div class="no-results-content">
      <i class="fi fi-rr-search-alt"></i>
      <h3><?= __('no_results') ?></h3>
      <p><?= __('adjust_filters') ?></p>
    </div>
  </div>

  <script src="/JS/mitos.js"></script>
  <script src="/JS/header.js"></script>

</body>
</html>