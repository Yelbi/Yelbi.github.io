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
  <title>Galería de Seres</title>
  <link rel="stylesheet" href="/Seres/styles/galeria.css">
</head>
<body>

  <!-- Header -->
    <header class="header">
        <a href="#" class="logo">SERES</a>
        <nav class="nav-menu">
            <a href="/Seres/index.php" class="nav-link">Inicio</a>
            <a href="/Seres/galeria.php" class="nav-link">Galeria</a>
            <a href="#" class="nav-link">Contacto</a>
        </nav>
        <a href="#" class="user-btn">Usuarios</a>
    </header>

  <main class="grid-container">
    <?php foreach ($seres as $s): ?>
      <div class="card">
        <div class="card-image">
          <img src="<?= htmlspecialchars($s['imagen']) ?>"
               alt="<?= htmlspecialchars($s['nombre']) ?>">
        </div>
        <div class="card-info">
          <div class="nombre"><?= htmlspecialchars($s['nombre']) ?></div>
          <div class="bottom-row">
            <span class="tipo"><?= htmlspecialchars($s['tipo']) ?></span>
            <span class="region"><?= htmlspecialchars($s['region']) ?></span>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </main>

</body>
</html>
