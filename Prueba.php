<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinity Starfield Background</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: #000;
            overflow: hidden;
        }
        #canvas {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let stars = [];
        let animationId;
        let time = 0;

        // Parámetros optimizados
        const params = {
            starCount: 1000,
            speed: 1.8,
            twinkle: 0.4,
            size: 1.5,
            infinityScale: 0, // Se calculará dinámicamente
            infinitySpeed: 0.015
        };

        let lastTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Calcular escala del infinito basada en el tamaño de pantalla
            const minDimension = Math.min(canvas.width, canvas.height);
            params.infinityScale = minDimension * 0.25; // 25% de la dimensión menor
            
            createStars();
        }

        window.addEventListener('resize', resize);
        resize();

        function getInfinityPoint(t, scale = 1) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const x = centerX + (scale * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
            const y = centerY + (scale * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
            
            return { x, y };
        }

        function createStars() {
            stars = [];
            
            for (let i = 0; i < params.starCount; i++) {
                const starType = Math.random();
                let size, speed, color, twinkleRate, behavior;
                
                if (starType < 0.65) {
                    // Estrellas del infinito (65%)
                    size = Math.random() * 1.8 + 0.6;
                    speed = Math.random() * 0.4 + 0.1;
                    color = `rgba(255, 255, 255, ${Math.random() * 0.9 + 0.1})`;
                    twinkleRate = Math.random() * 0.04 + 0.01;
                    behavior = 'infinity';
                } else if (starType < 0.85) {
                    // Estrellas de fondo (20%)
                    size = Math.random() * 0.9 + 0.3;
                    speed = Math.random() * 0.6 + 0.3;
                    color = `rgba(200, 220, 255, ${Math.random() * 0.7 + 0.1})`;
                    twinkleRate = Math.random() * 0.025;
                    behavior = 'background';
                } else {
                    // Estrellas destacadas (15%)
                    size = Math.random() * 3 + 1.8;
                    speed = Math.random() * 0.5 + 0.2;
                    const colorType = Math.random();
                    if (colorType < 0.4) {
                        color = `rgba(255, 200, 100, ${Math.random() * 0.95 + 0.05})`;
                    } else if (colorType < 0.7) {
                        color = `rgba(100, 200, 255, ${Math.random() * 0.95 + 0.05})`;
                    } else {
                        color = `rgba(255, 150, 200, ${Math.random() * 0.95 + 0.05})`;
                    }
                    twinkleRate = Math.random() * 0.06 + 0.02;
                    behavior = 'highlight';
                }
                
                const star = {
                    baseSize: size,
                    speed: speed,
                    color: color,
                    twinkleRate: twinkleRate,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    size: size,
                    behavior: behavior,
                    t: Math.random() * Math.PI * 2,
                    offset: Math.random() * 80 - 40,
                    opacity: Math.random() * 0.9 + 0.1,
                    trail: []
                };

                if (behavior === 'infinity' || behavior === 'highlight') {
                    const pos = getInfinityPoint(star.t, params.infinityScale + star.offset);
                    star.x = pos.x;
                    star.y = pos.y;
                } else {
                    star.x = Math.random() * canvas.width;
                    star.y = Math.random() * canvas.height;
                    star.z = Math.random() * canvas.width;
                }

                stars.push(star);
            }
        }

        function pauseAnimation() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        function resumeAnimation() {
            if (!animationId) {
                animate();
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseAnimation();
            } else {
                resumeAnimation();
            }
        });

        createStars();

        function animate(currentTime = 0) {
            const deltaTime = currentTime - lastTime;
            if (deltaTime < frameTime) {
                animationId = requestAnimationFrame(animate);
                return;
            }
            lastTime = currentTime;
            
            time += 0.016;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const now = Date.now();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                
                if (s.behavior === 'infinity' || s.behavior === 'highlight') {
                    s.t += s.speed * params.speed * params.infinitySpeed;
                    const pos = getInfinityPoint(s.t, params.infinityScale + s.offset);
                    s.x = pos.x;
                    s.y = pos.y;
                    
                    s.trail.push({ x: s.x, y: s.y, opacity: s.opacity });
                    if (s.trail.length > 10) {
                        s.trail.shift();
                    }
                } else {
                    s.z -= s.speed * params.speed;
                    
                    if (s.z <= 0) {
                        s.z = canvas.width;
                        s.x = Math.random() * canvas.width;
                        s.y = Math.random() * canvas.height;
                    }
                    
                    const k = 128.0 / s.z;
                    s.x = (s.x - centerX) * k + centerX;
                    s.y = (s.y - centerY) * k + centerY;
                }
                
                if (s.behavior === 'background' && (s.x < -50 || s.x > canvas.width + 50 || s.y < -50 || s.y > canvas.height + 50)) {
                    continue;
                }
                
                const twinkle = Math.sin(now * s.twinkleRate + s.twinkleOffset) * params.twinkle * 0.6 + 0.4;
                s.size = s.baseSize * (twinkle * 0.6 + 0.4) * params.size;
                
                if (s.behavior === 'infinity' || s.behavior === 'highlight') {
                    s.trail.forEach((point, index) => {
                        const trailOpacity = (index / s.trail.length) * s.opacity * 0.25;
                        ctx.globalAlpha = trailOpacity;
                        ctx.fillStyle = s.color;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, s.size * 0.4, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
                
                ctx.globalAlpha = s.opacity * twinkle;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                
                if (s.behavior === 'highlight' && s.size > 2.5) {
                    ctx.globalAlpha = (s.opacity * twinkle) * 0.2;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.size * 2.8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.strokeStyle = s.color;
                    ctx.lineWidth = 0.8;
                    ctx.globalAlpha = (s.opacity * twinkle) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(s.x - s.size * 3.5, s.y);
                    ctx.lineTo(s.x + s.size * 3.5, s.y);
                    ctx.moveTo(s.x, s.y - s.size * 3.5);
                    ctx.lineTo(s.x, s.y + s.size * 3.5);
                    ctx.stroke();
                }
                
                ctx.globalAlpha = 1;
            }
            
            animationId = requestAnimationFrame(animate);
        }

        animate();
    </script>
</body>
</html>