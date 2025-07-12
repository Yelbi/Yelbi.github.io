// detalle.js
// Script para detalle.php
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
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

  // Lazy loading con Intersection Observer
  const imgObserver = new IntersectionObserver((entries, imgObs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const dataSrc = img.dataset.src;
        if (dataSrc) {
          img.src = dataSrc;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        imgObs.unobserve(img);
      }
    });
  }, { rootMargin: '0px 0px 100px 0px' });

  galleryItems.forEach(img => {
    if (img.dataset.src) imgObserver.observe(img);
  });

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
  document.querySelectorAll('.main-image, .masonry-item img').forEach(img => {
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
        e.preventDefault(); btn.click();
      }
    });
  });
  
  document.querySelectorAll('.masonry-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (["Enter", "Space", " "].includes(e.key)) {
        e.preventDefault(); 
        const img = item.querySelector('img');
        if (img) openModal(img);
      }
    });
  });

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

function checkAuthStatus() {
    const token = localStorage.getItem('jwt_token');
    const uploadSection = document.getElementById('uploadSection');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (token) {
        // Verificar token válido
        fetch('https://seres.blog/api/auth.php?action=verify-session', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                if (uploadSection) uploadSection.style.display = 'block';
                if (loginPrompt) loginPrompt.style.display = 'none';
            } else {
                localStorage.removeItem('jwt_token');
                if (uploadSection) uploadSection.style.display = 'none';
                if (loginPrompt) loginPrompt.style.display = 'block';
            }
        });
    } else {
        if (uploadSection) uploadSection.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

// Función para configurar el modal de imágenes
function setupImageModal() {
  // Seleccionar todas las imágenes que deben ser clickeables
  const clickableImages = document.querySelectorAll(
    '.portrait-image, .characteristics-image img, .masonry-item img'
  );

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
    img.setAttribute('aria-label', `${TRANSLATIONS.enlarge_image}: ${img.alt || 'Imagen'}`);
    
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
    return;
  }

  // Configurar la imagen del modal
  modalImg.src = img.src;
  modalImg.alt = img.alt || TRANSLATIONS.enlarged_image;
  
  // Mostrar el modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Focus en el modal para accessibility
  modal.setAttribute('tabindex', '-1');
  modal.focus();

  // Añadir clase para animación
  setTimeout(() => {
    modal.classList.add('modal-open');
  }, 10);
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
  if (modal && modal.style.display === 'block' && e.key === 'Escape') {
    closeModal();
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

const galleryUploadForm = document.getElementById('galleryUploadForm');
if (galleryUploadForm) {
    galleryUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            ser_id: galleryUploadForm.ser_id.value,
            image_url: galleryUploadForm.image_url.value
        };
        
        const statusDiv = document.getElementById('uploadStatus');
        statusDiv.innerHTML = '<div class="loading-spinner small"></div> Enviando...';
        
        try {
            const result = await apiRequest('submit-gallery-image', formData);
            statusDiv.innerHTML = `<div class="success">${result.message}</div>`;
            galleryUploadForm.reset();
            
            // Recargar imágenes aprobadas después de 3 segundos
            setTimeout(() => {
                location.reload();
            }, 3000);
            
        } catch (error) {
            statusDiv.innerHTML = `<div class="error">${error.message}</div>`;
        }
    });
}

// Función para llamadas API
async function apiRequest(action, data) {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
        showLoginPrompt();
        throw new Error('Usuario no autenticado');
    }
    
    try {
        const response = await fetch(`https://seres.blog/api/auth.php?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('jwt_token');
            showLoginPrompt();
            throw new Error('La sesión ha expirado');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error en la solicitud');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showLoginPrompt() {
    const uploadSection = document.getElementById('uploadSection');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (uploadSection) uploadSection.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    
    // Mostrar notificación
    const statusDiv = document.getElementById('uploadStatus');
    if (statusDiv) {
        statusDiv.innerHTML = `<div class="error">Debes iniciar sesión para enviar imágenes</div>`;
    }
}