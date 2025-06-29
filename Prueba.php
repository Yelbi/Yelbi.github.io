<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Óvalo Central con Bordes Externos</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }

        .container {
            position: relative;
            width: 1302px;
            height: 752px;
            display: flex;
            flex-wrap: wrap;
        }

        /* Estilos para cada segmento */
        .panel {
            width: 650px;
            height: 375px;
            position: relative;
            background: rgba(52, 152, 219, 0.31);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(0, 0, 0, 0.7);
            transition: all 0.4s ease;
            overflow: hidden;
        }

        .panel:hover {
            background: rgba(52, 152, 219, 0.5);
            transform: scale(1.01);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
            z-index: 10;
        }

        /* Posicionamiento específico de cada panel */
        .top-left {
            top: 1px;
            left: 1px;
            border-right: none;
            border-bottom: none;
            border-top-left-radius: 15px;
        }

        .top-right {
            top: 1px;
            right: 1px;
            border-left: none;
            border-bottom: none;
            border-top-right-radius: 15px;
        }

        .bottom-left {
            bottom: 1px;
            left: 1px;
            border-right: none;
            border-top: none;
            border-bottom-left-radius: 15px;
        }

        .bottom-right {
            bottom: 1px;
            right: 1px;
            border-left: none;
            border-top: none;
            border-bottom-right-radius: 15px;
        }

        /* Óvalo central */
        .oval-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 400px;
            border-radius: 50%;
            background: transparent;
            box-shadow: 
                0 0 0 2000px rgba(52, 152, 219, 0.31),
                inset 0 0 30px rgba(0, 0, 0, 0.5);
            z-index: 2;
            pointer-events: none;
        }

        /* Título decorativo */
        .title {
            position: absolute;
            top: 20px;
            left: 0;
            width: 100%;
            text-align: center;
            color: white;
            font-size: 2.5rem;
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
            z-index: 5;
        }

        /* Subtítulo informativo */
        .subtitle {
            position: absolute;
            bottom: 20px;
            left: 0;
            width: 100%;
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            z-index: 5;
        }

        /* Efecto de brillo interior */
        .panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                circle at center,
                rgba(255, 255, 255, 0.2) 0%,
                transparent 70%
            );
            opacity: 0.3;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">Óvalo Central</h1>
        <p class="subtitle">Bordes solo visibles en los límites externos | Efecto de transparencia</p>
        
        <div class="panel top-left"></div>
        <div class="panel top-right"></div>
        <div class="panel bottom-left"></div>
        <div class="panel bottom-right"></div>
        
        <div class="oval-center"></div>
    </div>
</body>
</html>