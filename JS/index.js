class CarouselController {
  constructor() {
    this.list         = document.querySelector('.carousel__list');
    this.items        = document.querySelectorAll('.carousel__item');
    this.progressFill = document.querySelector('.progress-fill');
    this.currentIndex = this.getActiveIndex();
    this.intervalTime = 5000;   // 5 segundos
    this.progressValue = 0;
    this.progressInterval = 50; // ms para la barra

    this.init();
  }

  init() {
    this.startAutoSlide();
    this.startProgressBar();
    this.setupItemClick();
  }

  getActiveIndex() {
    const active = document.querySelector('[data-active]');
    return [...this.items].indexOf(active);
  }

  activateSlide(idx) {
    this.items.forEach(i => i.removeAttribute('data-active'));
    const item = this.items[idx];
    if (item) {
      item.setAttribute('data-active', 'true');
      item.focus();
      this.currentIndex = idx;
    }
  }

  nextSlide() {
    // rotar el primer al final
    const first = this.list.firstElementChild;
    this.list.appendChild(first);
    this.activateSlide(this.currentIndex);
    this.resetProgress();
  }

  startAutoSlide() {
    this.autoTimer = setInterval(() => this.nextSlide(), this.intervalTime);
  }

  startProgressBar() {
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
    this.list.addEventListener('click', e => {
      const li = e.target.closest('.carousel__item');
      if (!li) return;
      const idx = [...this.items].indexOf(li);
      // índices visibles entre 3 y (matches ? 5 : 8)
      const max = window.matchMedia("(max-width: 600px)").matches ? 5 : 8;
      if (idx < 3 || idx > max) return;
      if (idx === max) this.nextSlide();
      else if (idx === 3)   this.prevSlide();
      else {
        this.activateSlide(idx);
        this.resetProgress();
      }
    });
  }

  prevSlide() {
    const last = this.list.lastElementChild;
    this.list.insertBefore(last, this.list.firstElementChild);
    this.activateSlide(this.currentIndex);
    this.resetProgress();
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  new CarouselController();
});
