/**
 * Galería Responsiva Optimizada - Sistema de filtros y visualización adaptativa
 * @version 2.0.0
 * @description Sistema modular optimizado para rendimiento y accesibilidad
 */

class ResponsiveGallery {
  constructor() {
    this.elements = this.initializeElements();
    this.deviceInfo = this.detectDevice();
    this.config = this.generateConfig();
    this.state = this.initializeState();
    this.observers = new Map();
    this.timers = new Map();
    
    this.init();
  }

  // === INICIALIZACIÓN DE ELEMENTOS ===
  initializeElements() {
    const elements = {};
    const selectors = {
      cards: '.card',
      images: 'img[loading="lazy"]',
      searchInput: '#searchInput',
      tipoFilter: '#tipoFilter',
      regionFilter: '#regionFilter',
      clearFiltersBtn: '#clearFilters',
      toggleFiltersBtn: '#toggleFilters',
      resultsCount: '#resultsCount',
      noResults: '#noResults',
      filterPanel: '.filter-panel',
      galeriaGrid: '#galeriaGrid'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      if (key === 'cards' || key === 'images') {
        elements[key] = document.querySelectorAll(selector);
      } else {
        elements[key] = document.getElementById(selector.slice(1)) || document.querySelector(selector);
      }
    }

    return elements;
  }

  // === DETECCIÓN DE DISPOSITIVO OPTIMIZADA ===
  detectDevice() {
    const width = window.innerWidth;
    const connection = navigator.connection;
    
    const deviceInfo = {
      isMobile: width <= 767,
      isTablet: width >= 768 && width <= 1199,
      isDesktop: width >= 1200,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      supportsHover: window.matchMedia('(hover: hover)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isLowPerformance: this.detectLowPerformance(),
      isSlowConnection: connection && (connection.saveData || 
                       connection.effectiveType.includes('2g')),
      viewport: { width, height: window.innerHeight }
    };

    return deviceInfo;
  }

  detectLowPerformance() {
    try {
      // Detectar GPU de bajo rendimiento
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        const isLowEndGPU = /Mali|PowerVR|Adreno [23]/.test(renderer);
        canvas.remove();
        return isLowEndGPU;
      }
    } catch (e) {
      return true;
    }
    
    // Heurística adicional basada en memoria
    return navigator.deviceMemory && navigator.deviceMemory < 4;
  }

  // === CONFIGURACIÓN ADAPTATIVA ===
  generateConfig() {
    const { isMobile, isLowPerformance, prefersReducedMotion, isSlowConnection } = this.deviceInfo;
    
    return {
      // Timeouts optimizados
      searchDebounce: isMobile ? 400 : 300,
      animationDelay: isLowPerformance ? 0 : (isMobile ? 30 : 50),
      resizeDebounce: 250,

      // Thresholds de intersección
      intersectionThreshold: isMobile ? 0.05 : 0.1,
      lazyLoadMargin: isMobile ? '50px' : '100px',

      // Configuración de características
      enableAnimations: !prefersReducedMotion && !isLowPerformance,
      enableHoverEffects: this.deviceInfo.supportsHover && !this.deviceInfo.isTouchDevice,
      enableParallax: this.deviceInfo.isDesktop && !isLowPerformance,
      
      // Preload adaptativo
      preloadCount: isSlowConnection ? 2 : (isMobile ? 4 : 8),
      
      // Batch processing
      filterBatchSize: isLowPerformance ? 5 : 10
    };
  }

  // === ESTADO INICIAL ===
  initializeState() {
    return {
      filters: { search: '', tipo: '', region: '' },
      isFilterPanelVisible: !this.deviceInfo.isMobile,
      lastScrollY: 0,
      visibleCards: 0,
      isProcessing: false
    };
  }

