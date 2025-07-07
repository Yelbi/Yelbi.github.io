<?php 
require 'config/connection.php'; // Añadimos la conexión a la base de datos
require 'config/i18n.php'; 
?>
<!DOCTYPE html>
<html lang="<?= $current_lang ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="stylesheet" href="/styles/test.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('personality_test') ?> - <?= __('site_title') ?></title>
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

    <main class="test-container">
        <h1><?= __('personality_test') ?></h1>
        
        <?php if (!isset($_POST['submit'])): ?>
        <form method="post" id="personalityTest">
            <!-- Pregunta 1 -->
            <div class="question">
                <h3>1. <?= __('question_1') ?></h3>
                <label>
                    <input type="radio" name="q1" value="a" required>
                    <?= __('q1_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q1" value="b">
                    <?= __('q1_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q1" value="c">
                    <?= __('q1_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 2 -->
            <div class="question">
                <h3>2. <?= __('question_2') ?></h3>
                <label>
                    <input type="radio" name="q2" value="a" required>
                    <?= __('q2_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q2" value="b">
                    <?= __('q2_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q2" value="c">
                    <?= __('q2_option_c') ?>
                </label>
                <label>
                    <input type="radio" name="q2" value="d">
                    <?= __('q2_option_d') ?>
                </label>
            </div>

            <!-- Pregunta 3 -->
            <div class="question">
                <h3>3. <?= __('question_3') ?></h3>
                <label>
                    <input type="radio" name="q3" value="a" required>
                    <?= __('q3_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q3" value="b">
                    <?= __('q3_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q3" value="c">
                    <?= __('q3_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 4 -->
            <div class="question">
                <h3>4. <?= __('question_4') ?></h3>
                <label>
                    <input type="radio" name="q4" value="a" required>
                    <?= __('q4_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q4" value="b">
                    <?= __('q4_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q4" value="c">
                    <?= __('q4_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 5 -->
            <div class="question">
                <h3>5. <?= __('question_5') ?></h3>
                <label>
                    <input type="radio" name="q5" value="a" required>
                    <?= __('q5_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q5" value="b">
                    <?= __('q5_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q5" value="c">
                    <?= __('q5_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 6 -->
            <div class="question">
                <h3>6. <?= __('question_6') ?></h3>
                <label>
                    <input type="radio" name="q6" value="a" required>
                    <?= __('q6_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q6" value="b">
                    <?= __('q6_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q6" value="c">
                    <?= __('q6_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 7 -->
            <div class="question">
                <h3>7. <?= __('question_7') ?></h3>
                <label>
                    <input type="radio" name="q7" value="a" required>
                    <?= __('q7_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q7" value="b">
                    <?= __('q7_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q7" value="c">
                    <?= __('q7_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 8 -->
            <div class="question">
                <h3>8. <?= __('question_8') ?></h3>
                <label>
                    <input type="radio" name="q8" value="a" required>
                    <?= __('q8_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q8" value="b">
                    <?= __('q8_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q8" value="c">
                    <?= __('q8_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 9 -->
            <div class="question">
                <h3>9. <?= __('question_9') ?></h3>
                <label>
                    <input type="radio" name="q9" value="a" required>
                    <?= __('q9_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q9" value="b">
                    <?= __('q9_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q9" value="c">
                    <?= __('q9_option_c') ?>
                </label>
            </div>

            <!-- Pregunta 10 -->
            <div class="question">
                <h3>10. <?= __('question_10') ?></h3>
                <label>
                    <input type="radio" name="q10" value="a" required>
                    <?= __('q10_option_a') ?>
                </label>
                <label>
                    <input type="radio" name="q10" value="b">
                    <?= __('q10_option_b') ?>
                </label>
                <label>
                    <input type="radio" name="q10" value="c">
                    <?= __('q10_option_c') ?>
                </label>
            </div>

            <button type="submit" name="submit" class="btn-submit"><?= __('submit_test') ?></button>
        </form>
        
        <?php else: 
            // Procesar resultados
            $results = [
                'Zeus' => 0, 'Odín' => 0, 'Atenea' => 0, 'Apolo' => 0, 'Artemisa' => 0,
                'Loki' => 0, 'Thor' => 0, 'Freya' => 0, 'Anubis' => 0, 'Isis' => 0,
                'Hermes' => 0, 'Afrodita' => 0, 'Tyr' => 0, 'Hefesto' => 0, 'Ma\'at' => 0,
                'Skadi' => 0, 'Thot' => 0, 'Hera' => 0, 'Bastet' => 0, 'Hel' => 0
            ];
            
            // Sistema de puntuación
            $scoring = [
                'q1' => ['a' => ['Zeus', 'Odín'], 'b' => ['Atenea', 'Thot'], 'c' => ['Thor', 'Hera']],
                'q2' => ['a' => ['Zeus', 'Hera'], 'b' => ['Artemisa', 'Skadi'], 'c' => ['Hefesto', 'Thot'], 'd' => ['Apolo', 'Freya']],
                'q3' => ['a' => ['Thor', 'Tyr'], 'b' => ['Loki', 'Atenea'], 'c' => ['Ma\'at', 'Isis']],
                'q4' => ['a' => ['Thor', 'Tyr'], 'b' => ['Freya', 'Afrodita'], 'c' => ['Apolo', 'Hermes']],
                'q5' => ['a' => ['Tyr', 'Hera'], 'b' => ['Afrodita', 'Freya'], 'c' => ['Artemisa', 'Skadi']],
                'q6' => ['a' => ['Thor', 'Zeus'], 'b' => ['Loki', 'Odín'], 'c' => ['Atenea', 'Ma\'at']],
                'q7' => ['a' => ['Anubis', 'Hel'], 'b' => ['Freya', 'Odín'], 'c' => ['Artemisa', 'Bastet']],
                'q8' => ['a' => ['Zeus', 'Odín'], 'b' => ['Isis', 'Apolo'], 'c' => ['Hefesto', 'Thot']],
                'q9' => ['a' => ['Thor', 'Tyr'], 'b' => ['Loki', 'Hermes'], 'c' => ['Ma\'at', 'Anubis']],
                'q10' => ['a' => ['Zeus', 'Odín'], 'b' => ['Apolo', 'Afrodita'], 'c' => ['Thot', 'Atenea']]
            ];
            
            // Calcular puntajes
            for ($i = 1; $i <= 10; $i++) {
                $q = 'q' . $i;
                if (isset($_POST[$q])) {
                    $answer = $_POST[$q];
                    foreach ($scoring[$q][$answer] as $god) {
                        $results[$god]++;
                    }
                }
            }
            
            // Obtener resultado máximo
            arsort($results);
            $topGod = key($results);
            $topScore = current($results);
            
            // Descripciones de los dioses
            $descriptions = [
                'Zeus' => __('zeus_desc'),
                'Odín' => __('odin_desc'),
                'Atenea' => __('athena_desc'),
                'Apolo' => __('apollo_desc'),
                'Artemisa' => __('artemis_desc'),
                'Loki' => __('loki_desc'),
                'Thor' => __('thor_desc'),
                'Freya' => __('freya_desc'),
                'Anubis' => __('anubis_desc'),
                'Isis' => __('isis_desc'),
                'Hermes' => __('hermes_desc'),
                'Afrodita' => __('aphrodite_desc'),
                'Tyr' => __('tyr_desc'),
                'Hefesto' => __('hephaestus_desc'),
                'Ma\'at' => __('maat_desc'),
                'Skadi' => __('skadi_desc'),
                'Thot' => __('thoth_desc'),
                'Hera' => __('hera_desc'),
                'Bastet' => __('bastet_desc'),
                'Hel' => __('hel_desc')
            ];
            
            // Obtener imagen desde la base de datos
            $imagen = '/Img/default-god.jpg'; // Imagen por defecto
            $slug = ''; // Slug vacío por defecto
            try {
                // Mapear nombres especiales (como Ma'at)
                $godNameForDB = str_replace("'", "''", $topGod); // Escapar apóstrofes
                
                $stmt = $pdo->prepare("
                    SELECT s.slug, s.imagen 
                    FROM seres s
                    JOIN seres_translations st ON s.id = st.ser_id
                    WHERE st.nombre = :nombre 
                    AND st.language_code = :lang
                    LIMIT 1
                ");
                
                $stmt->execute([
                    ':nombre' => $godNameForDB,
                    ':lang' => $current_lang
                ]);
                
                $serData = $stmt->fetch();
                if ($serData) {
                    $imagen = $serData['imagen'];
                    $slug = $serData['slug'];
                }
            } catch (PDOException $e) {
                error_log("Error al obtener imagen y slug: " . $e->getMessage());
            }
        ?>
        
        <div class="test-result">
            <h2><?= __('your_result') ?></h2>
            <div class="god-card">
                <div class="god-image">
                    <img src="<?= htmlspecialchars($imagen) ?>" alt="<?= $topGod ?>">
                </div>
                <div class="god-info">
                    <h3><?= $topGod ?></h3>
                    <p><?= $descriptions[$topGod] ?></p>
                    <?php if (!empty($slug)): ?>
                        <a href="/detalle.php?ser=<?= htmlspecialchars($slug) ?>" class="btn"><?= __('learn_more') ?></a>
                    <?php else: ?>
                        <a href="/galeria.php" class="btn"><?= __('gallery') ?></a>
                    <?php endif; ?>
                </div>
            </div>
            
            <a href="test.php" class="btn retake-btn"><?= __('retake_test') ?></a>
        </div>
        <?php endif; ?>
    </main>

    <script src="/JS/header.js"></script>
    <script src="/JS/test.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>