class ResponsiveGallery {
  constructor() {
    this.cache = new Map();
    this.deviceInfo = this.detectDevice();
    this.config = this.generateConfig();
    this.state = this.initializeState();
    this.observers = new Map();
    this.timers = new Map();
    this.loadedImages = new Set();
    this.visibleCards = new Set();
    
    // Cache de elementos DOM
    this.initializeElements();
    
    // Inicializar inmediatamente
    this.init();
  }

  initializeElements() {
    // Usar una sola consulta para mejorar rendimiento
    const elements = {
      cards: document.querySelectorAll('.card'),
      images: document.querySelectorAll('img[loading="lazy"]'),
      searchInput: document.getElementById('searchInput'),
      tipoFilter: document.getElementById('tipoFilter'),
      regionFilter: document.getElementById('regionFilter'),
      clearFiltersBtn: document.getElementById('clearFilters'),
      toggleFiltersBtn: document.getElementById('toggleFilters'),
      resultsCount: document.getElementById('resultsCount'),
      noResults: document.getElementById('noResults'),
      filterPanel: document.querySelector('.filter-panel'),
      galeriaGrid: document.getElementById('galeriaGrid')
    };

    // Cachear datos de las tarjetas para evitar accesos DOM repetidos
    this.cardsData = Array.from(elements.cards).map(card => ({
      element: card,
      nombre: (card.dataset.nombre || '').toLowerCase(),
      tipo: card.dataset.tipo || '',
      region: card.dataset.region || '',
      img: card.querySelector('img')
    }));

    this.elements = elements;
  }

  detectDevice() {
    const width = window.innerWidth;
    const connection = navigator.connection;
    const isMobile = width <= 767;
    const isTablet = width >= 768 && width <= 1199;
    
    return {
      isMobile,
      isTablet,
      isDesktop: width >= 1200,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      supportsHover: matchMedia('(hover: hover)').matches,
      prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      isLowPerformance: this.detectLowPerformance(),
      isSlowConnection: connection?.saveData || connection?.effectiveType?.includes('2g'),
      viewport: { width, height: window.innerHeight }
    };
  }

  detectLowPerformance() {
    // Detección simplificada
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
    return false;
  }

  generateConfig() {
    const { isMobile, isLowPerformance, prefersReducedMotion } = this.deviceInfo;
    
    return {
      searchDebounce: isMobile ? 400 : 250,
      animationDelay: isLowPerformance ? 0 : 20,
      resizeDebounce: 200,
      intersectionThreshold: 0.1,
      lazyLoadMargin: isMobile ? '50px' : '150px',
      enableAnimations: !prefersReducedMotion && !isLowPerformance,
      enableHoverEffects: this.deviceInfo.supportsHover,
      preloadCount: this.deviceInfo.isSlowConnection ? 3 : 6,
      batchSize: isLowPerformance ? 8 : 16,
      imageTimeout: 4000
    };
  }

  initializeState() {
    return {
      filters: { search: '', tipo: '', region: '' },
      isFilterPanelVisible: false,
      lastScrollY: 0,
      visibleCount: 0,
      isProcessing: false,
      activeFilters: new Set()
    };
  }

  // Filtrado optimizado usando requestIdleCallback
  async applyFilters() {
    if (this.state.isProcessing) return;
    
    this.state.isProcessing = true;
    const { search, tipo, region } = this.state.filters;
    let visibleCount = 0;
    
    // Preparar filtros una sola vez
    const hasSearch = search.length > 0;
    const searchLower = hasSearch ? search.toLowerCase() : '';
    const hasTipo = tipo.length > 0;
    const hasRegion = region.length > 0;
    
    // Procesar en lotes más eficientes
    const processCards = (cards) => {
      return new Promise(resolve => {
        const processBatch = (startIndex) => {
          const endIndex = Math.min(startIndex + this.config.batchSize, cards.length);
          
          for (let i = startIndex; i < endIndex; i++) {
            const cardData = cards[i];
            const isVisible = this.evaluateCardFiltersOptimized(
              cardData, hasSearch, searchLower, hasTipo, tipo, hasRegion, region
            );
            
            if (isVisible) {
              this.showCardOptimized(cardData.element, visibleCount);
              visibleCount++;
              this.visibleCards.add(cardData.element);
            } else {
              this.hideCardOptimized(cardData.element);
              this.visibleCards.delete(cardData.element);
            }
          }
          
          if (endIndex < cards.length) {
            // Continuar con el siguiente lote
            requestAnimationFrame(() => processBatch(endIndex));
          } else {
            resolve();
          }
        };
        
        processBatch(0);
      });
    };

    await processCards(this.cardsData);
    
    this.updateResultsDisplay(visibleCount);
    this.updateURL();
    this.state.isProcessing = false;
  }

