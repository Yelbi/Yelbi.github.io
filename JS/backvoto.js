// backvoto.js - Fondo animado estelar para voto.php
(function() {
    // Configuración del fondo estelar
    const config = {
        starCount: 2000,
        rotationSpeed: 0.5,
        twinkleFactor: 0.3,
        baseSize: 1.5,
        fixedSize: 1.5,
        galaxyCenter: { x: 0, y: 0 },
    };

    let canvas, ctx, stars = [], animId;

    function createCanvas() {
        // Crear el contenedor nebulosa
        const nebulaDiv = document.createElement('div');
        nebulaDiv.className = 'nebula-background';
        nebulaDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -2;
            background: radial-gradient(
                circle at center,
                rgba(5, 5, 20, 0.9) 0%,
                rgba(1, 1, 10, 0.9) 40%,
                rgba(0, 0, 0, 1) 70%
            );
            pointer-events: none;
        `;

        // Crear el canvas
        canvas = document.createElement('canvas');
        canvas.id = 'spaceCanvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: -1;
            display: block;
            pointer-events: none;
        `;

        ctx = canvas.getContext('2d');

        // Agregar al DOM
        document.body.insertBefore(nebulaDiv, document.body.firstChild);
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        config.galaxyCenter = { x: w / 2, y: h / 2 };
    }

    function createStars(count) {
        stars = [];
        const maxOrbit = Math.hypot(window.innerWidth, window.innerHeight);
        
        for (let i = 0; i < count; i++) {
            const speed = Math.random() * 0.6 + 0.1;
            const depth = Math.random();
            const orbit = Math.random() * maxOrbit;
            
            stars.push({
                angle: Math.random() * 2 * Math.PI,
                orbit,
                speed,
                depth,
                color: `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`,
                twinkleRate: Math.random() * 0.015 + 0.005,
                twinkleOffset: Math.random() * 2 * Math.PI,
            });
        }
    }

    function animate(ts = 0) {
        if (!canvas || !ctx) return;

        const now = ts * 0.001;
        const { x: cx, y: cy } = config.galaxyCenter;
        const { rotationSpeed, twinkleFactor, fixedSize } = config;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0,0,5,0.08)";
        ctx.fillRect(0, 0, w, h);

        for (const s of stars) {
            s.angle += s.speed * rotationSpeed * 0.008;
            const dp = 0.4 + s.depth * 0.6;
            const x = cx + Math.cos(s.angle) * s.orbit * dp;
            const y = cy + Math.sin(s.angle) * s.orbit * dp;

            const tw = Math.sin(now * s.twinkleRate + s.twinkleOffset) * twinkleFactor * 0.5 + 0.5;
            const curSize = fixedSize * tw;

            if (x > -50 && x < w + 50 && y > -50 && y < h + 50) {
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(x, y, curSize, 0, 2 * Math.PI);
                ctx.fill();
                
                if (curSize > 1.5) {
                    ctx.globalAlpha = 0.15 * tw;
                    ctx.beginPath();
                    ctx.arc(x, y, curSize * 1.8, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
        }
        
        animId = requestAnimationFrame(animate);
    }

    function handleResize() {
        cancelAnimationFrame(animId);
        resizeCanvas();
        createStars(config.starCount);
        animate();
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animate();
        }
    }

    function init() {
        createCanvas();
        resizeCanvas();
        createStars(config.starCount);
        animate();

        // Event listeners
        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    function destroy() {
        if (animId) {
            cancelAnimationFrame(animId);
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        
        // Remover elementos del DOM
        const nebulaEl = document.querySelector('.nebula-background');
        const canvasEl = document.getElementById('spaceCanvas');
        
        if (nebulaEl) nebulaEl.remove();
        if (canvasEl) canvasEl.remove();
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer función de destrucción globalmente si es necesario
    window.destroyStarBackground = destroy;
})();