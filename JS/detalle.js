// Script para detalle.php
document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const contentCards = document.querySelectorAll('.content-card');
  const navButtons = document.querySelectorAll('.btn-nav, .btn-back');
  
  // Configurar Intersection Observer para animaciones
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar cards de contenido para animación
  contentCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
  
  // Lazy loading para imágenes de galería
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });
  
  galleryItems.forEach(img => {
    imageObserver.observe(img);
  });
  
  // Manejo de errores de carga de imágenes
  const handleImageError = (img) => {
    img.style.opacity = '0.5';
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEyNSIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
    console.warn('Error cargando imagen de galería');
  };
  
  // Aplicar manejo de errores a todas las imágenes
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
  });
  
  // Efectos de scroll suave para navegación interna
  const smoothScroll = (target) => {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // Optimización de scroll para efectos de parallax
  let ticking = false;
  
  const updateScrollEffects = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    
    // Efecto parallax sutil en el fondo
    document.body.style.backgroundPosition = `center ${rate}px`;
    
    // Efecto en la imagen principal
    const heroImage = document.querySelector('.main-image');
    if (heroImage) {
      const heroSection = document.querySelector('.hero-section');
      const rect = heroSection.getBoundingClientRect();
      const scrollPercent = Math.max(0, Math.min(1, 1 - (rect.bottom / window.innerHeight)));
      heroImage.style.transform = `scale(${1 + scrollPercent * 0.1})`;
    }
    
    ticking = false;
  };
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });
  
  // Precargar imágenes críticas
  const preloadCriticalImages = () => {
    const criticalImages = [
      document.querySelector('.main-image')?.src,
      ...Array.from(galleryItems).slice(0, 3).map(img => img.src)
    ].filter(Boolean);
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  };
  
  preloadCriticalImages();
  
  // Manejo de redimensionamiento de ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalcular posiciones de elementos si es necesario
      contentCards.forEach(card => {
        card.style.transition = 'none';
        card.offsetHeight; // Force reflow
        card.style.transition = '';
      });
    }, 250);
  }, { passive: true });
  
  // Accesibilidad: navegación con teclado
  navButtons.forEach(button => {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
  
  // Accesibilidad para galería de imágenes
  galleryItems.forEach(img => {
    const galleryItem = img.parentElement;
    galleryItem.setAttribute('tabindex', '0');
    galleryItem.setAttribute('role', 'button');
    galleryItem.setAttribute('aria-label', `Ver imagen: ${img.alt}`);
    
    galleryItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(img);
      }
    });
  });
  
  // Detectar si el usuario prefiere movimiento reducido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Deshabilitar animaciones para usuarios que prefieren movimiento reducido
    document.querySelectorAll('.content-card').forEach(card => {
      card.style.animation = 'none';
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }
  
  // Analytics y tracking (opcional)
  const trackPageView = () => {
    const serName = document.querySelector('.ser-title')?.textContent;
    if (serName && typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: serName,
        page_location: window.location.href
      });
    }
  };
  
  trackPageView();
  
  console.log('Página de detalle inicializada correctamente');
});

// Funciones del modal (globales para uso desde HTML)
function openModal(img) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  if (modal && modalImg) {
    modal.style.display = 'block';
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    
    // Focus en el modal para accesibilidad
    modal.focus();
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    
    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
  }
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Cerrar modal haciendo clic fuera de la imagen
document.addEventListener('click', (e) => {
  const modal = document.getElementById('imageModal');
  if (e.target === modal) {
    closeModal();
  }
});

// Navegación con teclado en el modal
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('imageModal');
  if (modal && modal.style.display === 'block') {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
});

// Optimización para dispositivos táctiles
if ('ontouchstart' in window) {
  // Mejoras para dispositivos táctiles
  document.querySelectorAll('.content-card').forEach(card => {
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-3px)';
    }, { passive: true });
    
    card.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    }, { passive: true });
  });
}