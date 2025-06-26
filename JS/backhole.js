// JS/hole-background.js - Animación de fondo para sección 2
let holeCanvas, holeCtx, holeAnimationId;
let holeStars = [];
let holeTime = 0;
let holeRotation = 0;
let holeInitialized = false;

// Parámetros optimizados para fondo
const holeParams = {
    rotationSpeed: 0.2,
    holeSize: 0.3,
    starCount: 200
};

let holeLastTime = 0;
const holeTargetFPS = 30; // Reducido para mejor performance como fondo
const holeFrameTime = 1000 / holeTargetFPS;

// Inicializar canvas del holea
function initholeCanvas() {
    holeCanvas = document.getElementById('holeCanvas');
    if (!holeCanvas) return false;
    
    holeCtx = holeCanvas.getContext('2d');
    holeInitialized = true;
    resizeholeCanvas();
    createholeStars();
    return true;
}

// Ajustar tamaño del canvas
function resizeholeCanvas() {
    if (!holeCanvas) return;
    
    holeCanvas.width = window.innerWidth;
    holeCanvas.height = window.innerHeight;
    
    if (holeStars.length > 0) {
        createholeStars();
    }
}

// Crear campo de estrellas
function createholeStars() {
    holeStars = [];
    for (let i = 0; i < holeParams.starCount; i++) {
        const brightness = Math.random();
        let size, alpha;
        
        if (brightness < 0.8) {
            size = Math.random() * 0.4 + 0.1;
            alpha = Math.random() * 0.2 + 0.1;
        } else {
            size = Math.random() * 0.6 + 0.3;
            alpha = Math.random() * 0.4 + 0.2;
        }
        
        holeStars.push({
            x: Math.random() * holeCanvas.width,
            y: Math.random() * holeCanvas.height,
            size: size,
            twinkle: Math.random() * 0.01 + 0.003,
            offset: Math.random() * Math.PI * 2,
            alpha: alpha,
            color: `rgba(255, ${240 + Math.random() * 15}, ${220 + Math.random() * 35}, ${alpha})`
        });
    }
}

// Dibujar estrellas
function drawholeStars(t) {
    for (let star of holeStars) {
        const twinkle = Math.sin(t * star.twinkle + star.offset) * 0.3 + 0.7;
        const currentAlpha = star.alpha * twinkle;
        holeCtx.fillStyle = star.color.replace(/[\d.]+\)$/, `${currentAlpha})`);
        
        holeCtx.beginPath();
        holeCtx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        holeCtx.fill();
    }
}

// Función de ruido simplificada
function holeNoise(x, y, scale = 1) {
    const X = Math.floor(x * scale) & 255;
    const Y = Math.floor(y * scale) & 255;
    
    x *= scale;
    y *= scale;
    
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    const u = holeFade(xf);
    const v = holeFade(yf);
    
    const A = (X + Y * 57) * 0.017453292;
    const B = ((X + 1) + Y * 57) * 0.017453292;
    const C = (X + (Y + 1) * 57) * 0.017453292;
    const D = ((X + 1) + (Y + 1) * 57) * 0.017453292;
    
    return holeLerp(v, 
        holeLerp(u, Math.sin(A), Math.sin(B)),
        holeLerp(u, Math.sin(C), Math.sin(D))
    );
}

function holeFade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function holeLerp(t, a, b) { return a + t * (b - a); }

