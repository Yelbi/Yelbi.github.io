<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planeta Arenoso con Tormentas - Fondo Animado</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            overflow: hidden;
            background: linear-gradient(135deg, #0a0a15 0%, #1a1a30 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        #planetCanvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        .info-overlay {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #d4b483;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #d4b483;
            max-width: 300px;
            z-index: 2;
            backdrop-filter: blur(5px);
            transition: opacity 0.5s;
        }
        
        .info-overlay h3 {
            margin-bottom: 10px;
            color: #e0c28d;
        }
        
        .info-overlay p {
            margin-bottom: 8px;
            line-height: 1.4;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <canvas id="planetCanvas"></canvas>
        <div class="info-overlay">
            <h3>Planeta Arenoso con Tormentas</h3>
            <p>Este planeta presenta patrones de tormentas dinámicas similares a las de Júpiter, con una superficie arenosa y colores cálidos.</p>
            <p>Las bandas atmosféricas y remolinos se generan mediante algoritmos de ruido y funciones trigonométricas.</p>
            <p>La animación es continua y suave, con una transición perfecta entre los bordes del planeta y el espacio.</p>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('planetCanvas');
        const ctx = canvas.getContext('2d');
        let animationId;
        let stars = [];

        // Parámetros optimizados para fondo animado
        const params = {
            rotationSpeed: 0.3,
            planetSize: 0.45,
            starCount: 400
        };

        let lastTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        let rotation = 0;
        let time = 0;

        // Ajustar tamaño del canvas
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createStars();
        }

        window.addEventListener('resize', resize);
        resize();

        // Crear campo de estrellas
        function createStars() {
            stars = [];
            for (let i = 0; i < params.starCount; i++) {
                const brightness = Math.random();
                let size, alpha;
                
                if (brightness < 0.7) {
                    size = Math.random() * 0.5 + 0.2;
                    alpha = Math.random() * 0.3 + 0.2;
                } else if (brightness < 0.92) {
                    size = Math.random() * 0.8 + 0.4;
                    alpha = Math.random() * 0.5 + 0.3;
                } else {
                    size = Math.random() * 1.5 + 0.8;
                    alpha = Math.random() * 0.7 + 0.5;
                }
                
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: size,
                    twinkle: Math.random() * 0.015 + 0.005,
                    offset: Math.random() * Math.PI * 2,
                    alpha: alpha,
                    color: `rgba(255, ${240 + Math.random() * 15}, ${220 + Math.random() * 35}, ${alpha})`
                });
            }
        }

        // Dibujar estrellas con efecto de parpadeo
        function drawStars(t) {
            for (let star of stars) {
                const twinkle = Math.sin(t * star.twinkle + star.offset) * 0.4 + 0.6;
                const currentAlpha = star.alpha * twinkle;
                ctx.fillStyle = star.color.replace(/[\d.]+\)$/, `${currentAlpha})`);
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Función para generar ruido Perlin simplificado
        function noise(x, y, scale = 1) {
            const X = Math.floor(x * scale) & 255;
            const Y = Math.floor(y * scale) & 255;
            
            x *= scale;
            y *= scale;
            
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            
            const u = fade(xf);
            const v = fade(yf);
            
            const A = (X + Y * 57) * 0.017453292;
            const B = ((X + 1) + Y * 57) * 0.017453292;
            const C = (X + (Y + 1) * 57) * 0.017453292;
            const D = ((X + 1) + (Y + 1) * 57) * 0.017453292;
            
            return lerp(v, 
                lerp(u, Math.sin(A), Math.sin(B)),
                lerp(u, Math.sin(C), Math.sin(D))
            );
        }

        function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
        function lerp(t, a, b) { return a + t * (b - a); }

        // Generar textura de planeta arenoso con tormentas
        function generatePlanetSurface(x, y, centerX, centerY, radius) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > radius) return null;
            
            // Coordenadas normalizadas desde el centro
            const normalizedX = dx / radius;
            const normalizedY = dy / radius;
            const normalizedDist = distance / radius;
            
            // Calcular coordenadas 3D en la esfera
            const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));
            
            // Vista desde el ecuador: rotación horizontal alrededor del eje Y
            // Longitud (rotación horizontal)
            const longitude = Math.atan2(normalizedX, z) + rotation;
            
            // Latitud (altura desde el ecuador)
            const latitude = Math.asin(normalizedY);
            
            // Crear patrones para un planeta arenoso con tormentas
            // Bandas atmosféricas horizontales
            const bandPattern = 
                Math.sin(latitude * 18 + time * 0.2) * 0.7 +
                noise(latitude * 12, longitude * 4, 0.5) * 0.3;
            
            // Patrones de tormentas (remolinos)
            const stormPattern = 
                Math.sin(longitude * 10 + latitude * 20) * 0.5 +
                noise(longitude * 15, latitude * 15, 1.2) * 0.4;
            
            // Gran tormenta principal
            const bigStorm = 
                Math.exp(-(Math.pow(longitude - 1.8, 2) * 12 + Math.pow(latitude + 0.3, 2) * 25)) * 0.8;
            
            // Combinar patrones
            const finalPattern = bandPattern * 0.7 + stormPattern * 0.3 + bigStorm * 0.5;
            
            // Colores para planeta arenoso con tormentas
            let baseColor;
            const elevation = finalPattern;
            
            // Zonas con diferentes colores según la elevación
            if (elevation < -0.4) {
                // Bandas oscuras profundas
                baseColor = {
                    r: 120 + Math.random() * 20,
                    g: 80 + Math.random() * 15,
                    b: 50 + Math.random() * 10
                };
            } else if (elevation < -0.2) {
                // Bandas medias
                baseColor = {
                    r: 160 + Math.random() * 25,
                    g: 120 + Math.random() * 20,
                    b: 70 + Math.random() * 15
                };
            } else if (elevation < 0) {
                // Transición a bandas claras
                baseColor = {
                    r: 180 + Math.random() * 30,
                    g: 150 + Math.random() * 25,
                    b: 100 + Math.random() * 20
                };
            } else if (elevation < 0.3) {
                // Bandas claras
                baseColor = {
                    r: 210 + Math.random() * 30,
                    g: 180 + Math.random() * 25,
                    b: 130 + Math.random() * 20
                };
            } else {
                // Tormentas - colores más intensos
                if (bigStorm > 0.3) {
                    // Gran tormenta - color rojizo
                    baseColor = {
                        r: 180 + Math.random() * 50,
                        g: 70 + Math.random() * 30,
                        b: 60 + Math.random() * 20
                    };
                } else {
                    // Tormentas menores - color más claro
                    baseColor = {
                        r: 220 + Math.random() * 30,
                        g: 200 + Math.random() * 40,
                        b: 170 + Math.random() * 30
                    };
                }
            }
            
            // Iluminación
            const lightDir = { x: -0.7, y: -0.3, z: 0.9 };
            
            // Normales de superficie en vista ecuatorial
            const normalX = normalizedX;
            const normalY = normalizedY;
            const normalZ = z;
            
            // Iluminación difusa
            const diffuse = Math.max(0.15, 
                normalX * lightDir.x + 
                normalY * lightDir.y + 
                normalZ * lightDir.z
            );
            
            // Suavizar la iluminación para planeta gaseoso
            const surfaceLighting = Math.pow(diffuse, 0.7);
            
            // Agregar brillo a las tormentas
            const stormGlow = (elevation > 0.3 && bigStorm < 0.3) ? 
                Math.pow(Math.max(0, diffuse), 8) * 0.4 : 0;
            
            // Suavizado del borde
            const edgeFactor = Math.min(1, (1 - normalizedDist) / 0.05);
            const edgeSmooth = edgeFactor < 1 ? Math.pow(edgeFactor, 1.5) : 1;
            
            return {
                r: Math.min(255, Math.max(0, baseColor.r * surfaceLighting + stormGlow * 150)),
                g: Math.min(255, Math.max(0, baseColor.g * surfaceLighting + stormGlow * 120)),
                b: Math.min(255, Math.max(0, baseColor.b * surfaceLighting + stormGlow * 100)),
                a: edgeSmooth
            };
        }

        // Dibujar planeta con borde suavizado
        function drawPlanet() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * params.planetSize;
            
            if (!canvas.width || !canvas.height || radius <= 0) return;
            
            const diameter = Math.ceil(radius * 2);
            
            // Renderizar por sectores para mejor performance
            const imageData = ctx.createImageData(diameter, diameter);
            const data = imageData.data;
            
            for (let y = 0; y < diameter; y++) {
                for (let x = 0; x < diameter; x++) {
                    const pixelX = centerX - radius + x;
                    const pixelY = centerY - radius + y;
                    const surface = generatePlanetSurface(pixelX, pixelY, centerX, centerY, radius);
                    
                    if (surface) {
                        const index = (y * diameter + x) * 4;
                        data[index] = surface.r;
                        data[index + 1] = surface.g;
                        data[index + 2] = surface.b;
                        data[index + 3] = surface.a * 255;
                    }
                }
            }
            
            ctx.putImageData(imageData, centerX - radius, centerY - radius);
        }

        // Función de animación optimizada
        function animate(currentTime = 0) {
            animationId = requestAnimationFrame(animate);
            
            const deltaTime = currentTime - lastTime;
            if (deltaTime < frameTime) return;
            
            lastTime = currentTime;
            time += 0.01;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawStars(time);
            
            // Rotación horizontal suave
            rotation += params.rotationSpeed * 0.008;
            if (rotation > Math.PI * 2) rotation -= Math.PI * 2;
            
            drawPlanet();
        }

        // Manejar cambios de visibilidad para optimizar recursos
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });

        // Iniciar animación
        setTimeout(() => {
            createStars();
            animate();
        }, 100);
    </script>
</body>
</html>