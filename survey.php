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
    <title><?= __('site_title') ?></title>
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
                            <div class="option-content">
                                <span class="option-icon">⚡</span>
                                <div class="option-text-content">
                                    <div class="option-text">Mitología Nórdica</div>
                                    <div class="option-desc">Dioses vikingos, runas y batallas épicas</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="griega">
                        <input type="radio" name="q1" value="griega" id="q1_griega">
                        <label for="q1_griega">
                            <div class="option-content">
                                <span class="option-icon">🏛️</span>
                                <div class="option-text-content">
                                    <div class="option-text">Mitología Griega</div>
                                    <div class="option-desc">Dioses olímpicos, héroes y tragedias</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="egipcia">
                        <input type="radio" name="q1" value="egipcia" id="q1_egipcia">
                        <label for="q1_egipcia">
                            <div class="option-content">
                                <span class="option-icon">🔺</span>
                                <div class="option-text-content">
                                    <div class="option-text">Mitología Egipcia</div>
                                    <div class="option-desc">Faraones, pirámides y vida después de la muerte</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="japonesa">
                        <input type="radio" name="q1" value="japonesa" id="q1_japonesa">
                        <label for="q1_japonesa">
                            <div class="option-content">
                                <span class="option-icon">🌸</span>
                                <div class="option-text-content">
                                    <div class="option-text">Mitología Japonesa</div>
                                    <div class="option-desc">Kami, yokai y espíritus de la naturaleza</div>
                                </div>
                            </div>
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
                            <div class="option-content">
                                <span class="option-icon">💪</span>
                                <div class="option-text-content">
                                    <div class="option-text">Poder y Fuerza</div>
                                    <div class="option-desc">Dominio, autoridad y capacidades sobrenaturales</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="misterio">
                        <input type="radio" name="q2" value="misterio" id="q2_misterio">
                        <label for="q2_misterio">
                            <div class="option-content">
                                <span class="option-icon">🔮</span>
                                <div class="option-text-content">
                                    <div class="option-text">Misterio y Magia</div>
                                    <div class="option-desc">Secretos ocultos, hechizos y lo inexplicable</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="sabiduria">
                        <input type="radio" name="q2" value="sabiduria" id="q2_sabiduria">
                        <label for="q2_sabiduria">
                            <div class="option-content">
                                <span class="option-icon">📚</span>
                                <div class="option-text-content">
                                    <div class="option-text">Sabiduría y Conocimiento</div>
                                    <div class="option-desc">Inteligencia, estrategia y enseñanzas profundas</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="naturaleza">
                        <input type="radio" name="q2" value="naturaleza" id="q2_naturaleza">
                        <label for="q2_naturaleza">
                            <div class="option-content">
                                <span class="option-icon">🌿</span>
                                <div class="option-text-content">
                                    <div class="option-text">Conexión con la Naturaleza</div>
                                    <div class="option-desc">Armonía con elementos y criaturas naturales</div>
                                </div>
                            </div>
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
                            <div class="option-content">
                                <span class="option-icon">⚔️</span>
                                <div class="option-text-content">
                                    <div class="option-text">Épicas de Héroes</div>
                                    <div class="option-desc">Batallas legendarias y hazañas heroicas</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="romance">
                        <input type="radio" name="q3" value="romance" id="q3_romance">
                        <label for="q3_romance">
                            <div class="option-content">
                                <span class="option-icon">💕</span>
                                <div class="option-text-content">
                                    <div class="option-text">Romances Divinos</div>
                                    <div class="option-desc">Historias de amor entre dioses y mortales</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="tragedia">
                        <input type="radio" name="q3" value="tragedia" id="q3_tragedia">
                        <label for="q3_tragedia">
                            <div class="option-content">
                                <span class="option-icon">⚡</span>
                                <div class="option-text-content">
                                    <div class="option-text">Tragedias y Castigos</div>
                                    <div class="option-desc">Lecciones morales y consecuencias divinas</div>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div class="option-item" data-value="aventura">
                        <input type="radio" name="q3" value="aventura" id="q3_aventura">
                        <label for="q3_aventura">
                            <div class="option-content">
                                <span class="option-icon">🗺️</span>
                                <div class="option-text-content">
                                    <div class="option-text">Aventuras y Transformaciones</div>
                                    <div class="option-desc">Viajes épicos y metamorfosis mágicas</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </form>

        <!-- Navegación -->
        <div class="survey-navigation">
            <button type="button" class="survey-btn secondary" id="surveyPrev" disabled>
                ← Anterior
            </button>
            
            <div class="survey-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">1 de 3</div>
            </div>
            
            <button type="button" class="survey-btn primary" id="surveyNext" disabled>
                Siguiente →
            </button>
        </div>

        <!-- Pantalla de completado -->
        <div class="survey-completion" id="surveyCompletion">
            <div class="completion-icon">✨</div>
            <h2 class="completion-title">¡Gracias por tu participación!</h2>
            <p class="completion-message">
                Hemos preparado una selección personalizada de seres mitológicos basada en tus preferencias. 
                ¡Descubre criaturas fascinantes que coinciden con tus intereses!
            </p>
            <div class="completion-buttons">
                <button type="button" class="survey-btn primary large" id="surveyComplete">
                    🔍 Explorar Recomendaciones
                </button>
                <button type="button" class="survey-btn secondary" onclick="window.location.href='/'">
                    🏠 Volver al Inicio
                </button>
            </div>
        </div>
    </div>

    <script src="/JS/header.js"></script>
    <script src="/JS/survey-page.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>