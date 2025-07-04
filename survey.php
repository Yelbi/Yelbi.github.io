<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/survey.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('quick_survey') ?> - <?= __('site_title') ?></title>
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
            <div class="user-btn" id="unifiedButton">
                <i class="fi fi-rr-user"></i>
            </div>
            <div class="profile-icon" id="profileIcon" style="display: none;">
                <img src="/Img/default-avatar.png" alt="<?= __('profile_picture') ?>" id="profileImage">
            </div>
            <div class="dropdown-menu" id="dropdownMenu">
                <div class="dropdown-header" id="userHeader" style="display: none;">
                    <img src="/Img/default-avatar.png" alt="<?= __('profile_picture') ?>" id="dropdownProfileImage">
                    <span class="dropdown-user-name" id="dropdownUserName"><?= __('user') ?></span>
                </div>
                <div class="guest-options" id="guestOptions">
                    <a href="/iniciar.php" class="dropdown-item">
                        <i class="fi fi-rr-sign-in"></i> <?= __('login') ?>
                    </a>
                </div>
                <div class="user-options" id="userOptions" style="display: none;">
                    <a href="/user-panel.php" class="dropdown-item">
                        <i class="fi fi-rr-user"></i> <?= __('my_profile') ?>
                    </a>
                    <div class="divider"></div>
                    <a href="#" class="dropdown-item" onclick="logout()">
                        <i class="fi fi-rr-sign-out"></i> <?= __('logout') ?>
                    </a>
                </div>
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

    <!-- Contenido principal de la encuesta -->
    <main class="survey-main">
        <div class="survey-container">
            <div class="survey-header">
                <h1 class="survey-title">¿Qué tipo de ser te interesa más?</h1>
                <p class="survey-subtitle">Ayúdanos a conocer tus preferencias para ofrecerte las mejores recomendaciones</p>
            </div>

            <form class="survey-form" id="surveyForm">
                <!-- Pregunta 1 -->
                <div class="survey-question visible" data-question="1">
                    <h2 class="question-title">¿Qué tipo de mitología prefieres?</h2>
                    <div class="question-options">
                        <div class="option-item" data-value="nordica">
                            <input type="radio" name="q1" value="nordica" id="q1_nordica">
                            <label for="q1_nordica">
                                <span class="option-icon">⚡</span>
                                <span class="option-text">Mitología Nórdica</span>
                                <span class="option-desc">Dioses vikingos, runas y batallas épicas</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="griega">
                            <input type="radio" name="q1" value="griega" id="q1_griega">
                            <label for="q1_griega">
                                <span class="option-icon">🏛️</span>
                                <span class="option-text">Mitología Griega</span>
                                <span class="option-desc">Dioses olímpicos, héroes y tragedias</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="egipcia">
                            <input type="radio" name="q1" value="egipcia" id="q1_egipcia">
                            <label for="q1_egipcia">
                                <span class="option-icon">🔺</span>
                                <span class="option-text">Mitología Egipcia</span>
                                <span class="option-desc">Faraones, pirámides y vida después de la muerte</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="japonesa">
                            <input type="radio" name="q1" value="japonesa" id="q1_japonesa">
                            <label for="q1_japonesa">
                                <span class="option-icon">🌸</span>
                                <span class="option-text">Mitología Japonesa</span>
                                <span class="option-desc">Kami, yokai y espíritus de la naturaleza</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Pregunta 2 -->
                <div class="survey-question" data-question="2">
                    <h2 class="question-title">¿Qué características te atraen más?</h2>
                    <div class="question-options">
                        <div class="option-item" data-value="poder">
                            <input type="radio" name="q2" value="poder" id="q2_poder">
                            <label for="q2_poder">
                                <span class="option-icon">💪</span>
                                <span class="option-text">Poder y Fuerza</span>
                                <span class="option-desc">Dominio, autoridad y capacidades sobrenaturales</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="misterio">
                            <input type="radio" name="q2" value="misterio" id="q2_misterio">
                            <label for="q2_misterio">
                                <span class="option-icon">🔮</span>
                                <span class="option-text">Misterio y Magia</span>
                                <span class="option-desc">Secretos ocultos, hechizos y lo inexplicable</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="sabiduria">
                            <input type="radio" name="q2" value="sabiduria" id="q2_sabiduria">
                            <label for="q2_sabiduria">
                                <span class="option-icon">📚</span>
                                <span class="option-text">Sabiduría y Conocimiento</span>
                                <span class="option-desc">Inteligencia, estrategia y enseñanzas profundas</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="naturaleza">
                            <input type="radio" name="q2" value="naturaleza" id="q2_naturaleza">
                            <label for="q2_naturaleza">
                                <span class="option-icon">🌿</span>
                                <span class="option-text">Conexión con la Naturaleza</span>
                                <span class="option-desc">Armonía con elementos y criaturas naturales</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Pregunta 3 -->
                <div class="survey-question" data-question="3">
                    <h2 class="question-title">¿Qué tipo de historia prefieres?</h2>
                    <div class="question-options">
                        <div class="option-item" data-value="epica">
                            <input type="radio" name="q3" value="epica" id="q3_epica">
                            <label for="q3_epica">
                                <span class="option-icon">⚔️</span>
                                <span class="option-text">Épicas de Héroes</span>
                                <span class="option-desc">Batallas legendarias y hazañas heroicas</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="romance">
                            <input type="radio" name="q3" value="romance" id="q3_romance">
                            <label for="q3_romance">
                                <span class="option-icon">💕</span>
                                <span class="option-text">Romances Divinos</span>
                                <span class="option-desc">Historias de amor entre dioses y mortales</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="tragedia">
                            <input type="radio" name="q3" value="tragedia" id="q3_tragedia">
                            <label for="q3_tragedia">
                                <span class="option-icon">⚡</span>
                                <span class="option-text">Tragedias y Castigos</span>
                                <span class="option-desc">Lecciones morales y consecuencias divinas</span>
                            </label>
                        </div>
                        <div class="option-item" data-value="aventura">
                            <input type="radio" name="q3" value="aventura" id="q3_aventura">
                            <label for="q3_aventura">
                                <span class="option-icon">🗺️</span>
                                <span class="option-text">Aventuras y Transformaciones</span>
                                <span class="option-desc">Viajes épicos y metamorfosis mágicas</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>

            <!-- Navegación -->
            <div class="survey-navigation">
                <button type="button" class="survey-btn secondary" id="surveyPrev" disabled>
                    <i class="fi fi-rr-arrow-left"></i> Anterior
                </button>
                
                <div class="survey-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">1 de 3</div>
                </div>
                
                <button type="button" class="survey-btn primary" id="surveyNext" disabled>
                    Siguiente <i class="fi fi-rr-arrow-right"></i>
                </button>
            </div>

            <!-- Pantalla de completado -->
            <div class="survey-completion" id="surveyCompletion">
                <div class="completion-animation">
                    <div class="completion-icon">✨</div>
                    <div class="completion-stars">
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                    </div>
                </div>
                <h2 class="completion-title">¡Gracias por tu participación!</h2>
                <p class="completion-message">
                    Hemos preparado una selección personalizada de seres mitológicos basada en tus preferencias. 
                    ¡Descubre criaturas fascinantes que coinciden con tus intereses!
                </p>
                <div class="completion-buttons">
                    <button type="button" class="survey-btn primary large" id="surveyComplete">
                        <i class="fi fi-rr-search"></i> Explorar Recomendaciones
                    </button>
                    <a href="/index.php" class="survey-btn secondary">
                        <i class="fi fi-rr-home"></i> Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    </main>

    <script src="/JS/header.js"></script>
    <script src="/JS/survey-page.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>