// Generar superficie del holea
function generateholeSurface(x, y, centerX, centerY, radius) {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) return null;
    
    const normalizedX = dx / radius;
    const normalizedY = dy / radius;
    const normalizedDist = distance / radius;
    
    const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));
    const longitude = Math.atan2(normalizedX, z) + holeRotation;
    const latitude = Math.asin(normalizedY);
    
    // Patrones del holea
    const bandPattern = 
        Math.sin(latitude * 15 + holeTime * 0.15) * 0.6 +
        holeNoise(latitude * 10, longitude * 3, 0.4) * 0.3;
    
    const stormPattern = 
        Math.sin(longitude * 8 + latitude * 16) * 0.4 +
        holeNoise(longitude * 12, latitude * 12, 1.0) * 0.3;
    
    const bigStorm = 
        Math.exp(-(Math.pow(longitude - 1.5, 2) * 10 + Math.pow(latitude + 0.2, 2) * 20)) * 0.6;
    
    const finalPattern = bandPattern * 0.7 + stormPattern * 0.3 + bigStorm * 0.4;
    
    // Colores más sutiles para fondo
    let baseColor;
    const elevation = finalPattern;
    
    if (elevation < -0.3) {
        baseColor = { r: 100, g: 70, b: 45 };
    } else if (elevation < -0.1) {
        baseColor = { r: 130, g: 100, b: 60 };
    } else if (elevation < 0.1) {
        baseColor = { r: 150, g: 125, b: 80 };
    } else if (elevation < 0.3) {
        baseColor = { r: 180, g: 150, b: 100 };
    } else {
        if (bigStorm > 0.2) {
            baseColor = { r: 160, g: 60, b: 50 };
        } else {
            baseColor = { r: 200, g: 170, b: 130 };
        }
    }
    
    // Iluminación más suave
    const lightDir = { x: -0.6, y: -0.2, z: 0.8 };
    const normalX = normalizedX;
    const normalY = normalizedY;
    const normalZ = z;
    
    const diffuse = Math.max(0.2, 
        normalX * lightDir.x + 
        normalY * lightDir.y + 
        normalZ * lightDir.z
    );
    
    const surfaceLighting = Math.pow(diffuse, 0.8);
    const edgeFactor = Math.min(1, (1 - normalizedDist) / 0.04);
    const edgeSmooth = edgeFactor < 1 ? Math.pow(edgeFactor, 1.2) : 1;
    
    return {
        r: Math.min(255, Math.max(0, baseColor.r * surfaceLighting * 0.8)),
        g: Math.min(255, Math.max(0, baseColor.g * surfaceLighting * 0.8)),
        b: Math.min(255, Math.max(0, baseColor.b * surfaceLighting * 0.8)),
        a: edgeSmooth * 0.9 // Hacer el holea más transparente como fondo
    };
}

// Dibujar holea
function drawhole() {
    if (!holeCanvas || !holeCtx) return;
    
    const centerX = holeCanvas.width / 2;
    const centerY = holeCanvas.height / 2;
    const radius = Math.min(holeCanvas.width, holeCanvas.height) * holeParams.holeSize;
    
    if (!holeCanvas.width || !holeCanvas.height || radius <= 0) return;
    
    const diameter = Math.ceil(radius * 2);
    const imageData = holeCtx.createImageData(diameter, diameter);
    const data = imageData.data;
    
    for (let y = 0; y < diameter; y++) {
        for (let x = 0; x < diameter; x++) {
            const pixelX = centerX - radius + x;
            const pixelY = centerY - radius + y;
            const surface = generateholeSurface(pixelX, pixelY, centerX, centerY, radius);
            
            if (surface) {
                const index = (y * diameter + x) * 4;
                data[index] = surface.r;
                data[index + 1] = surface.g;
                data[index + 2] = surface.b;
                data[index + 3] = surface.a * 255;
            }
        }
    }
    
    holeCtx.putImageData(imageData, centerX - radius, centerY - radius);
}

// Animación del holea
function animatehole(currentTime = 0) {
    if (!holeInitialized || !holeCanvas) return;
    
    const deltaTime = currentTime - holeLastTime;
    if (deltaTime < holeFrameTime) {
        holeAnimationId = requestAnimationFrame(animatehole);
        return;
    }
    
    holeLastTime = currentTime;
    holeTime += 0.008;
    
    holeCtx.clearRect(0, 0, holeCanvas.width, holeCanvas.height);
    
    drawholeStars(holeTime);
    
    holeRotation += holeParams.rotationSpeed * 0.006;
    if (holeRotation > Math.PI * 2) holeRotation -= Math.PI * 2;
    
    drawhole();
    
    holeAnimationId = requestAnimationFrame(animatehole);
}

// Iniciar animación del holea
function startholeAnimation() {
    if (window.innerWidth <= 768) return; // No animar en móviles
    
    if (initholeCanvas()) {
        animatehole();
    }
}

// Detener animación del holea
function stopholeAnimation() {
    if (holeAnimationId) {
        cancelAnimationFrame(holeAnimationId);
        holeAnimationId = null;
    }
}

// Controlar animación basada en la sección visible
function handleholeVisibility() {
    if (!window.navigationControls) return;
    
    const currentState = window.navigationControls.getCurrentState();
    
    if (currentState.currentSection === 1) { // Sección 2 (índice 1)
        startholeAnimation();
    } else {
        stopholeAnimation();
    }
}

// Event listeners
window.addEventListener('resize', () => {
    if (holeInitialized) {
        resizeholeCanvas();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopholeAnimation();
    } else if (window.navigationControls?.getCurrentState().currentSection === 1) {
        startholeAnimation();
    }
});

// Callback personalizado para cambios de sección
window.onSectionChange = function(newIndex, previousIndex) {
    handleholeVisibility();
};

// Inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(handleholeVisibility, 100);
    });
} else {
    setTimeout(handleholeVisibility, 100);
}

// API para control externo
window.holeControls = {
    start: startholeAnimation,
    stop: stopholeAnimation,
    isActive: () => !!holeAnimationId
};