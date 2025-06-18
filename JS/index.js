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
    this.totalItems = this.items.length;

    this.init();
  }

  init() {
    // Asegurar que hay un elemento activo
    if (this.currentIndex === -1) {
      this.currentIndex = 4; // Empezar en el centro aproximadamente
      this.activateSlide(this.currentIndex);
    }
    
    this.startAutoSlide();
    this.startProgressBar();
    this.setupItemClick();
    this.setupKeyboardNavigation();
    this.setupHoverControls();
  }

  getActiveIndex() {
    const items = document.querySelectorAll('.carousel__item');
    for (let i = 0; i < items.length; i++) {
      if (items[i].hasAttribute('data-active')) {
        return i;
      }
    }
    return -1;
  }

  activateSlide(newIndex) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Obtener todos los elementos actuales (después de posibles rotaciones)
    const currentItems = document.querySelectorAll('.carousel__item');
    
    // Remover data-active de todos los elementos
    currentItems.forEach(item => item.removeAttribute('data-active'));
    
    // Activar el nuevo elemento
    if (currentItems[newIndex]) {
      currentItems[newIndex].setAttribute('data-active', 'true');
      this.currentIndex = newIndex;
    }
    
    this.resetProgress();
    
    // Permitir nuevas transiciones después de un delay
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    // Rotar físicamente: mover el primer elemento al final
    const first = this.list.firstElementChild;
    this.list.appendChild(first);
    
    // Mantener el mismo índice visual activo (el elemento que estaba activo sigue activo)
    // pero ahora está en una posición diferente en el DOM
    this.activateSlide(this.currentIndex);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    
    // Rotar físicamente: mover el último elemento al principio
    const last = this.list.lastElementChild;
    this.list.insertBefore(last, this.list.firstElementChild);
    
    // Mantener el mismo índice visual activo
    this.activateSlide(this.currentIndex);
  }

  // Método para activar un slide específico por click
  activateSlideByClick(targetIndex) {
    if (this.isTransitioning) return;
    
    this.pauseAutoSlide();
    this.activateSlide(targetIndex);
    
    // Reanudar auto-slide después de un delay
    setTimeout(() => {
      this.startAutoSlide();
    }, 2000);
  }

  startAutoSlide() {
    this.clearAutoTimer();
    this.autoTimer = setInterval(() => this.nextSlide(), this.intervalTime);
  }

  pauseAutoSlide() {
    this.clearAutoTimer();
  }

  clearAutoTimer() {
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
      
      // Obtener el índice actual del elemento clickeado
      const currentItems = document.querySelectorAll('.carousel__item');
      const clickedIndex = [...currentItems].indexOf(clickedItem);
      
      // Determinar si el elemento está en el rango visible y clickeable
      const isMobile = window.matchMedia("(max-width: 600px)").matches;
      const centerIndex = isMobile ? 4 : 4; // El índice central visible
      const clickableRange = isMobile ? [3, 4, 5] : [3, 4, 5, 6, 7]; // Índices clickeables
      
      if (!clickableRange.includes(clickedIndex)) return;
      
      // Si se clickea un elemento adyacente, activarlo
      if (clickedIndex !== this.currentIndex) {
        this.activateSlideByClick(clickedIndex);
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.pauseAutoSlide();
          this.prevSlide();
          setTimeout(() => this.startAutoSlide(), 1000);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.pauseAutoSlide();
          this.nextSlide();
          setTimeout(() => this.startAutoSlide(), 1000);
          break;
        case ' ': // Spacebar para pausar/reanudar
          e.preventDefault();
          this.toggleAutoSlide();
          break;
      }
    });
  }

  setupHoverControls() {
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', () => {
        this.pauseAutoSlide();
      });
      
      carouselElement.addEventListener('mouseleave', () => {
        this.startAutoSlide();
      });
    }
  }

  toggleAutoSlide() {
    if (this.autoTimer) {
      this.pauseAutoSlide();
    } else {
      this.startAutoSlide();
    }
  }

  clearAllTimers() {
    this.clearAutoTimer();
    if (this.progTimer) {
      clearInterval(this.progTimer);
      this.progTimer = null;
    }
  }

  destroy() {
    this.clearAllTimers();
    // Remover event listeners si es necesario
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new CarouselController();
  
  // Hacer disponible globalmente para debugging
  window.carousel = carousel;
  
  // Manejar cambios de tamaño de ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      carousel.resetProgress();
    }, 250);
  });

  // Debug: Mostrar información del slide activo
  console.log('Carousel initialized. Current active index:', carousel.currentIndex);
});