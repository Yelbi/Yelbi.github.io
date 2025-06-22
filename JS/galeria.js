// Script responsivo mejorado para galeria.php con sistema de filtros
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card');
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  // Elementos del sistema de filtros
  const searchInput = document.getElementById('searchInput');
  const tipoFilter = document.getElementById('tipoFilter');
  const regionFilter = document.getElementById('regionFilter');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const toggleFiltersBtn = document.getElementById('toggleFilters');
  const resultsCount = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');
  const filterPanel = document.querySelector('.filter-panel');
  const galeriaGrid = document.getElementById('galeriaGrid');
  
  // === DETECCIÓN DE DISPOSITIVO Y VIEWPORT ===
  
  const deviceInfo = {
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1199,
    isDesktop: window.innerWidth >= 1200,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    supportsHover: window.matchMedia('(hover: hover)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isLowPerformance: false
  };
  
  // Detectar dispositivos de bajo rendimiento
  function detectLowPerformance() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        deviceInfo.isLowPerformance = /Mali|PowerVR|Adreno 2|Adreno 3/.test(renderer);
      }
    } catch (e) {
      deviceInfo.isLowPerformance = true;
    }
    
    // También considerar conexión lenta
    if ('connection' in navigator) {
      const connection = navigator.connection;
      deviceInfo.isLowPerformance = deviceInfo.isLowPerformance || 
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g';
    }
  }
  
  detectLowPerformance();
  
  // === CONFIGURACIÓN ADAPTATIVA ===
  
  const config = {
    // Timeouts adaptativos según dispositivo
    searchDebounce: deviceInfo.isMobile ? 400 : 300,
    animationDelay: deviceInfo.isLowPerformance ? 0 : (deviceInfo.isMobile ? 30 : 50),
    intersectionThreshold: deviceInfo.isMobile ? 0.05 : 0.1,
    
    // Configuración de animaciones
    enableAnimations: !deviceInfo.prefersReducedMotion && !deviceInfo.isLowPerformance,
    enableHoverEffects: deviceInfo.supportsHover && !deviceInfo.isTouchDevice,
    
    // Configuración de lazy loading
    lazyLoadMargin: deviceInfo.isMobile ? '50px' : '100px',
    preloadCount: deviceInfo.isMobile ? 3 : 6
  };
  
  // Variables para filtros
  let currentFilters = {
    search: '',
    tipo: '',
    region: ''
  };
  
  // === GESTIÓN DE VIEWPORT RESPONSIVO ===
  
  function updateDeviceInfo() {
    const newWidth = window.innerWidth;
    const oldIsMobile = deviceInfo.isMobile;
    
    deviceInfo.isMobile = newWidth <= 767;
    deviceInfo.isTablet = newWidth >= 768 && newWidth <= 1199;
    deviceInfo.isDesktop = newWidth >= 1200;
    
    // Actualizar configuración si cambió de mobile a desktop o viceversa
    if (oldIsMobile !== deviceInfo.isMobile) {
      config.searchDebounce = deviceInfo.isMobile ? 400 : 300;
      config.animationDelay = deviceInfo.isLowPerformance ? 0 : (deviceInfo.isMobile ? 30 : 50);
      
      // Reinicializar animaciones si es necesario
      if (config.enableAnimations) {
        initializeAnimations();
      }
    }
  }
  
  // === SISTEMA DE FILTROS OPTIMIZADO ===
  
  function applyFilters() {
    let visibleCount = 0;
    let delay = 0;
    
    // Usar requestAnimationFrame para mejor rendimiento
    const processCards = () => {
      cards.forEach((card, index) => {
        const nombre = (card.dataset.nombre || '').toLowerCase();
        const tipo = card.dataset.tipo || '';
        const region = card.dataset.region || '';
        
        // Verificar cada filtro
        const matchesSearch = currentFilters.search === '' || 
                             nombre.includes(currentFilters.search.toLowerCase());
        const matchesTipo = currentFilters.tipo === '' || tipo === currentFilters.tipo;
        const matchesRegion = currentFilters.region === '' || region === currentFilters.region;
        
        // Mostrar u ocultar la tarjeta con animación adaptativa
        if (matchesSearch && matchesTipo && matchesRegion) {
          if (config.enableAnimations && !deviceInfo.isLowPerformance) {
            setTimeout(() => showCard(card), delay);
            delay += config.animationDelay;
          } else {
            showCard(card);
          }
          visibleCount++;
        } else {
          hideCard(card);
        }
      });
      
      updateResultsDisplay(visibleCount);
      updateURL();
    };
    
    if (deviceInfo.isLowPerformance) {
      processCards();
    } else {
      requestAnimationFrame(processCards);
    }
  }
  
  function showCard(card) {
    card.style.display = 'block';
    card.classList.remove('filtering-hide');
    card.classList.add('filtering-show');
    
    // Optimización para dispositivos de bajo rendimiento
    if (!config.enableAnimations) {
      card.style.opacity = '1';
      card.style.transform = 'none';
    }
  }
  
  function hideCard(card) {
    card.classList.remove('filtering-show');
    card.classList.add('filtering-hide');
    
    const hideTimeout = config.enableAnimations ? 300 : 0;
    setTimeout(() => {
      if (card.classList.contains('filtering-hide')) {
        card.style.display = 'none';
      }
    }, hideTimeout);
  }
  
  function updateResultsDisplay(count) {
    if (resultsCount) {
      resultsCount.textContent = count;
    }
    
    if (noResults && galeriaGrid) {
      if (count === 0) {
        noResults.style.display = 'block';
        galeriaGrid.style.opacity = '0.3';
      } else {
        noResults.style.display = 'none';
        galeriaGrid.style.opacity = '1';
      }
    }
  }
  
  function clearAllFilters() {
    currentFilters = {
      search: '',
      tipo: '',
      region: ''
    };
    
    if (searchInput) searchInput.value = '';
    if (tipoFilter) tipoFilter.value = '';
    if (regionFilter) regionFilter.value = '';
    
    applyFilters();
  }
  
  // === EVENT LISTENERS OPTIMIZADOS ===
  
  // Búsqueda con debounce adaptativo
  if (searchInput) {
    let searchTimeout;
    
    const handleSearchInput = function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = this.value.trim();
        applyFilters();
      }, config.searchDebounce);
    };
    
    searchInput.addEventListener('input', handleSearchInput);
    
    // Mejorar experiencia en móviles
    if (deviceInfo.isMobile) {
      searchInput.addEventListener('focus', function() {
        // Scroll suave al input en móviles
        setTimeout(() => {
          this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    }
  }
  
  // Filtros con optimización táctil
  const setupFilterListener = (element, filterKey) => {
    if (!element) return;
    
    element.addEventListener('change', function() {
      currentFilters[filterKey] = this.value;
      applyFilters();
    });
    
    // Mejorar experiencia táctil en móviles
    if (deviceInfo.isTouchDevice) {
      element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      }, { passive: true });
    }
  };
  
  setupFilterListener(tipoFilter, 'tipo');
  setupFilterListener(regionFilter, 'region');
  
  // Botón limpiar filtros con feedback táctil
  if (clearFiltersBtn) {
    const handleClearClick = function() {
      clearAllFilters();
      
      // Animación visual adaptativa
      if (config.enableAnimations) {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      }
      
      // Feedback háptico en dispositivos compatibles
      if ('vibrate' in navigator && deviceInfo.isTouchDevice) {
        navigator.vibrate(50);
      }
    };
    
    clearFiltersBtn.addEventListener('click', handleClearClick);
  }
  
  // === PANEL DE FILTROS RESPONSIVO ===
  
  function initializeFilterPanel() {
    if (!filterPanel || !toggleFiltersBtn) return;
    
    // Configurar estado inicial basado en viewport
    const shouldStartCollapsed = deviceInfo.isMobile;
    
    if (shouldStartCollapsed) {
      filterPanel.classList.add('collapsed');
    }
    
    // Configurar botón toggle
    const updateToggleButton = (collapsed) => {
      const icon = toggleFiltersBtn.querySelector('i');
      const textNode = Array.from(toggleFiltersBtn.childNodes).find(node => 
        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      
      if (icon) {
        icon.className = collapsed ? 'fi fi-rr-angle-down' : 'fi fi-rr-angle-up';
      }
      if (textNode) {
        textNode.textContent = collapsed ? ' Mostrar Filtros' : ' Ocultar Filtros';
      }
    };
    
    updateToggleButton(shouldStartCollapsed);
    
    // Event listener para toggle
    toggleFiltersBtn.addEventListener('click', function() {
      const isCollapsed = filterPanel.classList.contains('collapsed');
      filterPanel.classList.toggle('collapsed');
      updateToggleButton(!isCollapsed);
      
      // Feedback háptico
      if ('vibrate' in navigator && deviceInfo.isTouchDevice) {
        navigator.vibrate(30);
      }
    });
  }
  
  initializeFilterPanel();
  
  // === INTERSECTION OBSERVER ADAPTATIVO ===
  
  function initializeAnimations() {
    if (!config.enableAnimations) return;
    
    const observerOptions = {
      threshold: config.intersectionThreshold,
      rootMargin: `0px 0px -${deviceInfo.isMobile ? '30px' : '50px'} 0px`
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (config.enableAnimations) {
            entry.target.style.transform = 'translateY(0)';
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    cards.forEach((card) => {
      if (config.enableAnimations) {
        observer.observe(card);
      } else {
        card.style.transform = 'translateY(0)';
      }
    });
  }
  
  // === EFECTOS DE HOVER/TOUCH ADAPTATIVOS ===
  
  function setupCardInteractions() {
    cards.forEach(card => {
      // Efectos de hover solo en dispositivos que lo soportan
      if (config.enableHoverEffects) {
        card.addEventListener('mouseenter', function() {
          this.style.zIndex = '10';
          this.style.filter = 'brightness(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
          this.style.zIndex = '1';
          this.style.filter = 'brightness(1)';
        });
      }
      
      // Efectos táctiles optimizados
      if (deviceInfo.isTouchDevice) {
        let touchStartTime;
        
        card.addEventListener('touchstart', function(e) {
          touchStartTime = Date.now();
          if (config.enableAnimations) {
            this.style.transform = 'translateY(-5px) scale(1.01)';
          }
        }, { passive: true });
        
        card.addEventListener('touchend', function() {
          const touchDuration = Date.now() - touchStartTime;
          
          // Solo aplicar animación si el toque fue breve (no scroll)
          if (touchDuration < 200) {
            if (config.enableAnimations) {
              setTimeout(() => {
                this.style.transform = '';
              }, 150);
            }
          } else {
            this.style.transform = '';
          }
        }, { passive: true });
        
        // Cancelar efectos táctiles en scroll
        card.addEventListener('touchmove', function() {
          this.style.transform = '';
        }, { passive: true });
      }
      
      // Accesibilidad mejorada
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
          
          // Feedback visual para navegación por teclado
          if (config.enableAnimations) {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
              this.style.transform = '';
            }, 100);
          }
        }
      });
    });
  }
  
  // === LAZY LOADING OPTIMIZADO ===
  
  function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const card = img.closest('.card');
          
          if (card) {
            card.classList.add('loading');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: config.lazyLoadMargin
    });
    
    images.forEach(img => {
      const card = img.closest('.card');
      
      // Configurar eventos de carga
      img.addEventListener('load', function() {
        this.classList.add('loaded');
        this.style.opacity = '1';
        if (card) card.classList.remove('loading');
      });
      
      // Si la imagen ya está cargada (cache)
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
        img.style.opacity = '1';
        if (card) card.classList.remove('loading');
      } else {
        // Observar para lazy loading
        imageObserver.observe(img);
      }
      
      // Manejo de errores con placeholder responsive
      img.addEventListener('error', function() {
        this.style.opacity = '0.5';
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
        if (card) card.classList.remove('loading');
        console.warn('Error cargando imagen:', this.alt);
      });
    });
  }
  
  // === SCROLL EFFECTS OPTIMIZADOS ===
  
  function setupScrollEffects() {
    if (deviceInfo.isLowPerformance) return;
    
    let ticking = false;
    let lastScrollY = 0;
    
    function updateScrollEffects() {
      const scrolled = window.pageYOffset;
      
      // Solo aplicar parallax en desktop con buen rendimiento
      if (deviceInfo.isDesktop && !deviceInfo.isLowPerformance) {
        const rate = scrolled * -0.3; // Reducir intensidad
        document.body.style.backgroundPosition = `center ${rate}px`;
      }
      
      // Ocultar/mostrar elementos basado en dirección de scroll (móvil)
      if (deviceInfo.isMobile && Math.abs(scrolled - lastScrollY) > 5) {
        const scrollingDown = scrolled > lastScrollY;
        const filterPanelVisible = !filterPanel?.classList.contains('collapsed');
        
        // Auto-colapsar filtros al hacer scroll down en móvil
        if (scrollingDown && filterPanelVisible && scrolled > 200) {
          filterPanel?.classList.add('collapsed');
          if (toggleFiltersBtn) {
            const icon = toggleFiltersBtn.querySelector('i');
            const textNode = Array.from(toggleFiltersBtn.childNodes).find(node => 
              node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );
            if (icon) icon.className = 'fi fi-rr-angle-down';
            if (textNode) textNode.textContent = ' Mostrar Filtros';
          }
        }
      }
      
      lastScrollY = scrolled;
      ticking = false;
    }
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }, { passive: true });
  }
  
  // === RESIZE HANDLER OPTIMIZADO ===
  
  function setupResizeHandler() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        updateDeviceInfo();
        
        // Reinicializar elementos si es necesario
        if (!config.enableAnimations) {
          cards.forEach(card => {
            card.style.transition = 'none';
            card.offsetHeight; // Force reflow
            card.style.transition = '';
          });
        }
        
        // Reconfigurar panel de filtros según nuevo viewport
        if (deviceInfo.isMobile && filterPanel && !filterPanel.classList.contains('collapsed')) {
          filterPanel.classList.add('collapsed');
          if (toggleFiltersBtn) {
            const icon = toggleFiltersBtn.querySelector('i');
            const textNode = Array.from(toggleFiltersBtn.childNodes).find(node => 
              node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );
            if (icon) icon.className = 'fi fi-rr-angle-down';
            if (textNode) textNode.textContent = ' Mostrar Filtros';
          }
        }
      }, 250);
    }, { passive: true });
  }
  
  // === ATAJOS DE TECLADO ADAPTATIVOS ===
  
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Ctrl/Cmd + K para enfocar la búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && searchInput) {
        e.preventDefault();
        searchInput.focus();
        
        // Mostrar filtros si están ocultos en móvil
        if (deviceInfo.isMobile && filterPanel?.classList.contains('collapsed')) {
          filterPanel.classList.remove('collapsed');
          if (toggleFiltersBtn) {
            const icon = toggleFiltersBtn.querySelector('i');
            const textNode = Array.from(toggleFiltersBtn.childNodes).find(node => 
              node.nodeType === Node.TEXT_NODE && node.textContent.trim()
            );
            if (icon) icon.className = 'fi fi-rr-angle-up';
            if (textNode) textNode.textContent = ' Ocultar Filtros';
          }
        }
      }
      
      // Escape para limpiar filtros o cerrar búsqueda
      if (e.key === 'Escape') {
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
          // En móvil, también colapsar filtros
          if (deviceInfo.isMobile && filterPanel) {
            filterPanel.classList.add('collapsed');
          }
        } else {
          clearAllFilters();
        }
      }
      
      // Atajos para filtros rápidos (solo desktop)
      if (!deviceInfo.isMobile) {
        if (e.key === '1' && e.altKey && tipoFilter) {
          e.preventDefault();
          tipoFilter.focus();
        }
        if (e.key === '2' && e.altKey && regionFilter) {
          e.preventDefault();
          regionFilter.focus();
        }
      }
    });
  }
  
  // === URL STATE MANAGEMENT ===
  
  function updateURL() {
    if (!window.history?.replaceState) return;
    
    const params = new URLSearchParams();
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.tipo) params.set('tipo', currentFilters.tipo);
    if (currentFilters.region) params.set('region', currentFilters.region);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
  }
  
  function loadFiltersFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      
      if (params.has('search') && searchInput) {
        currentFilters.search = params.get('search');
        searchInput.value = currentFilters.search;
      }
      
      if (params.has('tipo') && tipoFilter) {
        currentFilters.tipo = params.get('tipo');
        tipoFilter.value = currentFilters.tipo;
      }
      
      if (params.has('region') && regionFilter) {
        currentFilters.region = params.get('region');
        regionFilter.value = currentFilters.region;
      }
      
      // Aplicar filtros si hay alguno activo
      if (currentFilters.search || currentFilters.tipo || currentFilters.region) {
        applyFilters();
      }
    } catch (error) {
      console.warn('Error loading filters from URL:', error);
    }
  }
  
  // === PLACEHOLDER DINÁMICO RESPONSIVO ===
  
  function setupDynamicPlaceholder() {
    if (!searchInput) return;
    
    const placeholders = deviceInfo.isMobile ? [
      'Buscar...',
      'Ej: Odín, Zeus...',
      'Nombre de deidad...'
    ] : [
      'Buscar por nombre...',
      'Ej: Odín, Zeus, Ra...',
      'Buscar deidades...',
      'Ctrl+K para búsqueda rápida'
    ];
    
    let placeholderIndex = 0;
    const intervalTime = deviceInfo.isMobile ? 4000 : 3000;
    
    const placeholderInterval = setInterval(() => {
      if (searchInput !== document.activeElement && document.hidden === false) {
        searchInput.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      }
    }, intervalTime);
    
    // Pausar cuando la página no está visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(placeholderInterval);
      }
    });
  }
  
  // === PRELOAD CRÍTICO ADAPTATIVO ===
  
  function setupCriticalPreload() {
    const criticalCount = Math.min(config.preloadCount, images.length);
    const criticalImages = Array.from(images).slice(0, criticalCount);
    
    criticalImages.forEach((img, index) => {
      const imageLoader = new Image();
      
      // Preload escalonado para no saturar la red
      setTimeout(() => {
        imageLoader.src = img.src;
      }, index * (deviceInfo.isMobile ? 100 : 50));
    });
  }
  
  // === INICIALIZACIÓN ===
  
  function initialize() {
    // Cargar filtros desde URL primero
    loadFiltersFromURL();
    
    // Configurar interacciones
    setupCardInteractions();
    
    // Configurar lazy loading
    setupLazyLoading();
    
    // Configurar animaciones
    initializeAnimations();
    
    // Configurar efectos de scroll
    setupScrollEffects();
    
    // Configurar resize handler
    setupResizeHandler();
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    // Configurar placeholder dinámico
    setupDynamicPlaceholder();
    
    // Preload crítico
    setupCriticalPreload();
    
    console.log(`Galería responsiva inicializada:`, {
      cards: cards.length,
      device: deviceInfo,
      config: config
    });
  }
  
  // === CLEANUP ===
  
  // Cleanup en beforeunload para dispositivos móviles
  window.addEventListener('beforeunload', () => {
    // Cancelar timers activos
    cards.forEach(card => {
      card.style.transition = 'none';
    });
  });
  
  // Inicializar todo
  initialize();
  
});