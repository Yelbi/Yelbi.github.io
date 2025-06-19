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

  <header>
    <h1>Galería de Seres</h1>
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
