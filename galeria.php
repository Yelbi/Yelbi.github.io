<?php
// galeria.php - Con sistema de filtros
require 'config.php';

// Obtener todos los seres
$stmt = $pdo->query("SELECT * FROM seres ORDER BY nombre ASC");
$seres = $stmt->fetchAll();

// Obtener tipos únicos (dinámicamente desde la base de datos)
$stmt_tipos = $pdo->query("SELECT DISTINCT tipo FROM seres WHERE tipo IS NOT NULL AND tipo != '' ORDER BY tipo ASC");
$tipos = $stmt_tipos->fetchAll(PDO::FETCH_COLUMN);

// Obtener regiones únicas (dinámicamente desde la base de datos)
$stmt_regiones = $pdo->query("SELECT DISTINCT region FROM seres WHERE region IS NOT NULL AND region != '' ORDER BY region ASC");
$regiones = $stmt_regiones->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería de Seres Místicos</title>
  <link rel="stylesheet" href="/styles/galeria.css">
  <link rel="stylesheet" href="/styles/header.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="shortcut icon" href="/Img/logo.png" />
  <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

  <!-- Header -->
  <header class="header">
    <a href="/index.php" class="logo">
      <img src="/Img/logo.png" alt="">
    </a>
    <nav class="nav-menu">
      <a href="/index.php" class="nav-link">Inicio</a>
      <a href="/galeria.php" class="nav-link">Galeria</a>
      <a href="#" class="nav-link">Contacto</a>
    </nav>
    <a href="#" class="user-btn"><i class="fi fi-rr-user"></i></a>
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
            <i class="fi fi-rr-angle-down"></i>
            Mostrar Filtros
          </button>
        </div>
      </div>
      
      <!-- Contenido colapsable -->
      <div class="filter-content">
        <div class="filter-groups">
          <!-- Filtro por Tipo -->
          <div class="filter-group">
            <label class="filter-label">Tipo:</label>
            <select id="tipoFilter" class="filter-select">
              <option value="">Todos los tipos</option>
              <?php foreach ($tipos as $tipo): ?>
                <option value="<?= htmlspecialchars($tipo) ?>"><?= htmlspecialchars($tipo) ?></option>
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
      <span id="resultsCount"><?= count($seres) ?></span> seres encontrados
    </div>
  </section>

  <!-- Grid de la galería -->
  <main class="grid-container" id="galeriaGrid">
    <?php foreach ($seres as $index => $s): ?>
      <a href="/detalle.php?ser=<?= urlencode($s['slug']) ?>" 
         class="card" 
         data-tipo="<?= htmlspecialchars($s['tipo']) ?>" 
         data-region="<?= htmlspecialchars($s['region']) ?>"
         data-nombre="<?= strtolower(htmlspecialchars($s['nombre'])) ?>">
        <img src="<?= htmlspecialchars($s['imagen']) ?>" 
             alt="<?= htmlspecialchars($s['nombre']) ?>" 
             loading="lazy">
        <div class="card-info">
          <div class="nombre"><?= htmlspecialchars($s['nombre']) ?></div>
          <div class="info-badges">
            <span class="badge tipo"><?= htmlspecialchars($s['tipo']) ?></span>
            <span class="badge region"><?= htmlspecialchars($s['region']) ?></span>
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

  <script src="/JS/galeria.js"></script>

</body>
</html>