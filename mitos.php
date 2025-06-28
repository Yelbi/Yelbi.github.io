<?php
// galeria.php - Con sistema de filtros
require 'config/connection.php';

// Obtener todos los mitos
$stmt = $pdo->query("SELECT * FROM mitos ORDER BY nombre ASC");
$mitos = $stmt->fetchAll();

// Obtener paises únicos (dinámicamente desde la base de datos)
$stmt_paises = $pdo->query("SELECT DISTINCT pais FROM mitos WHERE pais IS NOT NULL AND pais != '' ORDER BY pais ASC");
$paises = $stmt_paises->fetchAll(PDO::FETCH_COLUMN);

// Optimización para móvil: limitar campos innecesarios
// Detectar si es móvil (fallback si $device no está definido)
$isMobile = false;
if (isset($device) && is_object($device) && property_exists($device, 'isMobile')) {
    $isMobile = $device->isMobile;
} elseif (preg_match('/Mobile|Android|iPhone|iPad|iPod/i', $_SERVER['HTTP_USER_AGENT'])) {
    $isMobile = true;
}
$fields = $isMobile ? 'id, nombre, slug, imagen, pais, region' : '*';
$stmt = $pdo->query("SELECT $fields FROM mitos ORDER BY nombre ASC");
$mitos = $stmt->fetchAll();

// Obtener regiones únicas (dinámicamente desde la base de datos)
$stmt_regiones = $pdo->query("SELECT DISTINCT region FROM mitos WHERE region IS NOT NULL AND region != '' ORDER BY region ASC");
$regiones = $stmt_regiones->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mitologías</title>
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
            <img src="/Img/logo.png" alt="Logo de seres">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="/mitos.php" class="nav-link">Mitologías</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

  <!-- Panel de Filtros -->
  <section class="filter-panel collapsed">
    <div class="filter-container">
      <!-- Header siempre visible -->
      <div class="filter-header">
        <h2 class="filter-title">
          <i class="fi fi-rr-filter"></i>
          Filtros
        </h2>
        
        <div class="search-and-toggle">
          <!-- Barra de búsqueda (siempre visible) -->
          <div class="search-wrapper">
            <input type="text" id="searchInput" placeholder="Buscar por nombre..." class="search-input">
            <i class="fi fi-rr-search search-icon"></i>
          </div>

          <!-- Botón para mostrar/ocultar filtros -->
          <button id="toggleFilters" class="btn-toggle">
            Mostrar Filtros
            <i class="fi fi-rr-angle-down"></i>
          </button>
        </div>
      </div>
      
      <!-- Contenido colapsable -->
      <div class="filter-content">
        <div class="filter-groups">
          <!-- Filtro por pais -->
          <div class="filter-group">
            <label class="filter-label">Pais:</label>
            <select id="paisFilter" class="filter-select">
              <option value="">Todos los paises</option>
              <?php foreach ($paises as $pais): ?>
                <option value="<?= htmlspecialchars($pais) ?>"><?= htmlspecialchars($pais) ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Filtro por Región -->
          <div class="filter-group">
            <label class="filter-label">Región:</label>
            <select id="regionFilter" class="filter-select">
              <option value="">Todas las regiones</option>
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
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Contador de resultados -->
    <div class="results-counter">
      <span id="resultsCount"><?= count($mitos) ?></span> Mitos encontrados
    </div>
  </section>

  <!-- Grid de la galería -->
  <main class="grid-container" id="galeriaGrid">
    <?php foreach ($mitos as $index => $s): ?>
      <a href="/detalle.php?ser=<?= urlencode($s['slug']) ?>" 
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
      <h3>No se encontraron resultados</h3>
      <p>Intenta ajustar los filtros o términos de búsqueda</p>
    </div>
  </div>

  <script src="/JS/mitos.js"></script>
  <script src="/JS/header.js"></script>

</body>
</html>