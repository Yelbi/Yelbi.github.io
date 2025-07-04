<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/index.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('site_title') ?></title>
</head>
<body>
    <!-- Header con selector de idioma -->
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

    <div class="container" id="container">
        <!-- Sección 1 -->
        <section class="section section1 active" id="section1">
            <canvas id="starfield"></canvas>
            <div class="section-content">
                <p style="margin: 0;"><?= __('welcome') ?></p>
                <h1>Seres</h1>
                <p><?= __('welcome_sub') ?></p>
                <a href="/galeria.php" class="btn"><?= __('explore') ?></a>
            </div>
        </section>
        
        <!-- Sección 2 -->
        <section class="section section2" id="section2">
            <a-hole-section2>
                <canvas class="js-canvas"></canvas>
            </a-hole-section2>
            <div class="section-content">
                <a href="/random_ser.php" class="btn random-btn">
                    <i class="fi fi-rr-shuffle"></i> <?= __('discover_random') ?>
                </a>
                <div class="survey-section">
                    <button class="survey-trigger" id="surveyTrigger">
                        <i class="fi fi-rr-form"></i> <?= __('quick_survey') ?>
                    </button>
            </div>

    <!-- Modal de encuesta -->
    <div class="survey-modal" id="surveyModal">
        <div class="survey-content">
            <button class="survey-close" id="surveyClose">×</button>
            
            <div class="survey-header">
                <h2 class="survey-title">¿Qué tipo de ser te interesa más?</h2>
                <p class="survey-subtitle">Ayúdanos a conocer tus preferencias</p>
            </div>

            <form class="survey-form" id="surveyForm">
                <!-- Pregunta 1 -->
                <div class="survey-question visible" data-question="1">
                    <h3 class="question-title">¿Qué tipo de mitología prefieres?</h3>
                    <div class="question-options">
                        <div class="option-item" data-value="nordica">
                            <input type="radio" name="q1" value="nordica" id="q1_nordica">
                            <label for="q1_nordica">Mitología Nórdica</label>
                        </div>
                        <div class="option-item" data-value="griega">
                            <input type="radio" name="q1" value="griega" id="q1_griega">
                            <label for="q1_griega">Mitología Griega</label>
                        </div>
                        <div class="option-item" data-value="egipcia">
                            <input type="radio" name="q1" value="egipcia" id="q1_egipcia">
                            <label for="q1_egipcia">Mitología Egipcia</label>
                        </div>
                        <div class="option-item" data-value="japonesa">
                            <input type="radio" name="q1" value="japonesa" id="q1_japonesa">
                            <label for="q1_japonesa">Mitología Japonesa</label>
                        </div>
                    </div>
                </div>

                <!-- Pregunta 2 -->
                <div class="survey-question" data-question="2">
                    <h3 class="question-title">¿Qué características te atraen más?</h3>
                    <div class="question-options">
                        <div class="option-item" data-value="poder">
                            <input type="radio" name="q2" value="poder" id="q2_poder">
                            <label for="q2_poder">Poder y Fuerza</label>
                        </div>
                        <div class="option-item" data-value="misterio">
                            <input type="radio" name="q2" value="misterio" id="q2_misterio">
                            <label for="q2_misterio">Misterio y Magia</label>
                        </div>
                        <div class="option-item" data-value="sabiduria">
                            <input type="radio" name="q2" value="sabiduria" id="q2_sabiduria">
                            <label for="q2_sabiduria">Sabiduría y Conocimiento</label>
                        </div>
                        <div class="option-item" data-value="naturaleza">
                            <input type="radio" name="q2" value="naturaleza" id="q2_naturaleza">
                            <label for="q2_naturaleza">Conexión con la Naturaleza</label>
                        </div>
                    </div>
                </div>

                <!-- Pregunta 3 -->
                <div class="survey-question" data-question="3">
                    <h3 class="question-title">¿Qué tipo de historia prefieres?</h3>
                    <div class="question-options">
                        <div class="option-item" data-value="epica">
                            <input type="radio" name="q3" value="epica" id="q3_epica">
                            <label for="q3_epica">Épicas de Héroes</label>
                        </div>
                        <div class="option-item" data-value="romance">
                            <input type="radio" name="q3" value="romance" id="q3_romance">
                            <label for="q3_romance">Romances Divinos</label>
                        </div>
                        <div class="option-item" data-value="tragedia">
                            <input type="radio" name="q3" value="tragedia" id="q3_tragedia">
                            <label for="q3_tragedia">Tragedias y Castigos</label>
                        </div>
                        <div class="option-item" data-value="aventura">
                            <input type="radio" name="q3" value="aventura" id="q3_aventura">
                            <label for="q3_aventura">Aventuras y Transformaciones</label>
                        </div>
                    </div>
                </div>
            </form>

            <div class="survey-navigation">
                <button type="button" class="survey-btn" id="surveyPrev" disabled>Anterior</button>
                <div class="survey-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">1 de 3</div>
                </div>
                <button type="button" class="survey-btn" id="surveyNext" disabled>Siguiente</button>
            </div>

            <!-- Pantalla de completado -->
            <div class="survey-completion" id="surveyCompletion">
                <div class="completion-icon">✨</div>
                <h3 class="completion-title">¡Gracias por tu participación!</h3>
                <p class="completion-message">Tus respuestas nos ayudan a mejorar tu experiencia</p>
                <button type="button" class="survey-btn" id="surveyComplete">Explorar Recomendaciones</button>
            </div>
        </div>
    </div>
        </section>

        <!-- Sección 3 -->
        <section class="section section3" id="section3">
            <canvas id="infinity-canvas"></canvas>
            <div class="section-content">
                <h1><?= __('contact') ?></h1>
                <p><?= __('contact_sub') ?></p>
                <a href="/iniciar.php" class="btn"><?= __('here') ?></a>
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
            <div><?= __('swipe_to_explore') ?></div>
            <span class="scroll-arrow">↓</span>
        </div>

        <script src="/JS/header.js"></script>
        <script src="/JS/index.js"></script>
        <script src="/JS/survey.js"></script>
        <script src="/JS/backspace.js"></script>
        <script type="module" src="/JS/backhole.js"></script>
        <script src="/JS/infinity.js"></script>
        <script src="/JS/language.js"></script>
    </div>
</body>
</html>