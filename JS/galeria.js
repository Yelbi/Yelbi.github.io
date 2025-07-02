class ResponsiveGallery {
  constructor() {
    this.elements = this.initializeElements();
    this.deviceInfo = this.detectDevice();
    this.config = this.generateConfig();
    this.state = this.initializeState();
    this.observers = new Map();
    this.timers = new Map();
    this.loadedImages = new Set();
    
    this.init();
  }

  initializeElements() {
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

    const elements = {};
    for (const [key, selector] of Object.entries(selectors)) {
      elements[key] = (key === 'cards' || key === 'images') 
        ? document.querySelectorAll(selector)
        : document.getElementById(selector.slice(1)) || document.querySelector(selector);
    }
    
    return elements;
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
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        canvas.remove();
        return /Mali|PowerVR|Adreno [23]/.test(renderer);
      }
    } catch (e) {
      return true;
    }
    
    return false;
  }

  generateConfig() {
    const { isMobile, isLowPerformance, prefersReducedMotion } = this.deviceInfo;
    
    return {
      searchDebounce: isMobile ? 400 : 300,
      animationDelay: isLowPerformance ? 0 : (isMobile ? 30 : 50),
      resizeDebounce: 250,
      intersectionThreshold: isMobile ? 0.05 : 0.1,
      lazyLoadMargin: isMobile ? '50px' : '100px',
      enableAnimations: !prefersReducedMotion && !isLowPerformance,
      enableHoverEffects: this.deviceInfo.supportsHover && !this.deviceInfo.isTouchDevice,
      enableParallax: this.deviceInfo.isDesktop && !isLowPerformance,
      preloadCount: this.deviceInfo.isSlowConnection ? 2 : (isMobile ? 4 : 8),
      filterBatchSize: isLowPerformance ? 5 : 10,
      imageTimeout: 3000 // Reducido de 5000 a 3000ms
    };
  }

  initializeState() {
    return {
      filters: { search: '', tipo: '', region: '' },
      isFilterPanelVisible: false,
      lastScrollY: 0,
      visibleCards: 0,
      isProcessing: false
    };
  }

  async applyFilters() {
    if (this.state.isProcessing) return;
    
    this.state.isProcessing = true;
    let visibleCount = 0;
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
    const nombre = (card.dataset.nombre || '').toLowerCase();
    
    return (!search || nombre.includes(search.toLowerCase())) &&
           (!tipo || card.dataset.tipo === tipo) &&
           (!region || card.dataset.region === region);
  }

  showCard(card, index) {
    const timerKey = card;
    if (this.timers.has(timerKey)) {
      clearTimeout(this.timers.get(timerKey));
      this.timers.delete(timerKey);
    }
    
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
    const timerKey = card;
    
    if (this.timers.has(timerKey)) {
      clearTimeout(this.timers.get(timerKey));
    }
    
    this.timers.set(timerKey, setTimeout(() => {
      if (card.classList.contains('filtering-hide')) {
        card.style.display = 'none';
      }
      this.timers.delete(timerKey);
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
    const filterMap = { tipoFilter: 'tipo', regionFilter: 'region' };

    Object.entries(filterMap).forEach(([elementKey, filterKey]) => {
      const element = this.elements[elementKey];
      if (!element) return;

      element.addEventListener('change', (e) => {
        this.state.filters[filterKey] = e.target.value;
        this.applyFilters();
      });

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && this.elements.searchInput) {
        e.preventDefault();
        this.focusSearch();
      }

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
    }, 16);

    window.addEventListener('scroll', throttledScroll, { passive: true });
  }

  setupCardInteractions() {
    this.elements.cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver detalles ${card.dataset.nombre}`);

      if (this.config.enableHoverEffects) {
        this.addHoverEffects(card);
      }

      if (this.deviceInfo.isTouchDevice) {
        this.addTouchEffects(card);
      }

      this.addKeyboardNavigation(card);
    });
  }

  addHoverEffects(card) {
    const onMouseEnter = () => {
      card.style.zIndex = '10';
      if (this.config.enableAnimations) {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.filter = 'brightness(1.05)';
      }
    };

    const onMouseLeave = () => {
      card.style.zIndex = '1';
      card.style.transform = '';
      card.style.filter = '';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mouseleave', onMouseLeave);
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
        setTimeout(() => card.style.transform = '', 150);
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
          setTimeout(() => card.style.transform = '', 100);
        }
      }
    });
  }

  // CORRECCIÓN PRINCIPAL: Simplificar y corregir el lazy loading
  setupLazyLoading() {
    // Primero, manejar imágenes ya cargadas o que deberían precargarse
    this.elements.images.forEach((img, index) => {
      const card = img.closest('.card');
      
      // Si ya está marcada como loaded en el HTML o es de las primeras
      if (img.classList.contains('loaded') || index < this.config.preloadCount) {
        this.handleImageLoaded(img, card);
        return;
      }
      
      // Si ya se completó la carga naturalmente
      if (img.complete && img.naturalHeight !== 0) {
        this.handleImageLoaded(img, card);
        return;
      }
      
      // Configurar lazy loading para el resto
      this.setupImageLazyLoad(img, card);
    });
  }
  
  setupImageLazyLoad(img, card) {
    // Crear observer para esta imagen
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImageWithTimeout(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.lazyLoadMargin,
      threshold: 0.01
    });
    
    imageObserver.observe(img);
    this.observers.set(img, imageObserver);
  }
  
  loadImageWithTimeout(img) {
    const card = img.closest('.card');
    const imageId = img.src || img.dataset.src;
    
    if (this.loadedImages.has(imageId)) return;
    
    // Mostrar estado de carga
    if (card) {
      card.classList.add('loading');
    }
    
    // Configurar timeout
    const loadingTimeout = setTimeout(() => {
      this.handleImageError(img, card);
    }, this.config.imageTimeout);
    
    // Eventos de carga
    const handleLoad = () => {
      clearTimeout(loadingTimeout);
      this.handleImageLoaded(img, card);
    };
    
    const handleError = () => {
      clearTimeout(loadingTimeout);
      this.handleImageError(img, card);
    };
    
    // Limpiar eventos anteriores
    img.removeEventListener('load', handleLoad);
    img.removeEventListener('error', handleError);
    
    // Agregar nuevos eventos
    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });
    
    // Si la imagen ya está cargada, ejecutar inmediatamente
    if (img.complete && img.naturalHeight !== 0) {
      handleLoad();
    }
  }

  handleImageLoaded(img, card) {
    const imageId = img.src || img.dataset.src;
    this.loadedImages.add(imageId);

    // Asegurar visibilidad
    img.style.opacity = '1';
    img.classList.add('loaded');
    
    if (card) {
      card.classList.remove('loading');
      card.classList.add('image-loaded');
      // Forzar repintado
      card.offsetHeight;
    }
  }

  handleImageError(img, card) {
    const imageId = img.src || img.dataset.src;
    this.loadedImages.add(imageId);

    // Crear placeholder
    img.style.opacity = '0.5';
    img.src = this.generatePlaceholderSVG();
    img.classList.add('loaded', 'error');
    
    if (card) {
      card.classList.remove('loading');
      card.classList.add('image-error');
      card.offsetHeight;
    }
  }

  // Método mejorado para verificar y corregir estados
  checkAndFixStuckLoadingStates() {
    this.elements.cards.forEach(card => {
      if (card.classList.contains('loading')) {
        const img = card.querySelector('img');
        
        if (img) {
          // Si la imagen ya se cargó naturalmente
          if (img.complete && img.naturalHeight !== 0) {
            this.handleImageLoaded(img, card);
          }
          // Si han pasado más de 5 segundos, forzar error
          else if (!img.classList.contains('loaded')) {
            setTimeout(() => {
              if (card.classList.contains('loading')) {
                this.handleImageError(img, card);
              }
            }, 100);
          }
        }
      }
    });
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

  clearAllFilters() {
    this.state.filters = { search: '', tipo: '', region: '' };
    
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.tipoFilter) this.elements.tipoFilter.value = '';
    if (this.elements.regionFilter) this.elements.regionFilter.value = '';
    
    this.applyFilters();
  }

  toggleFilterPanel() {
    if (!this.elements.filterPanel) return;

    const wasCollapsed = this.elements.filterPanel.classList.contains('collapsed');
    this.elements.filterPanel.classList.toggle('collapsed');
    this.state.isFilterPanelVisible = !wasCollapsed;
    
    this.updateToggleButton(wasCollapsed);
    this.addHapticFeedback();
  }

  updateToggleButton(collapsed) {
    if (!this.elements.toggleFiltersBtn) return;

    const icon = this.elements.toggleFiltersBtn.querySelector('i');
    const textContent = collapsed ? 'Mostrar Filtros' : 'Ocultar Filtros';
    
    if (icon) {
      icon.className = collapsed ? 'fi fi-rr-angle-down' : 'fi fi-rr-angle-up';
    }
    
    const textNode = Array.from(this.elements.toggleFiltersBtn.childNodes)
      .find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = textContent;
    }
  }

  handleResize() {
    const oldDeviceInfo = { ...this.deviceInfo };
    this.deviceInfo = this.detectDevice();
    
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
    
    if (this.deviceInfo.isMobile && scrollingDown && 
        this.state.isFilterPanelVisible && scrollY > 200) {
      this.collapseFilterPanel();
    }

    if (this.config.enableParallax) {
      const rate = scrollY * -0.2;
      document.body.style.backgroundPosition = `center ${rate}px`;
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
    
    window.history.replaceState({}, '', newURL);
  }

  loadFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const elementMap = { search: 'searchInput', tipo: 'tipoFilter', region: 'regionFilter' };
      
      ['search', 'tipo', 'region'].forEach(key => {
        if (params.has(key)) {
          this.state.filters[key] = params.get(key);
          
          const element = this.elements[elementMap[key]];
          if (element) {
            element.value = this.state.filters[key];
          }
        }
      });

      this.applyFilters();
    } catch (error) {
      console.warn('Error loading filters from URL:', error);
    }
  }

  addTouchFeedback(element) {
    element.addEventListener('touchstart', () => {
      if (this.config.enableAnimations) {
        element.style.transform = 'scale(0.98)';
      }
    }, { passive: true });

    element.addEventListener('touchend', () => {
      setTimeout(() => element.style.transform = '', 150);
    }, { passive: true });
  }

  addClickFeedback(element) {
    if (this.config.enableAnimations) {
      element.style.transform = 'scale(0.95)';
      setTimeout(() => element.style.transform = '', 150);
    }
    this.addHapticFeedback();
  }

  addHapticFeedback(intensity = 50) {
    if ('vibrate' in navigator && this.deviceInfo.isTouchDevice) {
      navigator.vibrate(intensity);
    }
  }

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

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    this.elements.cards.forEach(card => {
      card.style.transition = 'none';
    });
  }

  forceReloadStuckImages() {
    const stuckCards = Array.from(this.elements.cards).filter(card => 
      card.classList.contains('loading')
    );
    
    stuckCards.forEach(card => {
      const img = card.querySelector('img');
      if (img) {
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => img.src = originalSrc, 100);
      }
    });
    
    return stuckCards.length;
  }

  setupBadgeFilters() {
    document.querySelectorAll('.badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const filterType = badge.dataset.filter;
        const filterValue = badge.dataset.value;
        
        this.state.filters[filterType] = filterValue;
        
        if (filterType === 'tipo' && this.elements.tipoFilter) {
          this.elements.tipoFilter.value = filterValue;
        } else if (filterType === 'region' && this.elements.regionFilter) {
          this.elements.regionFilter.value = filterValue;
        }
        
        this.applyFilters();
        this.addClickFeedback(badge);
      });
    });
  }

  init() {
    try {
      this.loadFiltersFromURL();
      this.setupEventListeners();
      this.setupCardInteractions();
      this.setupLazyLoading();
      this.setupBadgeFilters();
      this.setupFavoriteButtons();
      
      if (this.elements.filterPanel) {
        if (this.state.isFilterPanelVisible) {
          this.elements.filterPanel.classList.remove('collapsed');
        }
        this.updateToggleButton(!this.state.isFilterPanelVisible);
      }
      
      // Verificar imágenes después de un breve delay
      setTimeout(() => this.checkAndFixStuckLoadingStates(), 1000);
      
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

      setupFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const serId = btn.dataset.serId;
                const isFavorited = btn.classList.contains('favorited');
                
                try {
                    if (isFavorited) {
                        await this.removeFavorite(serId);
                        btn.classList.remove('favorited');
                    } else {
                        await this.addFavorite(serId);
                        btn.classList.add('favorited');
                    }
                } catch (error) {
                    this.showFavoriteNotice(error.message);
                }
            });
        });
    }
    
    async addFavorite(serId) {
        const response = await fetch('/api/favorites.php?action=add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getUserToken()}`
            },
            body: JSON.stringify({ serId })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error al agregar favorito');
        }
        
        // Verificar límite
        if (result.favoritesCount >= 3) {
            this.showFavoriteNotice('¡Límite de favoritos alcanzado! (Máx. 3)');
        }
    }
    
    async removeFavorite(serId) {
        const response = await fetch('/api/favorites.php?action=remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getUserToken()}`
            },
            body: JSON.stringify({ serId })
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Error al quitar favorito');
        }
    }
    
    getUserToken() {
        return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    }
    
    showFavoriteNotice(message) {
        // Eliminar notificaciones anteriores
        document.querySelectorAll('.favorite-limit-notice').forEach(el => el.remove());
        
        const notice = document.createElement('div');
        notice.className = 'favorite-limit-notice';
        notice.textContent = message;
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
  window.galleryInstance = new ResponsiveGallery();
});

window.GalleryAPI = {
  getInstance: () => window.galleryInstance,
  clearFilters: () => window.galleryInstance?.clearAllFilters(),
  applyFilter: (type, value) => {
    if (window.galleryInstance && window.galleryInstance.state.filters.hasOwnProperty(type)) {
      window.galleryInstance.state.filters[type] = value;
      window.galleryInstance.applyFilters();
    }
  },
  fixStuckCards: () => window.galleryInstance?.checkAndFixStuckLoadingStates(),
  forceReload: () => window.galleryInstance?.forceReloadStuckImages()
};