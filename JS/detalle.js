// detalle.js
// Script para detalle.php - Versión mejorada
document.addEventListener('DOMContentLoaded', function() {
  console.log('Detalle.js cargado correctamente.');

  // Elementos clave
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const contentCards = document.querySelectorAll('.content-card');
  const navButtons = document.querySelectorAll('.btn-nav, .btn-back');

  // Función para cargar una imagen
  function loadImage(img) {
    // Si ya está cargada, no hacemos nada
    if (img.classList.contains('loaded')) return;
    
    // Si tiene un data-src, lo usamos como fuente
    if (img.dataset.src) {
      img.src = img.dataset.src;
      // Eliminamos el data-src para evitar recargas
      img.removeAttribute('data-src');
    }

    // Cuando la imagen cargue, añadimos la clase 'loaded'
    img.onload = function() {
      img.classList.add('loaded');
    };

    // Manejo de errores
    img.onerror = function() {
      img.classList.add('error');
      // Intentamos usar un placeholder si falla
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC42KSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
    };
  }

  // Observador para lazy loading
  const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        lazyImageObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '100px' });

  // Cargar imágenes críticas de inmediato (retrato y características)
  const criticalImages = document.querySelectorAll('.portrait-image, .characteristics-image img');
  criticalImages.forEach(img => {
    // Configuramos el lazy loading para estas imágenes
    if (!img.classList.contains('loaded')) {
      img.dataset.src = img.src;
      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==';
      lazyImageObserver.observe(img);
    }
  });

  // Configurar lazy loading para imágenes de la galería
  const galleryImages = document.querySelectorAll('.gallery-item img');
  galleryImages.forEach(img => {
    // Guardamos la URL real en data-src
    img.dataset.src = img.src;
    // Reemplazamos con un placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==';
    // Observamos la imagen
    lazyImageObserver.observe(img);
  });

  // Intersection Observer para animaciones de contenido
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  contentCards.forEach((card, idx) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.transitionDelay = `${idx * 0.1}s`;
    observer.observe(card);
  });

  // Parallax y escala en scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        document.body.style.backgroundPosition = `center ${-scrollY * 0.3}px`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Preload imágenes críticas
  const preload = [];
  criticalImages.forEach(img => {
    if (img.dataset.src) preload.push(img.dataset.src);
  });
  preload.slice(0, 3).forEach(src => new Image().src = src);

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      contentCards.forEach(card => {
        card.style.transition = 'none';
        void card.offsetWidth;
        card.style.transition = '';
      });
    }, 200);
  });

  // Keyboard accessibility
  navButtons.forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        btn.click();
      }
    });
  });
  
  galleryItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        const img = item.querySelector('img');
        if (img) openModal(img);
      }
    });
  });

  // Reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.content-card').forEach(card => {
      card.style.transition = 'none';
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }

  // Analytics stub
  if (typeof gtag === 'function') {
    gtag('event', 'page_view', { page_title: document.title, page_location: location.href });
  }
});

function openModal(img) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = 'block';
  modalImg.src = img.src;
  modalImg.alt = img.alt;
  document.body.style.overflow = 'hidden';
  // Añadir clase 'loaded' a la imagen modal
  modalImg.classList.add('loaded');
  modal.focus();
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera de la imagen
document.addEventListener('click', e => {
  const modal = document.getElementById('imageModal');
  if (e.target === modal) closeModal();
});

// Cerrar modal con la tecla Escape
document.addEventListener('keydown', e => {
  const modal = document.getElementById('imageModal');
  if (modal.style.display === 'block' && e.key === 'Escape') closeModal();
});

// Touch enhancements
if ('ontouchstart' in window) {
  document.querySelectorAll('.content-card').forEach(card => {
    card.addEventListener('touchstart', () => card.classList.add('touch-active'), { passive: true });
    card.addEventListener('touchend', () => card.classList.remove('touch-active'), { passive: true });
  });
}

// Función para ajustar tamaños de imágenes en tiempo real
function adjustImageSizes() {
  // Ajustar imágenes principales
  const portraitImages = document.querySelectorAll('.portrait-image');
  portraitImages.forEach(img => {
    const container = img.closest('.hero-portrait');
    if (container) {
      img.style.maxHeight = `${container.clientHeight - 20}px`;
      img.style.maxWidth = `${container.clientWidth - 20}px`;
    }
  });

  // Ajustar imágenes de características
  const characteristicImages = document.querySelectorAll('.characteristics-image img');
  characteristicImages.forEach(img => {
    const container = img.closest('.characteristics-image');
    if (container) {
      img.style.maxHeight = `${container.clientHeight - 20}px`;
      img.style.maxWidth = `${container.clientWidth - 20}px`;
    }
  });

  // Ajustar imágenes de galería
  const galleryImages = document.querySelectorAll('.gallery-item img');
  galleryImages.forEach(img => {
    const container = img.closest('.gallery-item');
    if (container) {
      img.style.maxHeight = `${container.clientHeight - 20}px`;
      img.style.maxWidth = `${container.clientWidth - 20}px`;
    }
  });
}

// Seleccionar todas las imágenes ampliables
const expandableImages = document.querySelectorAll(
  '.portrait-image, .characteristics-image img, .genealogy-image img, .gallery-item img'
);

// Agregar evento de clic a cada imagen
expandableImages.forEach(img => {
  img.addEventListener('click', () => openModal(img));
  
  // Hacer las imágenes enfocables para accesibilidad
  img.setAttribute('tabindex', '0');
  img.setAttribute('role', 'button');
  
  // Permitir abrir con teclado
  img.addEventListener('keydown', e => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      openModal(img);
    }
  });
});

// Ajustar imágenes al cargar y al cambiar tamaño
window.addEventListener('load', adjustImageSizes);
window.addEventListener('resize', adjustImageSizes);