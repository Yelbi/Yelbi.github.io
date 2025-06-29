<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinity Starfield Background</title>
    <style>
        * {
            margin: 0;
        }

        .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            width: 1302px; /* Ancho total (650px * 2 + 2px de separación) */
            height: 752px; /* Alto total (375px * 2 + 2px de separación) */
            position: relative;
        }

        .inv-border, .inc-border, .inf-border, .ing-border {
            width: 650px;
            height: 375px;
            background: rgba(52, 152, 219, 0);
            position: relative;
        }

        /* Posicionamiento de los elementos */
        .inv-border { top: 1px; left: 1px; }
        .inc-border { bottom: 1px; left: 1px; }
        .inf-border { top: 1px; right: 1px; }
        .ing-border { bottom: 1px; right: 1px; }

        /* Crear el óvalo horizontal central con pseudo-elementos */
        .container::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;  /* Ancho del óvalo */
            height: 300px; /* Alto del óvalo */
            border-radius: 50%;
            background: transparent;
            box-shadow: 
                0 0 0 2000px rgb(255, 0, 0),
                inset 0 0 50px rgba(0,0,0,0.2);
            z-index: 2;
        }

        /* Asegurar que los elementos individuales estén sobre la máscara */
        .inv-border, .inc-border, .inf-border, .ing-border {
            z-index: 3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inv-border"></div>
        <div class="inc-border"></div>
        <div class="inf-border"></div>
        <div class="ing-border"></div>
    </div>
</body>
</html>