  // === SISTEMA DE FILTROS OPTIMIZADO ===
  async applyFilters() {
    if (this.state.isProcessing) return;
    
    this.state.isProcessing = true;
    let visibleCount = 0;

    // Procesar en lotes para mejor rendimiento
    const cards = Array.from(this.elements.cards);
    const batchSize = this.config.filterBatchSize;
    
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          batch.forEach((card, batchIndex) => {
            const isVisible = this.evaluateCardFilters(card);
            
            if (isVisible) {
              this.showCard(card, i + batchIndex);
              visibleCount++;
            } else {
              this.hideCard(card);
            }
          });
          resolve();
        });
      });
    }

    this.updateResultsDisplay(visibleCount);
    this.updateURL();
    this.state.isProcessing = false;
  }

  evaluateCardFilters(card) {
    const { search, tipo, region } = this.state.filters;
    const cardData = {
      nombre: (card.dataset.nombre || '').toLowerCase(),
      tipo: card.dataset.tipo || '',
      region: card.dataset.region || ''
    };

    return (
      (!search || cardData.nombre.includes(search.toLowerCase())) &&
      (!tipo || cardData.tipo === tipo) &&
      (!region || cardData.region === region)
    );
  }

  showCard(card, index) {
    card.style.display = 'block';
    card.classList.remove('filtering-hide');
    card.classList.add('filtering-show');

    if (this.config.enableAnimations) {
      const delay = index * this.config.animationDelay;
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, delay);
    } else {
      card.style.opacity = '1';
      card.style.transform = 'none';
    }
  }

  hideCard(card) {
    card.classList.remove('filtering-show');
    card.classList.add('filtering-hide');

    const hideTimeout = this.config.enableAnimations ? 300 : 0;
    this.timers.set(`hide-${card.dataset.id}`, setTimeout(() => {
      if (card.classList.contains('filtering-hide')) {
        card.style.display = 'none';
      }
    }, hideTimeout));
  }

  updateResultsDisplay(count) {
    this.state.visibleCards = count;
    
    if (this.elements.resultsCount) {
      this.elements.resultsCount.textContent = count;
    }

    if (this.elements.noResults && this.elements.galeriaGrid) {
      this.elements.noResults.style.display = count === 0 ? 'block' : 'none';
      this.elements.galeriaGrid.style.opacity = count === 0 ? '0.3' : '1';
    }
  }

  // === EVENT LISTENERS OPTIMIZADOS ===
  setupEventListeners() {
    this.setupSearchInput();
    this.setupFilterSelects();
    this.setupClearButton();
    this.setupToggleButton();
    this.setupKeyboardShortcuts();
    this.setupResizeHandler();
    this.setupScrollHandler();
  }

  setupSearchInput() {
    if (!this.elements.searchInput) return;

    const debouncedSearch = this.debounce((value) => {
      this.state.filters.search = value.trim();
      this.applyFilters();
    }, this.config.searchDebounce);

    this.elements.searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    // Optimización para móviles
    if (this.deviceInfo.isMobile) {
      this.elements.searchInput.addEventListener('focus', () => {
        setTimeout(() => {
          this.elements.searchInput.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300);
      });
    }
  }

  setupFilterSelects() {
    const filterMap = {
      tipoFilter: 'tipo',
      regionFilter: 'region'
    };

    Object.entries(filterMap).forEach(([elementKey, filterKey]) => {
      const element = this.elements[elementKey];
      if (!element) return;

      element.addEventListener('change', (e) => {
        this.state.filters[filterKey] = e.target.value;
        this.applyFilters();
      });

      // Efectos táctiles para móviles
      if (this.deviceInfo.isTouchDevice) {
        this.addTouchFeedback(element);
      }
    });
  }

  setupClearButton() {
    if (!this.elements.clearFiltersBtn) return;

    this.elements.clearFiltersBtn.addEventListener('click', () => {
      this.clearAllFilters();
      this.addClickFeedback(this.elements.clearFiltersBtn);
    });
  }

  setupToggleButton() {
    if (!this.elements.toggleFiltersBtn || !this.elements.filterPanel) return;

    this.elements.toggleFiltersBtn.addEventListener('click', () => {
      this.toggleFilterPanel();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K para búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && this.elements.searchInput) {
        e.preventDefault();
        this.focusSearch();
      }

      // Escape para limpiar o cerrar
      if (e.key === 'Escape') {
        if (document.activeElement === this.elements.searchInput) {
          this.elements.searchInput.blur();
          if (this.deviceInfo.isMobile) {
            this.collapseFilterPanel();
          }
        } else {
          this.clearAllFilters();
        }
      }
    });
  }

  setupResizeHandler() {
    const debouncedResize = this.debounce(() => {
      this.handleResize();
    }, this.config.resizeDebounce);

    window.addEventListener('resize', debouncedResize, { passive: true });
  }

  setupScrollHandler() {
    if (this.deviceInfo.isLowPerformance) return;

    const throttledScroll = this.throttle(() => {
      this.handleScroll();
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScroll, { passive: true });
  }

  // === INTERACCIONES DE TARJETAS ===
  setupCardInteractions() {
    this.elements.cards.forEach((card, index) => {
      // Accesibilidad
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver detalles de ${card.dataset.nombre}`);

      // Efectos de hover
      if (this.config.enableHoverEffects) {
        this.addHoverEffects(card);
      }

      // Efectos táctiles
      if (this.deviceInfo.isTouchDevice) {
        this.addTouchEffects(card);
      }

      // Navegación por teclado
      this.addKeyboardNavigation(card);
    });
  }

  addHoverEffects(card) {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
      if (this.config.enableAnimations) {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.filter = 'brightness(1.05)';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '1';
      card.style.transform = '';
      card.style.filter = '';
    });
  }

  addTouchEffects(card) {
    let touchStart = 0;

    card.addEventListener('touchstart', () => {
      touchStart = Date.now();
      if (this.config.enableAnimations) {
        card.style.transform = 'scale(0.98)';
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      const touchDuration = Date.now() - touchStart;
      
      if (touchDuration < 200 && this.config.enableAnimations) {
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      } else {
        card.style.transform = '';
      }
    }, { passive: true });

    card.addEventListener('touchmove', () => {
      card.style.transform = '';
    }, { passive: true });
  }

  addKeyboardNavigation(card) {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
        
        if (this.config.enableAnimations) {
          card.style.transform = 'scale(0.98)';
          setTimeout(() => {
            card.style.transform = '';
          }, 100);
        }
      }
    });
  }

  // === LAZY LOADING OPTIMIZADO ===
  setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.lazyLoadMargin,
      threshold: 0.01
    });

    this.observers.set('images', imageObserver);

    this.elements.images.forEach((img, index) => {
      // Preload imágenes críticas
      if (index < this.config.preloadCount) {
        img.loading = 'eager';
        this.loadImage(img);
      } else {
        imageObserver.observe(img);
      }
    });
  }

  loadImage(img) {
    const card = img.closest('.card');
    
    if (card) {
      card.classList.add('loading');
    }

    img.addEventListener('load', () => {
      img.classList.add('loaded');
      img.style.opacity = '1';
      if (card) card.classList.remove('loading');
    }, { once: true });

    img.addEventListener('error', () => {
      this.handleImageError(img, card);
    }, { once: true });

    // Si ya está cargada
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('loaded');
      img.style.opacity = '1';
      if (card) card.classList.remove('loading');
    }
  }

  handleImageError(img, card) {
    img.style.opacity = '0.5';
    img.src = this.generatePlaceholderSVG();
    if (card) card.classList.remove('loading');
    console.warn('Error cargando imagen:', img.alt);
  }

  generatePlaceholderSVG() {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <path d="M85 85h30v30H85z" fill="#d1d5db"/>
        <text x="100" y="130" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">
          Imagen no disponible
        </text>
      </svg>
    `);
  }

  // === GESTIÓN DE ESTADO Y UTILIDADES ===
  clearAllFilters() {
    this.state.filters = { search: '', tipo: '', region: '' };
    
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.tipoFilter) this.elements.tipoFilter.value = '';
    if (this.elements.regionFilter) this.elements.regionFilter.value = '';
    
    this.applyFilters();
  }

  toggleFilterPanel() {
    if (!this.elements.filterPanel) return;

    const isCollapsed = this.elements.filterPanel.classList.contains('collapsed');
    this.elements.filterPanel.classList.toggle('collapsed');
    this.state.isFilterPanelVisible = isCollapsed;
    
    this.updateToggleButton(!isCollapsed);
    this.addHapticFeedback();
  }

  updateToggleButton(collapsed) {
    if (!this.elements.toggleFiltersBtn) return;

    const icon = this.elements.toggleFiltersBtn.querySelector('i');
    const textContent = collapsed ? ' Mostrar Filtros' : ' Ocultar Filtros';
    
    if (icon) {
      icon.className = collapsed ? 'fi fi-rr-angle-down' : 'fi fi-rr-angle-up';
    }
    
    // Actualizar texto preservando el ícono
    const textNode = Array.from(this.elements.toggleFiltersBtn.childNodes)
      .find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = textContent;
    }
  }

  handleResize() {
    const oldDeviceInfo = { ...this.deviceInfo };
    this.deviceInfo = this.detectDevice();
    
    // Reconfigurar si cambió el tipo de dispositivo
    if (oldDeviceInfo.isMobile !== this.deviceInfo.isMobile) {
      this.config = this.generateConfig();
      
      if (this.deviceInfo.isMobile && this.state.isFilterPanelVisible) {
        this.collapseFilterPanel();
      }
    }
  }

  handleScroll() {
    const scrollY = window.pageYOffset;
    const scrollingDown = scrollY > this.state.lastScrollY;
    
    // Auto-colapsar filtros en móvil al hacer scroll
    if (this.deviceInfo.isMobile && scrollingDown && 
        this.state.isFilterPanelVisible && scrollY > 200) {
      this.collapseFilterPanel();
    }

    // Efecto parallax en desktop
    if (this.config.enableParallax) {
      const rate = scrollY * -0.2;
      document.body.style.backgroundPosition = `center ${rate}px`;
    }

    this.state.lastScrollY = scrollY;
  }

  // === URL STATE MANAGEMENT ===
  updateURL() {
    if (!window.history?.replaceState) return;

    const params = new URLSearchParams();
    const { search, tipo, region } = this.state.filters;
    
    if (search) params.set('search', search);
    if (tipo) params.set('tipo', tipo);
    if (region) params.set('region', region);

    const newURL = window.location.pathname + 
                  (params.toString() ? '?' + params.toString() : '');
    
    window.history.replaceState({}, '', newURL);
  }

  loadFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      ['search', 'tipo', 'region'].forEach(key => {
        if (params.has(key)) {
          this.state.filters[key] = params.get(key);
          
          const elementMap = {
            search: 'searchInput',
            tipo: 'tipoFilter',
            region: 'regionFilter'
          };
          
          const element = this.elements[elementMap[key]];
          if (element) {
            element.value = this.state.filters[key];
          }
        }
      });

      // Aplicar filtros si hay alguno activo
      if (Object.values(this.state.filters).some(value => value)) {
        this.applyFilters();
      }
    } catch (error) {
      console.warn('Error loading filters from URL:', error);
    }
  }

  // === UTILIDADES DE FEEDBACK ===
  addTouchFeedback(element) {
    element.addEventListener('touchstart', () => {
      if (this.config.enableAnimations) {
        element.style.transform = 'scale(0.98)';
      }
    }, { passive: true });

    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.style.transform = '';
      }, 150);
    }, { passive: true });
  }

  addClickFeedback(element) {
    if (this.config.enableAnimations) {
      element.style.transform = 'scale(0.95)';
      setTimeout(() => {
        element.style.transform = '';
      }, 150);
    }
    this.addHapticFeedback();
  }

  addHapticFeedback(intensity = 50) {
    if ('vibrate' in navigator && this.deviceInfo.isTouchDevice) {
      navigator.vibrate(intensity);
    }
  }

  // === UTILIDADES GENERALES ===
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // === MÉTODOS DE UTILIDAD ===
  focusSearch() {
    if (this.elements.searchInput) {
      this.elements.searchInput.focus();
      if (this.deviceInfo.isMobile && 
          this.elements.filterPanel?.classList.contains('collapsed')) {
        this.toggleFilterPanel();
      }
    }
  }

  collapseFilterPanel() {
    if (this.elements.filterPanel) {
      this.elements.filterPanel.classList.add('collapsed');
      this.state.isFilterPanelVisible = false;
      this.updateToggleButton(true);
    }
  }

  // === CLEANUP Y GESTIÓN DE MEMORIA ===
  cleanup() {
    // Limpiar observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Limpiar timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Remover transiciones para evitar animaciones en cleanup
    this.elements.cards.forEach(card => {
      card.style.transition = 'none';
    });
  }

  // === INICIALIZACIÓN PRINCIPAL ===
  init() {
    try {
      this.loadFiltersFromURL();
      this.setupEventListeners();
      this.setupCardInteractions();
      this.setupLazyLoading();
      
      // Setup de cleanup automático
      window.addEventListener('beforeunload', () => this.cleanup());
      
      console.log('Galería responsiva inicializada:', {
        cards: this.elements.cards.length,
        device: this.deviceInfo,
        config: this.config
      });
    } catch (error) {
      console.error('Error inicializando galería:', error);
    }
  }
}

// === INICIALIZACIÓN AUTOMÁTICA ===
document.addEventListener('DOMContentLoaded', () => {
  window.galleryInstance = new ResponsiveGallery();
});

// === FUNCIÓN PARA ACCESO EXTERNO ===
window.GalleryAPI = {
  getInstance: () => window.galleryInstance,
  clearFilters: () => window.galleryInstance?.clearAllFilters(),
  applyFilter: (type, value) => {
    if (window.galleryInstance && window.galleryInstance.state.filters.hasOwnProperty(type)) {
      window.galleryInstance.state.filters[type] = value;
      window.galleryInstance.applyFilters();
    }
  }
};