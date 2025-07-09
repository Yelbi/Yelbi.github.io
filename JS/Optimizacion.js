// 1. Sistema de gestión de animaciones centralizadas
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.activeAnimations = new Set();
        this.isVisible = true;
        this.lastTime = 0;
        this.frameRate = 40; // Reducir de 60 a 40 FPS
        this.frameInterval = 1000 / this.frameRate;
        this.animationId = null;
        
        this.setupVisibilityDetection();
        this.setupPerformanceMonitoring();
        this.startMainLoop();
    }
    
    setupVisibilityDetection() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.resumeAll();
            } else {
                this.pauseAll();
            }
        });
    }
    
    setupPerformanceMonitoring() {
        this.performanceData = {
            frameCount: 0,
            lastFPSCheck: performance.now(),
            currentFPS: 0
        };
        
        // Ajustar automáticamente la calidad según el rendimiento
        setInterval(() => {
            const now = performance.now();
            const deltaTime = now - this.performanceData.lastFPSCheck;
            this.performanceData.currentFPS = (this.performanceData.frameCount * 1000) / deltaTime;
            
            if (this.performanceData.currentFPS < 30) {
                this.reduceQuality();
            } else if (this.performanceData.currentFPS > 50) {
                this.increaseQuality();
            }
            
            this.performanceData.frameCount = 0;
            this.performanceData.lastFPSCheck = now;
        }, 2000);
    }
    
    register(name, animation) {
        this.animations.set(name, animation);
        return animation;
    }
    
    activate(name) {
        const animation = this.animations.get(name);
        if (animation) {
            this.activeAnimations.add(animation);
            animation.setActive(true);
        }
    }
    
    deactivate(name) {
        const animation = this.animations.get(name);
        if (animation) {
            this.activeAnimations.delete(animation);
            animation.setActive(false);
        }
    }
    
    startMainLoop() {
        const loop = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            
            if (deltaTime >= this.frameInterval && this.isVisible) {
                this.performanceData.frameCount++;
                
                for (const animation of this.activeAnimations) {
                    animation.update(deltaTime);
                }
                
                this.lastTime = currentTime;
            }
            
            this.animationId = requestAnimationFrame(loop);
        };
        
        this.animationId = requestAnimationFrame(loop);
    }
    
    pauseAll() {
        for (const animation of this.activeAnimations) {
            animation.pause();
        }
    }
    
    resumeAll() {
        for (const animation of this.activeAnimations) {
            animation.resume();
        }
    }
    
    reduceQuality() {
        for (const animation of this.activeAnimations) {
            animation.reduceQuality();
        }
    }
    
    increaseQuality() {
        for (const animation of this.activeAnimations) {
            animation.increaseQuality();
        }
    }
}

// 2. Clase base optimizada para animaciones
class OptimizedAnimation {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isActive = false;
        this.isPaused = false;
        this.config = {
            maxParticles: 500,
            minParticles: 100,
            qualityLevel: 'medium',
            useOffscreenCanvas: true,
            ...config
        };
        
        this.particles = [];
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.observer = null;
        
