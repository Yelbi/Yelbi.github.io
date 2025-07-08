// star-background.js
class StarBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.animationId = null;
        this.isMoving = false;
        this.moveDirection = 0;
        this.moveDuration = 0;
        this.moveStartTime = 0;
        this.maxMoveDuration = 500; // 0.5 segundos de movimiento
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.resizeCanvas();
        this.createStars();
        this.animate();
        
        // Event listeners
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'star-background';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
        
        // Regenerar estrellas al cambiar tamaño
        this.createStars();
    }
    
    createStars() {
        this.stars = [];
        const starCount = Math.floor((window.innerWidth * window.innerHeight) / 500);
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.7 + 0.3,
                blinkSpeed: Math.random() * 0.01 + 0.005,
                blinkOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    triggerMove(direction) {
        this.isMoving = true;
        this.moveDirection = direction;
        this.moveDuration = 0;
        this.moveStartTime = Date.now();
    }
    
    updateStars(timestamp) {
        const now = Date.now();
        const timeDelta = now - this.moveStartTime;
        
        // Actualizar movimiento si está activo
        if (this.isMoving) {
            this.moveDuration = timeDelta;
            
            // Calcular progreso de movimiento (0 a 1)
            const progress = Math.min(1, this.moveDuration / this.maxMoveDuration);
            
            // Aplicar movimiento con efecto de aceleración/desaceleración
            const moveAmount = 50 * Math.sin(progress * Math.PI) * this.moveDirection;
            
            // Mover estrellas
            this.stars.forEach(star => {
                star.x += moveAmount;
                
                // Reposicionar estrellas que salen de la pantalla
                if (star.x < -20) star.x = window.innerWidth + 20;
                if (star.x > window.innerWidth + 20) star.x = -20;
            });
            
            // Finalizar movimiento
            if (progress >= 1) {
                this.isMoving = false;
            }
        }
        
        // Actualizar parpadeo
        this.stars.forEach(star => {
            star.currentOpacity = star.opacity * (0.5 + 0.5 * Math.sin(now * star.blinkSpeed + star.blinkOffset));
        });
    }
    
    drawStars() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo degradado espacial
        const gradient = this.ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, '#020714');
        gradient.addColorStop(1, '#0a1a3a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Dibujar estrellas
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.currentOpacity})`;
            this.ctx.fill();
        });
    }
    
    animate(timestamp) {
        this.updateStars(timestamp);
        this.drawStars();
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        } else if (!this.animationId) {
            this.animate();
        }
    }
    
    destroy() {
        cancelAnimationFrame(this.animationId);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resizeCanvas);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

// Inicializar e integrar con el test
document.addEventListener('DOMContentLoaded', () => {
    // Crear fondo estelar
    const starBackground = new StarBackground();
    
    // Integrar con los botones de navegación
    if (document.getElementById('personalityTest')) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                starBackground.triggerMove(1); // Movimiento hacia la derecha
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                starBackground.triggerMove(-1); // Movimiento hacia la izquierda
            });
        }
    }
    
    // Exponer para control si es necesario
    window.starBackground = starBackground;
});