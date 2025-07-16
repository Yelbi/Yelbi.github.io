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
            <a href="/mitos.php" class="nav-link"><?= __('myths') ?></a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        
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

<main class="main-content">
    <div class="page-header">
        <h1 class="page-title"><?= __('vote_title') ?></h1>
        <p class="page-subtitle"><?= __('vote_subtitle') ?></p>
    </div>

    <div id="app">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-section">
            <div class="loading-spinner"></div>
            <p class="loading-text"><?= __('vote_loading') ?></p>
        </div>

        <!-- Main Voting Interface -->
        <div v-else class="voting-interface">
                <!-- Cards Grid -->
                <div class="cards-grid" :class="{ 'disabled': hasVoted }">
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

                <!-- Vote Success Message -->
            <div v-if="hasVoted" class="success-section">
                <div class="success-card">
                    <i class="fi fi-rr-check-circle success-icon"></i>
                    <h3 class="success-title"><?= __('vote_thanks') ?></h3>
                    <p class="success-message"><?= __('vote_success') ?></p>
                </div>
            </div>

                <!-- Vote Controls -->
            <div v-else class="vote-controls">
                <button class="vote-btn" 
                        :disabled="!canVote || isSubmitting" 
                        @click="submitVote"
                        :class="{ 'loading': isSubmitting, 'disabled': !canVote }">
                    <span v-if="!isSubmitting">
                        {{ selectedOption !== null ? "<?= __('vote_submit') ?>" : "<?= __('vote_select') ?>" }}
                    </span>
                    <span v-else class="loading-content">
                        <i class="fi fi-rr-spinner animate-spin"></i> 
                        <?= __('vote_sending') ?>
                    </span>
                </button>
                
                <div class="vote-info">
                    <i class="fi fi-rr-info"></i>
                    <?= __('vote_warning') ?>
                </div>
            </div>
        </div>
        <!-- Alert Container -->
        <div id="voteAlert" class="alert-container"></div>
    </div>
</main>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script src="/JS/header.js"></script>
    <script src="/JS/voto.js"></script>
    <script src="/JS/backvoto.js"></script>
    <script src="/JS/language.js"></script>
</body>
</html>