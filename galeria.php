<?php
// galeria.php
require 'config.php';

// Orden alfabético por nombre
$stmt = $pdo->query("SELECT * FROM seres ORDER BY nombre ASC");
$seres = $stmt->fetchAll();
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

  <main class="grid-container">
        <?php foreach ($seres as $index => $s): ?>
            <a href="/detalle.php?ser=<?= urlencode($s['slug']) ?>" class="card">
    <img src="<?= htmlspecialchars($s['imagen']) ?>" alt="<?= htmlspecialchars($s['nombre']) ?>" loading="lazy">
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

  <script src="/JS/galeria.js"></script>

</body>
</html>