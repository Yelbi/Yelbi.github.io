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
  <link rel="stylesheet" href="/Seres/styles/galeria.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

  <!-- Header -->
  <header class="header">
    <a href="/Seres/index.php" class="logo">SERES</a>
    <nav class="nav-menu">
      <a href="/Seres/index.php" class="nav-link">Inicio</a>
      <a href="/Seres/galeria.php" class="nav-link">Galería</a>
      <a href="#" class="nav-link">Contacto</a>
    </nav>
    <a href="#" class="user-btn">Usuarios</a>
  </header>

  <main class="grid-container">
    <?php foreach ($seres as $index => $s): ?>
      <div class="card" style="animation-delay: <?= $index * 0.1 ?>s">
        <img src="<?= htmlspecialchars($s['imagen']) ?>"
             alt="<?= htmlspecialchars($s['nombre']) ?>"
             loading="lazy">
        
        <!-- Información superpuesta -->
        <div class="card-info">
          <div class="nombre"><?= htmlspecialchars($s['nombre']) ?></div>
          <div class="info-badges">
            <span class="badge tipo"><?= htmlspecialchars($s['tipo']) ?></span>
            <span class="badge region"><?= htmlspecialchars($s['region']) ?></span>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </main>

  <script src="/Seres/JS/galeria.js"></script>

</body>
</html>