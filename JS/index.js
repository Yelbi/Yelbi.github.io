class CarouselController {
  constructor() {
    this.list = document.querySelector('.carousel__list');
    this.items = document.querySelectorAll('.carousel__item');
    this.progressFill = document.querySelector('.progress-fill');
    this.currentIndex = this.getActiveIndex();
    this.intervalTime = 5000; // 5 segundos
    this.progressValue = 0;
    this.progressInterval = 50; // ms para la barra
    this.autoTimer = null;
    this.progTimer = null;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    // Asegurar que hay un elemento activo
    if (this.currentIndex === -1) {
      this.currentIndex = Math.floor(this.items.length / 2);
      this.activateSlide(this.currentIndex);
    }
    
    this.startAutoSlide();
    this.startProgressBar();
    this.setupItemClick();
    this.setupKeyboardNavigation();
  }

  getActiveIndex() {
    const active = document.querySelector('[data-active]');
    return active ? [...this.items].indexOf(active) : -1;
  }

  activateSlide(idx) {
    if (idx < 0 || idx >= this.items.length || this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Remover data-active de todos los elementos
    this.items.forEach(item => item.removeAttribute('data-active'));
    
    // Activar el nuevo elemento
    const targetItem = this.items[idx];
    if (targetItem) {
      targetItem.setAttribute('data-active', 'true');
      targetItem.focus();
      this.currentIndex = idx;
    }
    
    // Permitir transiciones después de un breve delay
    setTimeout(() => {
      this.isTransitioning = false;
    }, 100);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    // Pausar auto-slide temporalmente
    this.pauseAutoSlide();
    
    // Mover el primer elemento al final
    const first = this.list.firstElementChild;
    this.list.appendChild(first);
    
    // Recalcular el índice activo después del reordenamiento
    const newActiveIndex = this.getActiveIndex();
    if (newActiveIndex !== -1) {
      this.currentIndex = newActiveIndex;
    }
    
    this.resetProgress();
    
    // Reanudar auto-slide
    setTimeout(() => {
      this.startAutoSlide();
    }, 500);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    
    // Pausar auto-slide temporalmente
    this.pauseAutoSlide();
    
    // Mover el último elemento al principio
    const last = this.list.lastElementChild;
    this.list.insertBefore(last, this.list.firstElementChild);
    
    // Recalcular el índice activo después del reordenamiento
    const newActiveIndex = this.getActiveIndex();
    if (newActiveIndex !== -1) {
      this.currentIndex = newActiveIndex;
    }
    
    this.resetProgress();
    
    // Reanudar auto-slide
    setTimeout(() => {
      this.startAutoSlide();
    }, 500);
  }

  startAutoSlide() {
    this.clearTimers();
    this.autoTimer = setInterval(() => this.nextSlide(), this.intervalTime);
  }

  pauseAutoSlide() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  startProgressBar() {
    if (this.progTimer) clearInterval(this.progTimer);
    
    this.progTimer = setInterval(() => {
      this.progressValue += (this.progressInterval / this.intervalTime) * 100;
      if (this.progressValue >= 100) {
        this.progressValue = 0;
      }
      this.progressFill.style.width = `${this.progressValue}%`;
    }, this.progressInterval);
  }

  resetProgress() {
    this.progressValue = 0;
    this.progressFill.style.width = `0%`;
  }

  setupItemClick() {
    this.list.addEventListener('click', (e) => {
      const clickedItem = e.target.closest('.carousel__item');
      if (!clickedItem) return;
      
      const idx = [...this.items].indexOf(clickedItem);
      
      // Determinar rangos visibles basado en el tamaño de pantalla
      const isMobile = window.matchMedia("(max-width: 600px)").matches;
      const visibleStart = isMobile ? 2 : 3;
      const visibleEnd = isMobile ? 6 : 9;
      
      // Solo permitir clicks en elementos visibles
      if (idx < visibleStart || idx > visibleEnd) return;
      
      // Si ya está activo, no hacer nada
      if (clickedItem.hasAttribute('data-active')) return;
      
      // Pausar auto-slide al hacer click manual
      this.pauseAutoSlide();
      
      // Activar el slide clickeado
      this.activateSlide(idx);
      this.resetProgress();
      
      // Reanudar auto-slide después de un delay
      setTimeout(() => {
        this.startAutoSlide();
      }, 1000);
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case ' ': // Spacebar para pausar/reanudar
          e.preventDefault();
          if (this.autoTimer) {
            this.pauseAutoSlide();
          } else {
            this.startAutoSlide();
          }
          break;
      }
    });
  }

  clearTimers() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (this.progTimer) {
      clearInterval(this.progTimer);
      this.progTimer = null;
    }
  }

  // Método para pausar/reanudar manualmente
  toggleAutoSlide() {
    if (this.autoTimer) {
      this.pauseAutoSlide();
    } else {
      this.startAutoSlide();
    }
  }

  // Método de limpieza
  destroy() {
    this.clearTimers();
    this.list.removeEventListener('click', this.setupItemClick);
    document.removeEventListener('keydown', this.setupKeyboardNavigation);
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new CarouselController();
  
  // Hacer disponible globalmente para debugging
  window.carousel = carousel;
  
  // Pausar en hover (opcional)
  const carouselElement = document.querySelector('.carousel');
  if (carouselElement) {
    carouselElement.addEventListener('mouseenter', () => {
      carousel.pauseAutoSlide();
    });
    
    carouselElement.addEventListener('mouseleave', () => {
      carousel.startAutoSlide();
    });
  }
  
  // Manejar cambios de tamaño de ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Recalcular elementos visibles después del resize
      carousel.resetProgress();
    }, 250);
  });
});