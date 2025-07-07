<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.3.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
    <link rel="stylesheet" href="/styles/voto.css">
    <link rel="stylesheet" href="/styles/header.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('site_title') ?> - Votación</title>
</head>
<body>

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

    <h1 class="title">Vota por tu favorita</h1>

    <div id="app" class="container">
        <!-- Loading state -->
        <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando estado de votación...</p>
        </div>

        <!-- Voting interface -->
        <div v-else>
            <!-- Cards container -->
            <div class="cards-container" :class="{ 'disabled': hasVoted }">
                <card 
                    v-for="(option, index) in options" 
                    :key="index"
                    :data-image="option.image"
                    @click.native="selectOption(index)"
                    :class="{ 
                        selected: selectedOption === index,
                        disabled: hasVoted
                    }"
                >
                    <h1 slot="header">{{ option.title }}</h1>
                    <p slot="content">{{ option.description }}</p>
                </card>
            </div>

            <!-- Vote status indicator -->
            <div v-if="hasVoted" class="vote-status">
                <div class="vote-complete">
                    <i class="fi fi-rr-check-circle"></i>
                    <h3>¡Gracias por votar!</h3>
                    <p>Tu voto ha sido registrado exitosamente.</p>
                </div>
            </div>

            <!-- Submit button -->
            <div v-else class="submit-container">
                <button 
                    class="submit-btn" 
                    :disabled="!canVote || isSubmitting" 
                    @click="submitVote"
                    :class="{ 
                        'loading': isSubmitting,
                        'disabled': !canVote 
                    }"
                >
                    <span v-if="!isSubmitting">
                        {{ selectedOption !== null ? 'Enviar mi voto' : 'Selecciona una opción' }}
                    </span>
                    <span v-else>
                        <i class="fi fi-rr-spinner animate-spin"></i> Enviando...
                    </span>
                </button>
                
                <p class="vote-info">
                    <i class="fi fi-rr-info"></i>
                    Solo puedes votar una vez. Tu selección es permanente.
                </p>
            </div>
        </div>

        <!-- Alert container -->
        <div id="voteAlert" class="alert-container"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script src="/JS/header.js"></script>
    <script src="/JS/voto.js"></script>
</body>
</html>