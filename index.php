<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/index.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title>Seres</title>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="Logo de Seres">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="#" class="nav-link">Contacto</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <div class="container" id="container">
        <!-- Sección 1 -->
<section class="section section1 active" id="section1">
    <canvas id="starfield"></canvas>
    <div class="section-content">
        <p style="margin: 0;">Bienvenido a</p>
        <h1>Seres</h1>
        <p>Explora dioses, criaturas y héroes de culturas ancestrales. ¡Tu viaje al mundo sagrado comienza aquí!</p>
        <a href="/galeria.php" class="btn">Explorar</a>
    </div>
</section>
        
        <!-- Sección 2 -->
<section class="section section2" id="section2">
    <a-hole-section2>
        <canvas class="js-canvas"></canvas>
    </a-hole-section2>
    <div class="section-content">
        <!-- Botón para ser aleatorio -->
        <a href="/random_ser.php" class="btn random-btn">
            <i class="fi fi-rr-shuffle"></i> Descubrir un ser al azar
        </a>
    </div>
</section>

        <!-- Sección 3 -->
<section class="section section3" id="section3">
    <canvas id="infinity-canvas"></canvas>
    <div class="section-content">
        <h1>Contactar</h1>
        <p>Para quejas y sugerencias dirígete a tu perfil y escríbeme.</p>
        <a href="/iniciar.php" class="btn">Aqui</a>
    </div>
</section>

    <!-- Navegación por puntos -->
    <div class="nav-dots">
        <div class="nav-dot active" data-section="0"></div>
        <div class="nav-dot" data-section="1"></div>
        <div class="nav-dot" data-section="2"></div>
    </div>

    <!-- Indicador de scroll -->
    <div class="scroll-indicator" id="scrollIndicator">
        <div>Desliza para explorar</div>
        <span class="scroll-arrow">↓</span>
    </div>

    <script src="/JS/header.js"></script>
    <script src="/JS/index.js"></script>
    <script src="/JS/backspace.js"></script>
    <script type="module" src="/JS/backhole.js"></script>
    <script src="/JS/infinity.js"></script>
</body>
</html>