// detalle.js
// Script para detalle.php
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const galleryItems = document.querySelectorAll('.gallery-item img');
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

  // Error loading image fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      // Solo añade clases sin cambiar el src
      this.classList.add('error', 'broken-image');
    
      // Opcional: añadir texto alternativo
      const altText = this.alt || 'Imagen no disponible';
      this.after(document.createTextNode(altText));
    });
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
  document.querySelectorAll('.main-image, .gallery-item img').forEach(img => {
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

  document.querySelectorAll('.genealogy-image img').forEach(img => {
    img.addEventListener('error', function() {
        const section = this.closest('.genealogy-section');
        if (section) {
            section.remove();
        }
    });
  });

  // Keyboard accessibility
  navButtons.forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (["Enter", "Space", " "].includes(e.key)) {
        e.preventDefault(); btn.click();
      }
    });
  });
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (["Enter", "Space", " "].includes(e.key)) {
        e.preventDefault(); openModal(item.querySelector('img'));
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

  console.log('Detalle.js cargado correctamente.');
});

function openModal(img) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = 'block';
  modalImg.src = img.src;
  modalImg.alt = img.alt;
  document.body.style.overflow = 'hidden';
  modal.focus();
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const modal = document.getElementById('imageModal');
  if (e.target === modal) closeModal();
});

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
