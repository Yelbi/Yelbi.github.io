document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('infinity-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Configuración optimizada
    const config = {
        starCount: 400, // Reducido para mejor rendimiento
        speed: 1.0,
        twinkle: 0.3,
        size: 1.0,
        infinitySpeed: 0.012,
        targetFPS: 30,
        trailLength: 5
    };
    
    let stars = [];
    let animationId;
    let time = 0;
    let lastTime = 0;
    let infinityScale = 0;
    let centerX = 0;
    let centerY = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    
    const frameTime = 1000 / config.targetFPS;
    
    // Pool de objetos para evitar garbage collection
    const pointPool = [];
    let poolIndex = 0;
    
    function getPooledPoint(x, y, opacity) {
        if (poolIndex >= pointPool.length) {
            pointPool.push({ x: 0, y: 0, opacity: 0 });
        }
        const point = pointPool[poolIndex++];
        point.x = x;
        point.y = y;
        point.opacity = opacity;
        return point;
    }
    
    function resetPool() {
        poolIndex = 0;
    }
    
    // Cache para cálculos trigonométricos
    const trigCache = new Map();
    
    function getCachedTrig(t) {
        const key = Math.round(t * 1000); // Precisión de 3 decimales
        if (!trigCache.has(key)) {
            const sinT = Math.sin(t);
            const cosT = Math.cos(t);
            const sinTSquared = sinT * sinT;
            trigCache.set(key, { sinT, cosT, sinTSquared });
            
            // Limitar tamaño del cache
            if (trigCache.size > 1000) {
                const firstKey = trigCache.keys().next().value;
                trigCache.delete(firstKey);
            }
        }
        return trigCache.get(key);
    }
    
    function resize() {
        const section = canvas.closest('.section');
        if (!section) return;
        
        canvasWidth = section.clientWidth;
        canvasHeight = section.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        centerX = canvasWidth * 0.5;
        centerY = canvasHeight * 0.5;
        infinityScale = Math.min(canvasWidth, canvasHeight) * 0.2;
        
        createStars();
    }
    
    // Optimización: función inline para puntos de infinito
    function getInfinityPoint(trig, scale) {
        const denominator = 1 + trig.sinTSquared;
        return {
            x: centerX + (scale * trig.cosT) / denominator,
            y: centerY + (scale * trig.sinT * trig.cosT) / denominator
        };
    }
    
    function createStars() {
        stars.length = 0; // Reutilizar array existente
        
        for (let i = 0; i < config.starCount; i++) {
            const rand = Math.random();
            let star;
            
            if (rand < 0.65) {
                // Estrellas de infinito (65%)
                star = createInfinityStar();
            } else if (rand < 0.85) {
                // Estrellas de fondo (20%)
                star = createBackgroundStar();
            } else {
                // Estrellas destacadas (15%)
                star = createHighlightStar();
            }
            
            stars.push(star);
        }
    }
    
    function createInfinityStar() {
        const size = Math.random() * 1.5 + 0.5;
        const t = Math.random() * Math.PI * 2;
        const offset = Math.random() * 60 - 30;
        const trig = getCachedTrig(t);
        const pos = getInfinityPoint(trig, infinityScale + offset);
        
        return {
            x: pos.x,
            y: pos.y,
            baseSize: size,
            size: size,
            speed: Math.random() * 0.3 + 0.1,
            color: `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`,
            twinkleRate: Math.random() * 0.03 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.8 + 0.2,
            t: t,
            offset: offset,
            behavior: 'infinity',
            trail: []
        };
    }
    
    function createBackgroundStar() {
        return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            z: Math.random() * canvasWidth,
            baseSize: Math.random() * 0.7 + 0.2,
            size: 0,
            speed: Math.random() * 0.5 + 0.2,
            color: `rgba(200,220,255,${Math.random() * 0.6 + 0.1})`,
            twinkleRate: Math.random() * 0.02,
            twinkleOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.8 + 0.2,
            behavior: 'background'
        };
    }
    
    function createHighlightStar() {
        const size = Math.random() * 2.5 + 1.5;
        const t = Math.random() * Math.PI * 2;
        const offset = Math.random() * 60 - 30;
        const colorRand = Math.random();
        let color;
        
        if (colorRand < 0.4) {
            color = `rgba(255,200,100,${Math.random() * 0.8 + 0.1})`;
        } else if (colorRand < 0.7) {
            color = `rgba(100,200,255,${Math.random() * 0.8 + 0.1})`;
        } else {
            color = `rgba(255,150,200,${Math.random() * 0.8 + 0.1})`;
        }
        
        const trig = getCachedTrig(t);
        const pos = getInfinityPoint(trig, infinityScale + offset);
        
        return {
            x: pos.x,
            y: pos.y,
            baseSize: size,
            size: size,
            speed: Math.random() * 0.4 + 0.2,
            color: color,
            twinkleRate: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.8 + 0.2,
            t: t,
            offset: offset,
            behavior: 'highlight',
            trail: []
        };
    }
    
    function updateStar(star, deltaTime) {
        const now = time * 1000; // Convertir a milisegundos una vez
        
        if (star.behavior === 'infinity' || star.behavior === 'highlight') {
            star.t += star.speed * config.speed * config.infinitySpeed;
            const trig = getCachedTrig(star.t);
            const pos = getInfinityPoint(trig, infinityScale + star.offset);
            star.x = pos.x;
            star.y = pos.y;
            
            // Usar pool para trail
            star.trail.push(getPooledPoint(star.x, star.y, star.opacity));
            if (star.trail.length > config.trailLength) {
                star.trail.shift();
            }
        } else {
            // Background stars
            star.z -= star.speed * config.speed;
            if (star.z <= 0) {
                star.z = canvasWidth;
                star.x = Math.random() * canvasWidth;
                star.y = Math.random() * canvasHeight;
            }
            
            const k = 128.0 / star.z;
            star.x = (star.x - centerX) * k + centerX;
            star.y = (star.y - centerY) * k + centerY;
        }
        
        // Calcular twinkle una vez por estrella
        const twinkle = Math.sin(now * star.twinkleRate + star.twinkleOffset) * config.twinkle * 0.5 + 0.5;
        star.size = star.baseSize * (twinkle * 0.6 + 0.4) * config.size;
        star.currentTwinkle = twinkle;
    }
    
    function renderStar(star) {
        // Culling para estrellas de fondo
        if (star.behavior === 'background' && 
            (star.x < -50 || star.x > canvasWidth + 50 || 
             star.y < -50 || star.y > canvasHeight + 50)) {
            return;
        }
        
        // Renderizar trail para estrellas de infinito
        if ((star.behavior === 'infinity' || star.behavior === 'highlight') && star.trail.length > 0) {
            const trailLength = star.trail.length;
            for (let i = 0; i < trailLength; i++) {
                const point = star.trail[i];
                const trailOpacity = (i / trailLength) * star.opacity * 0.2;
                
                ctx.globalAlpha = trailOpacity;
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, star.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Renderizar estrella principal
        ctx.globalAlpha = star.opacity * star.currentTwinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Efectos adicionales para estrellas destacadas
        if (star.behavior === 'highlight' && star.size > 2.0) {
            const alpha = star.opacity * star.currentTwinkle;
            
            // Halo
            ctx.globalAlpha = alpha * 0.15;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Cruz
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            const crossSize = star.size * 3.0;
            ctx.moveTo(star.x - crossSize, star.y);
            ctx.lineTo(star.x + crossSize, star.y);
            ctx.moveTo(star.x, star.y - crossSize);
            ctx.lineTo(star.x, star.y + crossSize);
            ctx.stroke();
        }
    }
    
    function animate(currentTime = 0) {
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameTime) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastTime = currentTime;
        time += 0.016;
        
        // Reset pool al inicio de cada frame
        resetPool();
        
        // Limpiar canvas
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Actualizar y renderizar estrellas
        for (let i = 0; i < stars.length; i++) {
            updateStar(stars[i], deltaTime);
            renderStar(stars[i]);
        }
        
        ctx.globalAlpha = 1; // Reset alpha
        animationId = requestAnimationFrame(animate);
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
    
    // Event listeners
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseAnimation();
        } else {
            resumeAnimation();
        }
    });
    
    // Inicializar
    resize();
    animate();
});