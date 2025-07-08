// backvoto.js - Fondo animado estelar con reciclaje optimizado
(function() {
    const config = {
        starCount: 3000,
        twinkleFactor: 1,
        fixedSize: 1.2,
        motionDuration: 1200,
        motionDistance: 250,
    };

    let canvas, ctx, stars = [], animId;
    let motionOffset = 0;
    let motionDirection = 0;
    let motionStartTime = null;
    let persistentOffset = 0;
    let cx, cy;

    function createCanvas() {
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
                rgba(10, 10, 40, 0.95) 0%,
                rgba(5, 5, 20, 0.9) 40%,
                rgba(0, 0, 5, 1) 70%
            );
            pointer-events: none;
        `;

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
        
        cx = w / 2;
        cy = h / 2;
    }

    function createStars(count) {
        stars = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let i = 0; i < count; i++) {
            // Crear estrellas dentro del área visible inicial
            const x = Math.random() * w;
            const y = Math.random() * h;
            const depth = 0.4 + Math.random() * 0.6;

            stars.push({
                worldX: (x - cx) / depth,
                worldY: (y - cy) / depth,
                depth,
                color: `rgba(255, 255, ${200 + Math.floor(Math.random() * 55)}, ${Math.random() * 0.3 + 0.2})`,
                twinkleRate: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * 2 * Math.PI,
            });
        }
    }

    function animate(ts = 0) {
        if (!canvas || !ctx) return;

        const now = ts;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const { twinkleFactor, fixedSize } = config;

        if (motionStartTime !== null) {
            const elapsed = now - motionStartTime;
            const t = Math.min(elapsed / config.motionDuration, 1);
            const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
            motionOffset = config.motionDistance * ease * motionDirection;
            if (t >= 1) {
                motionStartTime = null;
                persistentOffset += config.motionDistance * motionDirection;
                motionOffset = 0;
            }
        }

        const totalOffset = persistentOffset + motionOffset;

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0,0,10,0.1)";
        ctx.fillRect(0, 0, w, h);

        for (const s of stars) {
            // Calcular posición en pantalla con efecto de paralaje
            const screenX = cx + s.worldX * s.depth + totalOffset * s.depth;
            const screenY = cy + s.worldY * s.depth;

            // Reciclar estrellas que salen de la pantalla (solo laterales)
            if (screenX < -50 || screenX > w + 50) {
                if (screenX < -50) {
                    // Mover al lado derecho
                    s.worldX = (w + 50 - cx - totalOffset * s.depth) / s.depth;
                } else {
                    // Mover al lado izquierdo
                    s.worldX = (-50 - cx - totalOffset * s.depth) / s.depth;
                }
                // Mantener la misma posición Y
                continue;
            }

            // Dibujar estrella
            const tw = Math.sin(now * 0.001 * s.twinkleRate + s.twinkleOffset) * twinkleFactor * 0.5 + 0.5;
            const curSize = fixedSize * tw;

            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, curSize, 0, 2 * Math.PI);
            ctx.fill();

            // Añadir halo a estrellas grandes
            if (curSize > 1.2) {
                ctx.globalAlpha = 0.15 * tw;
                ctx.beginPath();
                ctx.arc(screenX, screenY, curSize * 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        animId = requestAnimationFrame(animate);
    }

    function startMotion(direction) {
        motionDirection = direction;
        motionStartTime = performance.now();
    }

    function handleResize() {
        cancelAnimationFrame(animId);
        resizeCanvas();
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

        window.addEventListener('resize', handleResize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    function destroy() {
        if (animId) {
            cancelAnimationFrame(animId);
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        const nebulaEl = document.querySelector('.nebula-background');
        const canvasEl = document.getElementById('spaceCanvas');

        if (nebulaEl) nebulaEl.remove();
        if (canvasEl) canvasEl.remove();
    }

    window.startStarMotion = startMotion;
    window.destroyStarBackground = destroy;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();