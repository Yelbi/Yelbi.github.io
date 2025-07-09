// Versión optimizada del starfield
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

class OptimizedStarfield {
    constructor() {
        this.stars = [];
        this.isActive = false;
        this.animationId = null;
        
        // Configuración adaptativa
        this.config = this.getOptimalConfig();
        this.setupCanvas();
        this.createStars();
        this.bindEvents();
    }
    
    getOptimalConfig() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = navigator.hardwareConcurrency < 4;
        
        if (isMobile || isLowEnd) {
            return {
                starCount: 300,
                speed: 1.5,
                targetFPS: 30,
                twinkleEnabled: false,
                glowEnabled: false
            };
        } else {
            return {
                starCount: 600,
                speed: 2.0,
                targetFPS: 40,
                twinkleEnabled: true,
                glowEnabled: true
            };
        }
    }
    
    setupCanvas() {
        this.resize();
        
        // Usar RAF con throttling
        this.lastTime = 0;
        this.frameInterval = 1000 / this.config.targetFPS;
        
        // Intersection Observer para activar/desactivar
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.start();
                    } else {
                        this.stop();
                    }
                });
            }, { threshold: 0.1 });
            
            this.observer.observe(canvas.closest('.section'));
        }
    }
    
    resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Recrear estrellas con nuevas dimensiones
        if (this.stars.length > 0) {
            this.createStars();
        }
    }
    
    createStars() {
        this.stars = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < this.config.starCount; i++) {
            const star = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                baseSize: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 1.0 + 0.5,
                color: this.getStarColor(),
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                lastUpdate: 0
            };
            
            this.stars.push(star);
        }
    }
    
    getStarColor() {
        const rand = Math.random();
        if (rand < 0.7) {
            return `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`;
        } else if (rand < 0.9) {
            return `rgba(255,240,200,${Math.random() * 0.8 + 0.2})`;
        } else {
            const colors = [
                'rgba(200,220,255,0.8)',
                'rgba(255,200,150,0.8)',
                'rgba(220,180,255,0.8)'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        const deltaTime = currentTime - this.lastTime;
        if (deltaTime < this.frameInterval) {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        this.lastTime = currentTime;
        
        // Limpiar canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.updateAndRenderStars(currentTime);
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    updateAndRenderStars(currentTime) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // Actualizar posición
            star.z -= star.speed * this.config.speed;
            
            if (star.z <= 0) {
                star.z = canvas.width;
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height;
            }
            
            // Calcular posición en pantalla
            const k = 128.0 / star.z;
            const px = (star.x - centerX) * k + centerX;
            const py = (star.y - centerY) * k + centerY;
            
            // Culling
            if (px < -10 || px > canvas.width + 10 || 
                py < -10 || py > canvas.height + 10) {
                continue;
            }
            
            // Calcular tamaño
            let size = star.baseSize * (1 - star.z / canvas.width) * 3;
            
            // Twinkle effect (solo si está habilitado)
            if (this.config.twinkleEnabled) {
                if (currentTime - star.lastUpdate > 50) { // Actualizar cada 50ms
                    star.twinklePhase += star.twinkleSpeed;
                    star.lastUpdate = currentTime;
                }
                const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
                size *= twinkle;
            }
            
            if (size < 0.1) continue;
            
            // Renderizar estrella
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de resplandor (solo para estrellas grandes)
            if (this.config.glowEnabled && size > 1.5) {
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(px, py, size * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', this.resize.bind(this));
        
        // Pausar cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else if (canvas.closest('.section.active')) {
                this.start();
            }
        });
    }
    
    destroy() {
        this.stop();
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener('resize', this.resize.bind(this));
    }
}

// Inicializar solo cuando sea necesario
let starfield = null;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        starfield = new OptimizedStarfield();
    });
} else {
    starfield = new OptimizedStarfield();
}

// Exportar para control externo
window.starfieldControls = {
    pause: () => starfield?.stop(),
    resume: () => starfield?.start(),
    destroy: () => starfield?.destroy()
};