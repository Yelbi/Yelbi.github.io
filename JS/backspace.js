const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let animationId;

// Parámetros fijos
const params = {
    starCount: 800, // Reducido para mejor rendimiento
    speed: 2.0,
    twinkle: 0.1,
    size: 1.0
};

// Performance optimizations
let lastTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

// Ajustar tamaño del canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recrear estrellas cuando cambia el tamaño
    if (stars.length > 0) {
        createStars(params.starCount);
    }
}

window.addEventListener('resize', resize);
resize();

// Generador de estrellas mejorado
function createStars(num) {
    stars = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < num; i++) {
        const starType = Math.random();
        let size, speed, color, twinkleRate;
        
        if (starType < 0.7) {
            // Estrellas pequeñas (70%)
            size = Math.random() * 0.8 + 0.2;
            speed = Math.random() * 0.5 + 0.5;
            color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
            twinkleRate = Math.random() * 0.02;
        } else if (starType < 0.9) {
            // Estrellas medianas (20%)
            size = Math.random() * 1.5 + 0.8;
            speed = Math.random() * 1.0 + 1.0;
            color = `rgba(255, 240, 200, ${Math.random() * 0.8 + 0.2})`;
            twinkleRate = Math.random() * 0.03 + 0.01;
        } else {
            // Estrellas grandes y coloridas (10%)
            size = Math.random() * 2.5 + 1.5;
            speed = Math.random() * 1.5 + 1.5;
            const colorType = Math.random();
            if (colorType < 0.4) {
                color = `rgba(200, 220, 255, ${Math.random() * 0.9 + 0.1})`; // Azul
            } else if (colorType < 0.7) {
                color = `rgba(255, 200, 150, ${Math.random() * 0.9 + 0.1})`; // Naranja
            } else {
                color = `rgba(220, 180, 255, ${Math.random() * 0.9 + 0.1})`; // Púrpura
            }
            twinkleRate = Math.random() * 0.05 + 0.02;
        }
        
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * canvas.width,
            baseSize: size,
            speed: speed,
            color: color,
            twinkleRate: twinkleRate,
            twinkleOffset: Math.random() * Math.PI * 2,
            size: size
        });
    }
}

// Función para pausar/reanudar animación
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

// Detectar cuando la pestaña no está visible para pausar animación
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pauseAnimation();
    } else {
        resumeAnimation();
    }
});

// Inicializar estrellas
createStars(params.starCount);

function animate(currentTime = 0) {
    // Control de FPS
    const deltaTime = currentTime - lastTime;
    if (deltaTime < frameTime) {
        animationId = requestAnimationFrame(animate);
        return;
    }
    lastTime = currentTime;
    
    // Fondo negro sólido
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const now = Date.now();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Actualizar y dibujar estrellas
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Movimiento en perspectiva
        s.z -= s.speed * params.speed;
        
        // Reiniciar estrella si sale del campo de visión
        if (s.z <= 0) {
            s.z = canvas.width;
            s.x = Math.random() * canvas.width;
            s.y = Math.random() * canvas.height;
        }
        
        // Calcular posición en pantalla
        const k = 128.0 / s.z;
        const px = (s.x - centerX) * k + centerX;
        const py = (s.y - centerY) * k + centerY;
        
        // Verificar si la estrella está dentro de la pantalla
        if (px < -10 || px > canvas.width + 10 || py < -10 || py > canvas.height + 10) {
            continue;
        }
        
        // Efecto de parpadeo con parámetro ajustado
        const twinkle = Math.sin(now * s.twinkleRate + s.twinkleOffset) * params.twinkle * 0.5 + 0.5;
        s.size = s.baseSize * twinkle * params.size;
        
        // Ajustar tamaño por perspectiva
        const size = s.size * (1 - s.z / canvas.width) * 3;
        
        if (size < 0.1) continue; // No dibujar estrellas muy pequeñas
        
        // Dibujar estrella
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Destello sutil para estrellas grandes
        if (size > 1.5) {
            ctx.globalAlpha = 0.3 * twinkle;
            ctx.beginPath();
            ctx.arc(px, py, size * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    animationId = requestAnimationFrame(animate);
}

// Función para limpiar recursos
function cleanup() {
    pauseAnimation();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', pauseAnimation);
}

// Iniciar animación
animate();

// Exponer funciones para control externo si es necesario
window.starfieldControls = {
    pause: pauseAnimation,
    resume: resumeAnimation,
    cleanup: cleanup
};