<?php require 'config/i18n.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles/voto.css">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <title><?= __('site_title') ?></title>
</head>
<body>
    <h1 class="title">Vota por tu favorito</h1>

    <div id="app" class="container">
        <card :data-image="'https://i.pinimg.com/736x/db/62/86/db628698b9e588926246c6309e30e588.jpg'">
            <h1 slot="header">Mitología Eslava</h1>
            <p slot="content">Bosques, Espíritus y Ancestros</p>
        </card>
        <card :data-image="'https://i.pinimg.com/736x/b1/e7/f3/b1e7f3aa3207248b933f488642d9c2d9.jpg'">
            <h1 slot="header">Mitología Azteca</h1>
            <p slot="content">Sacrificio, Guerra y Sol</p>
        </card>
        <card :data-image="'https://i.pinimg.com/736x/3d/6d/b2/3d6db2f75afdd70fcb8befc6ed7c2c75.jpg'">
            <h1 slot="header">Hinduismo</h1>
            <p slot="content">Karma, Dharma y Moksha</p>
        </card>
        <card :data-image="'https://i.pinimg.com/736x/ed/ae/fb/edaefbe97bdf09b5ba412bfc80574df7.jpg'">
            <h1 slot="header">Mitología Japonesa</h1>
            <p slot="content">Kami, Naturaleza y Armonía</p>
        </card>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script src="/JS/voto.js"></script>
</body>
</html>