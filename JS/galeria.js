// Script mejorado para galeria.php
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card');
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  // Configurar Intersection Observer para animaciones
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Solo aplicar efectos adicionales si es necesario
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar cada card para animación escalonada (solo si no están ya animadas por CSS)
  cards.forEach((card, index) => {
    // No modificar la opacidad inicial, dejar que CSS maneje la animación
    observer.observe(card);
  });
  
  // Mejorar efectos de hover
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
      this.style.filter = 'brightness(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
      this.style.filter = 'brightness(1)';
    });
    
    // Touch support para móviles
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    }, { passive: true });
    
    card.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    }, { passive: true });
  });
  
  // Lazy loading mejorado con manejo de errores
  images.forEach(img => {
    const card = img.closest('.card');
    
    // Solo añadir loading si la imagen no está ya cargada
    if (!img.complete) {
      card.classList.add('loading');
    }
    
    img.addEventListener('load', function() {
      this.classList.add('loaded');
      // La imagen ya tiene opacity 0 en CSS, cambiarla a 1
      this.style.opacity = '1';
      card.classList.remove('loading');
    });
    
    // Si la imagen ya está cargada (cache)
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('loaded');
      img.style.opacity = '1';
      card.classList.remove('loading');
    }
    
    img.addEventListener('error', function() {
      // Manejar error de carga de imagen
      this.style.opacity = '0.5';
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
      card.classList.remove('loading');
      console.warn('Error cargando imagen:', this.alt);
    });
  });
  
  // Optimización para scroll
  let ticking = false;
  
  function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    document.body.style.backgroundPosition = `center ${rate}px`;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });
  
  // Preload de imágenes críticas
  const criticalImages = Array.from(images).slice(0, 6);
  criticalImages.forEach(img => {
    const imageLoader = new Image();
    imageLoader.src = img.src;
  });
  
  // Manejo de redimensionamiento de ventana
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalcular posiciones si es necesario
      cards.forEach(card => {
        card.style.transition = 'none';
        card.offsetHeight; // Force reflow
        card.style.transition = '';
      });
    }, 250);
  }, { passive: true });
  
  // Añadir soporte para teclado (accesibilidad)
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  console.log(`Galería inicializada con ${cards.length} cards`);
});