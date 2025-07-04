// detalle.js
// Script para detalle.php
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const galleryItems = document.querySelectorAll('.masonry-item img');
  const contentCards = document.querySelectorAll('.content-card');
  const navButtons = document.querySelectorAll('.btn-nav, .btn-back');

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

  // Configurar la galería Pinterest mejorada
  setupPinterestGallery();

  // Parallax y escala en scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        document.body.style.backgroundPosition = `center ${-scrollY * 0.3}px`;
        const heroImg = document.querySelector('.hero-section .main-image');
        if (heroImg) {
          heroImg.style.transform = `scale(${1 + scrollY / 2000})`;
        }
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
  document.querySelectorAll('.main-image, .portrait-image').forEach(img => {
    if (img.src) preload.push(img.src);
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
      if (["Enter", "Space", " "].includes(e.key)) {
        e.preventDefault(); 
        btn.click();
      }
    });
  });

  // Error handling para imágenes de características
  document.querySelectorAll('.characteristics-image img').forEach(img => {
    img.addEventListener('error', function() {
      const grid = this.closest('.characteristics-grid');
      if (grid) {
        grid.classList.add('single-column');
        this.remove();
      }
    });
  });

  // Hacer todas las imágenes clickeables para el modal
  setupImageModal();

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

function setupPinterestGallery() {
  const galleryItems = document.querySelectorAll('.masonry-item');
  
  console.log('Configurando galería Pinterest, items encontrados:', galleryItems.length);
  
  // Lazy loading mejorado para galería
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const img = item.querySelector('img');
        
        console.log('Item visible:', item, 'Imagen:', img);
        
        if (img) {
          const dataSrc = img.dataset.src;
          console.log('data-src:', dataSrc);
          
          if (dataSrc) {
            // Mostrar indicador de carga
            item.classList.add('loading');
            
            // Crear imagen temporal para precargar
            const tempImg = new Image();
            tempImg.onload = () => {
              console.log('Imagen cargada exitosamente:', dataSrc);
              img.src = dataSrc;
              img.removeAttribute('data-src');
              item.classList.remove('loading');
              img.classList.add('loaded');
              
              // Mostrar imagen
              img.style.opacity = '1';
              
              // Añadir animación de entrada
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, 100);
            };
            
            tempImg.onerror = () => {
              console.error('Error al cargar imagen:', dataSrc);
              item.classList.remove('loading');
              // En lugar de ocultar, mostrar placeholder
              img.src = '/Img/placeholder.jpg'; // Asegurate de tener esta imagen
              img.alt = 'Imagen no disponible';
              img.style.opacity = '0.5';
              item.style.opacity = '1';
            };
            
            tempImg.src = dataSrc;
          } else if (img.src) {
            // Si ya tiene src, solo mostrar
            console.log('Imagen ya tiene src:', img.src);
            img.style.opacity = '1';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }
        }
        
        galleryObserver.unobserve(item);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
  
  // Configurar cada item de la galería
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    
    if (img) {
      console.log(`Configurando item ${index}:`, img);
      
      // Configurar estilos iniciales
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      // Añadir delay escalonado para animaciones
      item.style.animationDelay = `${index * 0.1}s`;
      
      // Mejorar accesibilidad
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Ver imagen ampliada: ${img.alt || 'Imagen de galería'}`);
      
      // Event listeners mejorados
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // Usar la imagen src actual, no data-src
        const imgToShow = img.src || img.dataset.src;
        if (imgToShow) {
          openModal(img);
        }
      });
      
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const imgToShow = img.src || img.dataset.src;
          if (imgToShow) {
            openModal(img);
          }
        }
      });
      
      // Efecto hover mejorado
      item.addEventListener('mouseenter', () => {
        item.style.zIndex = '10';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.zIndex = '1';
      });
      
      // Observar para lazy loading
      galleryObserver.observe(item);
    }
  });
  
  // Reorganizar galería dinámicamente
  setTimeout(() => {
    reorganizeGallery();
  }, 100);
  
  // Reorganizar en resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(reorganizeGallery, 300);
  });
}

// NUEVA FUNCIÓN: Reorganizar galería dinámicamente
function reorganizeGallery() {
  const gallery = document.querySelector('.masonry-gallery');
  const items = document.querySelectorAll('.masonry-item');
  
  if (!gallery || items.length === 0) return;
  
  // Resetear alturas dinámicas
  items.forEach(item => {
    item.style.gridRowEnd = 'auto';
  });
  
  // Aplicar nuevas alturas basadas en contenido
  setTimeout(() => {
    items.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img && (img.complete || img.naturalWidth > 0)) {
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        
        // Calcular spans basado en aspect ratio
        let spans = 1;
        if (aspectRatio > 1.5) spans = 3;
        else if (aspectRatio > 1.2) spans = 2;
        else if (aspectRatio < 0.7) spans = 1;
        
        // Añadir variación aleatoria para efecto Pinterest
        const variation = Math.floor(Math.random() * 2);
        spans += variation;
        
        item.style.gridRowEnd = `span ${Math.max(1, spans)}`;
      }
    });
  }, 100);
}

// Función para configurar el modal de imágenes
function setupImageModal() {
  // Seleccionar todas las imágenes que deben ser clickeables
  const clickableImages = document.querySelectorAll(
    '.portrait-image, .characteristics-image img, .masonry-item img'
  );

  console.log('Configurando modal para', clickableImages.length, 'imágenes');

  clickableImages.forEach(img => {
    // Hacer la imagen clickeable
    img.style.cursor = 'pointer';
    
    // Añadir event listener para click
    img.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openModal(this);
    });

    // Añadir accessibility
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Ampliar imagen: ${img.alt || 'Imagen'}`);
    
    // Keyboard support
    img.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(this);
      }
    });
  });
}