        this.setupCanvas();
        this.setupIntersectionObserver();
        this.createParticles();
    }
    
    setupCanvas() {
        this.resize();
        
        // Usar OffscreenCanvas para mejor rendimiento
        if (this.config.useOffscreenCanvas && typeof OffscreenCanvas !== 'undefined') {
            this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
            this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        }
        
        window.addEventListener('resize', this.throttle(() => this.resize(), 250));
    }
    
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animationManager.activate(this.name);
                    } else {
                        animationManager.deactivate(this.name);
                    }
                });
            }, { threshold: 0.1 });
            
            this.observer.observe(this.canvas);
        }
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.offscreenCanvas) {
            this.offscreenCanvas.width = rect.width;
            this.offscreenCanvas.height = rect.height;
        }
    }
    
    createParticles() {
        const count = this.getParticleCount();
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    getParticleCount() {
        const { qualityLevel, maxParticles, minParticles } = this.config;
        const multiplier = {
            'low': 0.3,
            'medium': 0.6,
            'high': 1.0
        }[qualityLevel] || 0.6;
        
        return Math.floor(minParticles + (maxParticles - minParticles) * multiplier);
    }
    
    createParticle() {
        // Implementar en subclases
        return {};
    }
    
    setActive(active) {
        this.isActive = active;
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    update(deltaTime) {
        if (!this.isActive || this.isPaused) return;
        
        const ctx = this.offscreenCtx || this.ctx;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Actualizar partículas
        this.updateParticles(deltaTime);
        
        // Renderizar partículas
        this.renderParticles(ctx);
        
        // Copiar desde offscreen canvas si es necesario
        if (this.offscreenCanvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        }
    }
    
    updateParticles(deltaTime) {
        // Implementar en subclases
    }
    
    renderParticles(ctx) {
        // Implementar en subclases
    }
    
    reduceQuality() {
        if (this.config.qualityLevel === 'medium') {
            this.config.qualityLevel = 'low';
        } else if (this.config.qualityLevel === 'high') {
            this.config.qualityLevel = 'medium';
        }
        this.adjustQuality();
    }
    
    increaseQuality() {
        if (this.config.qualityLevel === 'low') {
            this.config.qualityLevel = 'medium';
        } else if (this.config.qualityLevel === 'medium') {
            this.config.qualityLevel = 'high';
        }
        this.adjustQuality();
    }
    
    adjustQuality() {
        const newCount = this.getParticleCount();
        const currentCount = this.particles.length;
        
        if (newCount > currentCount) {
            // Añadir partículas
            for (let i = currentCount; i < newCount; i++) {
                this.particles.push(this.createParticle());
            }
        } else if (newCount < currentCount) {
            // Remover partículas
            this.particles.length = newCount;
        }
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener('resize', this.resize);
        animationManager.deactivate(this.name);
    }
}

// 3. Starfield optimizado
class OptimizedStarfield extends OptimizedAnimation {
    constructor(canvas) {
        super(canvas, {
            maxParticles: 600,
            minParticles: 200,
            name: 'starfield'
        });
        this.name = 'starfield';
        
        // Pool de objetos para evitar garbage collection
        this.particlePool = [];
        this.poolIndex = 0;
    }
    
    createParticle() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const starType = Math.random();
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            z: Math.random() * this.canvas.width,
            baseSize: starType < 0.7 ? Math.random() * 0.8 + 0.2 : Math.random() * 2 + 1,
            speed: Math.random() * 1.5 + 0.5,
            color: this.getStarColor(starType),
            twinkleRate: Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
            lastTwinkle: 0
        };
    }
    
    getStarColor(starType) {
        if (starType < 0.7) {
            return `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
        } else if (starType < 0.9) {
            return `rgba(255, 240, 200, ${Math.random() * 0.8 + 0.2})`;
        } else {
            const colors = [
                `rgba(200, 220, 255, ${Math.random() * 0.9 + 0.1})`,
                `rgba(255, 200, 150, ${Math.random() * 0.9 + 0.1})`,
                `rgba(220, 180, 255, ${Math.random() * 0.9 + 0.1})`
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    updateParticles(deltaTime) {
        const now = performance.now();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < this.particles.length; i++) {
            const star = this.particles[i];
            
            // Actualizar posición
            star.z -= star.speed * 2;
            
            if (star.z <= 0) {
                star.z = this.canvas.width;
                star.x = Math.random() * this.canvas.width;
                star.y = Math.random() * this.canvas.height;
            }
            
            // Calcular posición en pantalla
            const k = 128.0 / star.z;
            star.screenX = (star.x - centerX) * k + centerX;
            star.screenY = (star.y - centerY) * k + centerY;
            
            // Actualizar twinkle solo si es necesario
            if (now - star.lastTwinkle > 50) { // Cada 50ms
                star.currentTwinkle = Math.sin(now * star.twinkleRate + star.twinkleOffset) * 0.5 + 0.5;
                star.lastTwinkle = now;
            }
            
            // Calcular tamaño final
            star.finalSize = star.baseSize * star.currentTwinkle * (1 - star.z / this.canvas.width) * 3;
        }
    }
    
    renderParticles(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            const star = this.particles[i];
            
            // Culling
            if (star.screenX < -10 || star.screenX > this.canvas.width + 10 || 
                star.screenY < -10 || star.screenY > this.canvas.height + 10 ||
                star.finalSize < 0.1) {
                continue;
            }
            
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.screenX, star.screenY, star.finalSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Efecto de destello solo para estrellas grandes
            if (star.finalSize > 1.5 && this.config.qualityLevel !== 'low') {
                ctx.globalAlpha = 0.3 * star.currentTwinkle;
                ctx.beginPath();
                ctx.arc(star.screenX, star.screenY, star.finalSize * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// 4. Inicialización optimizada
const animationManager = new AnimationManager();

// Detectar cuando las secciones son visibles
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const sectionId = entry.target.id;
        
        if (entry.isIntersecting) {
            // Activar animación de la sección visible
            switch (sectionId) {
                case 'section1':
                    animationManager.activate('starfield');
                    break;
                case 'section2':
                    animationManager.activate('blackhole');
                    break;
                case 'section3':
                    animationManager.activate('infinity');
                    break;
            }
        } else {
            // Desactivar animación de la sección no visible
            switch (sectionId) {
                case 'section1':
                    animationManager.deactivate('starfield');
                    break;
                case 'section2':
                    animationManager.deactivate('blackhole');
                    break;
                case 'section3':
                    animationManager.deactivate('infinity');
                    break;
            }
        }
    });
}, { threshold: 0.1 });

// Observar secciones
document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
});

// Inicializar animaciones
document.addEventListener('DOMContentLoaded', () => {
    // Starfield
    const starfieldCanvas = document.getElementById('starfield');
    if (starfieldCanvas) {
        const starfield = new OptimizedStarfield(starfieldCanvas);
        animationManager.register('starfield', starfield);
    }
    
    // Similares para blackhole e infinity...
});

// 5. Utilidades de optimización adicionales
class PerformanceUtils {
    static detectDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isLowEnd = navigator.hardwareConcurrency < 4 || navigator.deviceMemory < 4;
        
        return {
            isMobile,
            isLowEnd,
            supportedFeatures: {
                offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
                intersectionObserver: 'IntersectionObserver' in window,
                webGL: !!document.createElement('canvas').getContext('webgl')
            }
        };
    }
    
    static getOptimalSettings() {
        const device = this.detectDevice();
        
        if (device.isLowEnd || device.isMobile) {
            return {
                qualityLevel: 'low',
                maxParticles: 200,
                frameRate: 20,
                useOffscreenCanvas: false
            };
        } else {
            return {
                qualityLevel: 'medium',
                maxParticles: 600,
                frameRate: 30,
                useOffscreenCanvas: device.supportedFeatures.offscreenCanvas
            };
        }
    }
}

// Aplicar configuración óptima
const optimalSettings = PerformanceUtils.getOptimalSettings();
console.log('Configuración óptima aplicada:', optimalSettings);