  evaluateCardFiltersOptimized(cardData, hasSearch, searchLower, hasTipo, tipo, hasRegion, region) {
    return (!hasSearch || cardData.nombre.includes(searchLower)) &&
           (!hasTipo || cardData.tipo === tipo) &&
           (!hasRegion || cardData.region === region);
  }

  showCardOptimized(card, index) {
    if (this.timers.has(card)) {
      clearTimeout(this.timers.get(card));
      this.timers.delete(card);
    }
    
    card.style.display = 'block';
    card.classList.remove('filtering-hide');
    card.classList.add('filtering-show');

    if (this.config.enableAnimations && index < 20) { // Limitar animaciones
      const delay = Math.min(index * this.config.animationDelay, 200);
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, delay);
    } else {
      card.style.opacity = '1';
      card.style.transform = 'none';
    }
  }

  hideCardOptimized(card) {
    card.classList.remove('filtering-show');
    card.classList.add('filtering-hide');
    
    if (this.timers.has(card)) {
      clearTimeout(this.timers.get(card));
    }
    
    this.timers.set(card, setTimeout(() => {
      if (card.classList.contains('filtering-hide')) {
        card.style.display = 'none';
      }
      this.timers.delete(card);
    }, this.config.enableAnimations ? 200 : 0));
  }

  updateResultsDisplay(count) {
    this.state.visibleCount = count;
    
    if (this.elements.resultsCount) {
      this.elements.resultsCount.textContent = count;
    }

    if (this.elements.noResults && this.elements.galeriaGrid) {
      this.elements.noResults.style.display = count === 0 ? 'block' : 'none';
      this.elements.galeriaGrid.style.opacity = count === 0 ? '0.3' : '1';
    }
  }

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

    // Mejorar UX en móviles
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
    const filterHandler = (filterKey) => (e) => {
      this.state.filters[filterKey] = e.target.value;
      this.applyFilters();
    };

    if (this.elements.tipoFilter) {
      this.elements.tipoFilter.addEventListener('change', filterHandler('tipo'));
    }
    
    if (this.elements.regionFilter) {
      this.elements.regionFilter.addEventListener('change', filterHandler('region'));
    }
  }

  setupClearButton() {
    if (!this.elements.clearFiltersBtn) return;

    this.elements.clearFiltersBtn.addEventListener('click', () => {
      this.clearAllFilters();
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && this.elements.searchInput) {
        e.preventDefault();
        this.focusSearch();
      }

      if (e.key === 'Escape') {
        if (document.activeElement === this.elements.searchInput) {
          this.elements.searchInput.blur();
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
    }, 16);

    window.addEventListener('scroll', throttledScroll, { passive: true });
  }

  setupCardInteractions() {
    // Usar delegación de eventos para mejor rendimiento
    this.elements.galeriaGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) {
        // Manejar click en card
        this.handleCardClick(card, e);
      }
    });

    // Configurar accesibilidad una sola vez
    this.cardsData.forEach(({ element: card }) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      
      if (this.config.enableHoverEffects) {
        this.addHoverEffects(card);
      }
    });
  }

  handleCardClick(card, e) {
    // Verificar si el click fue en un badge
    const badge = e.target.closest('.badge');
    if (badge) {
      e.preventDefault();
      e.stopPropagation();
      
      const filterType = badge.dataset.filter;
      const filterValue = badge.dataset.value;
      
      this.state.filters[filterType] = filterValue;
      
      if (filterType === 'tipo' && this.elements.tipoFilter) {
        this.elements.tipoFilter.value = filterValue;
      } else if (filterType === 'region' && this.elements.regionFilter) {
        this.elements.regionFilter.value = filterValue;
      }
      
      this.applyFilters();
    }
  }

  addHoverEffects(card) {
    if (!this.deviceInfo.supportsHover) return;

    const onMouseEnter = () => {
      if (this.config.enableAnimations) {
        card.style.transform = 'translateY(-5px)';
        card.style.zIndex = '10';
      }
    };

    const onMouseLeave = () => {
      card.style.transform = '';
      card.style.zIndex = '1';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mouseleave', onMouseLeave);
  }

  // Lazy loading optimizado con IntersectionObserver
  setupLazyLoading() {
    // Configurar observer una sola vez
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.lazyLoadMargin,
      threshold: this.config.intersectionThreshold
    });

    // Procesar todas las imágenes
    this.cardsData.forEach(({ element: card, img }, index) => {
      if (!img) return;

      // Precargar las primeras imágenes
      if (index < this.config.preloadCount) {
        this.loadImage(img);
      } else if (img.complete && img.naturalHeight > 0) {
        this.handleImageLoaded(img, card);
      } else {
        imageObserver.observe(img);
      }
    });

    this.observers.set('images', imageObserver);
  }

  loadImage(img) {
    const card = img.closest('.card');
    
    if (img.complete && img.naturalHeight > 0) {
      this.handleImageLoaded(img, card);
      return;
    }

    card?.classList.add('loading');
    
    const loadPromise = new Promise((resolve, reject) => {
      const handleLoad = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        resolve();
      };
      
      const handleError = () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        reject();
      };
      
      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });
    });

    // Timeout para imágenes que no cargan
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), this.config.imageTimeout);
    });

    Promise.race([loadPromise, timeoutPromise])
      .then(() => this.handleImageLoaded(img, card))
      .catch(() => this.handleImageError(img, card));
  }

  handleImageLoaded(img, card) {
    if (img.src) {
      this.loadedImages.add(img.src);
    }

    img.style.opacity = '1';
    img.classList.add('loaded');
    
    if (card) {
      card.classList.remove('loading');
      card.classList.add('image-loaded');
    }
  }

  handleImageError(img, card) {
    if (img.src) {
      this.loadedImages.add(img.src);
    }

    img.style.opacity = '0.5';
    img.classList.add('loaded', 'error');
    
    if (card) {
      card.classList.remove('loading');
      card.classList.add('image-error');
    }
  }

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
    
    this.updateToggleButton(isCollapsed);
  }

  updateToggleButton(collapsed) {
    if (!this.elements.toggleFiltersBtn) return;

    const icon = this.elements.toggleFiltersBtn.querySelector('i');
    if (icon) {
      icon.className = collapsed ? 'fi fi-rr-angle-down' : 'fi fi-rr-angle-up';
    }
  }

  handleResize() {
    const oldDeviceInfo = { ...this.deviceInfo };
    this.deviceInfo = this.detectDevice();
    
    if (oldDeviceInfo.isMobile !== this.deviceInfo.isMobile) {
      this.config = this.generateConfig();
    }
  }

  handleScroll() {
    const scrollY = window.pageYOffset;
    const scrollingDown = scrollY > this.state.lastScrollY;
    
    if (this.deviceInfo.isMobile && scrollingDown && 
        this.state.isFilterPanelVisible && scrollY > 200) {
      this.toggleFilterPanel();
    }

    this.state.lastScrollY = scrollY;
  }

  updateURL() {
    if (!window.history?.replaceState) return;

    const params = new URLSearchParams();
    const { search, tipo, region } = this.state.filters;
    
    if (search) params.set('search', search);
    if (tipo) params.set('tipo', tipo);
    if (region) params.set('region', region);

    const newURL = window.location.pathname + 
                  (params.toString() ? '?' + params.toString() : '');
    
    window.history.replaceState(null, '', newURL);
  }

  loadFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const elementMap = { 
        search: 'searchInput', 
        tipo: 'tipoFilter', 
        region: 'regionFilter' 
      };
      
      Object.keys(elementMap).forEach(key => {
        if (params.has(key)) {
          this.state.filters[key] = params.get(key);
          const element = this.elements[elementMap[key]];
          if (element) {
            element.value = this.state.filters[key];
          }
        }
      });

      if (Object.values(this.state.filters).some(Boolean)) {
        this.applyFilters();
      }
    } catch (error) {
      console.warn('Error loading filters from URL:', error);
    }
  }

  focusSearch() {
    if (this.elements.searchInput) {
      this.elements.searchInput.focus();
    }
  }

  cleanup() {
    // Limpiar observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Limpiar timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Limpiar cache
    this.cache.clear();
  }

  // Utilidades optimizadas
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Inicialización optimizada
  init() {
    try {
      // Configurar en el orden óptimo
      this.loadFiltersFromURL();
      this.setupEventListeners();
      this.setupCardInteractions();
      this.setupLazyLoading();
      
      // Cleanup al cerrar
      window.addEventListener('beforeunload', () => this.cleanup());
      
      console.log('Galería optimizada inicializada:', {
        cards: this.cardsData.length,
        device: this.deviceInfo.isMobile ? 'mobile' : 'desktop',
        performance: this.deviceInfo.isLowPerformance ? 'low' : 'normal'
      });
    } catch (error) {
      console.error('Error inicializando galería:', error);
    }
  }
}

// Inicialización con mejor control de errores
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.galleryInstance = new ResponsiveGallery();
  } catch (error) {
    console.error('Error creating gallery instance:', error);
  }
});

// API simplificada
window.GalleryAPI = {
  getInstance: () => window.galleryInstance,
  clearFilters: () => window.galleryInstance?.clearAllFilters(),
  applyFilter: (type, value) => {
    const instance = window.galleryInstance;
    if (instance && instance.state.filters.hasOwnProperty(type)) {
      instance.state.filters[type] = value;
      instance.applyFilters();
    }
  }
};