function openModal(img) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  if (!modal || !modalImg) {
    console.error('Modal o modalImage no encontrados');
    return;
  }
  
  // Encontrar todas las imágenes de la galería
  const galleryImages = Array.from(document.querySelectorAll('.masonry-item img'));
  const currentIndex = galleryImages.indexOf(img);
  
  console.log('Abriendo modal para imagen:', img.src || img.dataset.src);
  
  // Configurar la imagen del modal
  const imgSrc = img.src || img.dataset.src;
  if (imgSrc) {
    modalImg.src = imgSrc;
    modalImg.alt = img.alt || 'Imagen ampliada';
    modalImg.dataset.currentIndex = currentIndex;
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Añadir navegación con teclado
    modal.setAttribute('tabindex', '-1');
    modal.focus();
    
    // Animación de entrada
    setTimeout(() => {
      modal.classList.add('modal-open');
    }, 10);
    
    // Añadir controles de navegación si hay múltiples imágenes
    if (galleryImages.length > 1) {
      addModalNavigation(galleryImages, currentIndex);
    }
  }
}

function addModalNavigation(images, currentIndex) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  // Remover controles existentes
  const existingControls = modal.querySelectorAll('.modal-nav');
  existingControls.forEach(control => control.remove());
  
  // Crear controles de navegación
  if (images.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'modal-nav modal-prev';
    prevBtn.innerHTML = '❮';
    prevBtn.setAttribute('aria-label', 'Imagen anterior');
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'modal-nav modal-next';
    nextBtn.innerHTML = '❯';
    nextBtn.setAttribute('aria-label', 'Imagen siguiente');
    
    // Añadir event listeners
    prevBtn.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      const newImg = images[newIndex];
      const newImgSrc = newImg.src || newImg.dataset.src;
      if (newImgSrc) {
        modalImg.src = newImgSrc;
        modalImg.alt = newImg.alt || 'Imagen ampliada';
        modalImg.dataset.currentIndex = newIndex;
        currentIndex = newIndex;
      }
    });
    
    nextBtn.addEventListener('click', () => {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      const newImg = images[newIndex];
      const newImgSrc = newImg.src || newImg.dataset.src;
      if (newImgSrc) {
        modalImg.src = newImgSrc;
        modalImg.alt = newImg.alt || 'Imagen ampliada';
        modalImg.dataset.currentIndex = newIndex;
        currentIndex = newIndex;
      }
    });
    
    modal.appendChild(prevBtn);
    modal.appendChild(nextBtn);
  }
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  
  if (!modal) return;
  
  // Remover clase de animación
  modal.classList.remove('modal-open');
  
  // Ocultar el modal después de la animación
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

// Event listeners para cerrar el modal
document.addEventListener('click', e => {
  const modal = document.getElementById('imageModal');
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', e => {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  
  if (modal && modal.style.display === 'block') {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const galleryImages = Array.from(document.querySelectorAll('.masonry-item img'));
      const currentIndex = parseInt(modalImg.dataset.currentIndex) || 0;
      
      if (galleryImages.length > 1) {
        let newIndex;
        if (e.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
        } else {
          newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        }
        
        const newImg = galleryImages[newIndex];
        const newImgSrc = newImg.src || newImg.dataset.src;
        if (newImgSrc) {
          modalImg.src = newImgSrc;
          modalImg.alt = newImg.alt || 'Imagen ampliada';
          modalImg.dataset.currentIndex = newIndex;
        }
      }
    }
  }
});

// Prevenir scroll del body cuando el modal está abierto
document.addEventListener('wheel', e => {
  const modal = document.getElementById('imageModal');
  if (modal && modal.style.display === 'block') {
    e.preventDefault();
  }
}, { passive: false });

// Touch enhancements
if ('ontouchstart' in window) {
  document.querySelectorAll('.content-card').forEach(card => {
    card.addEventListener('touchstart', () => card.classList.add('touch-active'), { passive: true });
    card.addEventListener('touchend', () => card.classList.remove('touch-active'), { passive: true });
  });

  // Soporte para gestos en el modal
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', e => {
    const modal = document.getElementById('imageModal');
    if (modal && modal.style.display === 'block') {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const modal = document.getElementById('imageModal');
    if (modal && modal.style.display === 'block') {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Si es un swipe vertical hacia abajo, cerrar modal
      if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
        closeModal();
      }
    }
  }, { passive: true });
}

const modalStyles = `
.modal-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 20px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border-radius: 50%;
  z-index: 1001;
}

.modal-prev {
  left: 30px;
}

.modal-next {
  right: 30px;
}

.modal-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.modal-nav:focus {
  outline: 2px solid rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .modal-nav {
    font-size: 1.5rem;
    padding: 15px 12px;
  }
  
  .modal-prev {
    left: 15px;
  }
  
  .modal-next {
    right: 15px;
  }
}
`;

// Añadir estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);