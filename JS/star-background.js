// backvoto.js - Fondo animado estelar para voto.php con animación de movimiento al navegar
(function() {
    const config = {
        starCount: 2500,
        twinkleFactor: 0.8, // reducido para brillo tenue
        fixedSize: 1.2,
        galaxyCenter: { x: 0, y: 0 },
        motionDuration: 1200,
        motionDistance: 250,
    };

    let canvas, ctx, stars = [], animId;
    let motionOffset = 0;
    let motionDirection = 0;
    let motionStartTime = null;
    let persistentOffset = 0;

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
        config.galaxyCenter = { x: w / 2, y: h / 2 };
    }

    function createStars(count) {
        stars = [];
        const maxOrbit = Math.hypot(window.innerWidth, window.innerHeight);

        for (let i = 0; i < count; i++) {
            const depth = Math.random();
            const orbit = Math.random() * maxOrbit;

            stars.push({
                angle: Math.random() * 2 * Math.PI,
                orbit,
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
        const { x: cx, y: cy } = config.galaxyCenter;
        const { twinkleFactor, fixedSize } = config;
        const w = window.innerWidth;
        const h = window.innerHeight;

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

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0,0,10,0.1)";
        ctx.fillRect(0, 0, w, h);

        const totalOffset = persistentOffset + motionOffset;

        for (const s of stars) {
            const dp = 0.4 + s.depth * 0.6;
            const x = cx + Math.cos(s.angle) * s.orbit * dp + totalOffset * dp;
            const y = cy + Math.sin(s.angle) * s.orbit * dp;

            const tw = Math.sin(now * 0.001 * s.twinkleRate + s.twinkleOffset) * twinkleFactor * 0.5 + 0.5;
            const curSize = fixedSize * tw;

            if (x > -50 && x < w + 50 && y > -50 && y < h + 50) {
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(x, y, curSize, 0, 2 * Math.PI);
                ctx.fill();

                if (curSize > 1.2) {
                    ctx.globalAlpha = 0.15 * tw;
                    ctx.beginPath();
                    ctx.arc(x, y, curSize * 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
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
