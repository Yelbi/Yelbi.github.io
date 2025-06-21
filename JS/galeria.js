// Script corregido para galeria.php con sistema de filtros
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
  
  // Variables para filtros
  let currentFilters = {
    search: '',
    tipo: '',
    region: ''
  };
  
  // === SISTEMA DE FILTROS ===
  
  function applyFilters() {
    let visibleCount = 0;
    
    cards.forEach(card => {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const tipo = card.dataset.tipo || '';
      const region = card.dataset.region || '';
      
      // Verificar cada filtro
      const matchesSearch = currentFilters.search === '' || 
                           nombre.includes(currentFilters.search.toLowerCase());
      const matchesTipo = currentFilters.tipo === '' || tipo === currentFilters.tipo;
      const matchesRegion = currentFilters.region === '' || region === currentFilters.region;
      
      // Mostrar u ocultar la tarjeta
      if (matchesSearch && matchesTipo && matchesRegion) {
        showCard(card);
        visibleCount++;
      } else {
        hideCard(card);
      }
    });
    
    // Actualizar contador y mostrar/ocultar mensaje de sin resultados
    updateResultsDisplay(visibleCount);
  }
  
  function showCard(card) {
    card.style.display = 'block';
    card.classList.remove('filtering-hide');
    card.classList.add('filtering-show');
  }
  
  function hideCard(card) {
    card.classList.remove('filtering-show');
    card.classList.add('filtering-hide');
    setTimeout(() => {
      if (card.classList.contains('filtering-hide')) {
        card.style.display = 'none';
      }
    }, 300);
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
  
  // === EVENT LISTENERS PARA FILTROS ===
  
  // Verificar que los elementos existen antes de añadir listeners
  if (searchInput) {
    // Búsqueda en tiempo real con debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = this.value.trim();
        applyFilters();
      }, 300);
    });
  }
  
  // Filtro por tipo
  if (tipoFilter) {
    tipoFilter.addEventListener('change', function() {
      currentFilters.tipo = this.value;
      applyFilters();
    });
  }
  
  // Filtro por región
  if (regionFilter) {
    regionFilter.addEventListener('change', function() {
      currentFilters.region = this.value;
      applyFilters();
    });
  }
  
  // Limpiar filtros
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      clearAllFilters();
      
      // Animación visual del botón
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  }
  
  // Inicializar panel de filtros como oculto
  if (filterPanel) {
    filterPanel.classList.add('collapsed');
  }
  
  // Toggle panel de filtros
  if (toggleFiltersBtn && filterPanel) {
    // Configurar estado inicial del botón
    const icon = toggleFiltersBtn.querySelector('i');
    const textNode = Array.from(toggleFiltersBtn.childNodes).find(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    
    if (icon) icon.className = 'fi fi-rr-angle-down';
    if (textNode) textNode.textContent = ' Mostrar Filtros';
    
    toggleFiltersBtn.addEventListener('click', function() {
      filterPanel.classList.toggle('collapsed');
      const icon = this.querySelector('i');
      const textNode = Array.from(this.childNodes).find(node => 
        node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      
      if (filterPanel.classList.contains('collapsed')) {
        if (icon) icon.className = 'fi fi-rr-angle-down';
        if (textNode) textNode.textContent = ' Mostrar Filtros';
      } else {
        if (icon) icon.className = 'fi fi-rr-angle-up';
        if (textNode) textNode.textContent = ' Ocultar Filtros';
      }
    });
  }
  
  // === FUNCIONALIDAD ORIGINAL DE GALERÍA ===
  
  // Configurar Intersection Observer para animaciones
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar cada card para animación escalonada
  cards.forEach((card) => {
    observer.observe(card);
  });
  
  // Mejorar efectos de hover
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
      this.style.filter = 'brightness(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
      this.style.filter = 'brightness(1)';
    });
    
    // Touch support para móviles
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    }, { passive: true });
    
    card.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    }, { passive: true });
  });
  
  // Lazy loading mejorado con manejo de errores
  images.forEach(img => {
    const card = img.closest('.card');
    
    if (!img.complete && card) {
      card.classList.add('loading');
    }
    
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
    }
    
    img.addEventListener('error', function() {
      this.style.opacity = '0.5';
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';
      if (card) card.classList.remove('loading');
      console.warn('Error cargando imagen:', this.alt);
    });
  });
  
  // Optimización para scroll
  let ticking = false;
  
  function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    document.body.style.backgroundPosition = `center ${rate}px`;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });
  
  // Preload de imágenes críticas
  const criticalImages = Array.from(images).slice(0, 6);
  criticalImages.forEach(img => {
    const imageLoader = new Image();
    imageLoader.src = img.src;
  });
  
  // Manejo de redimensionamiento de ventana
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cards.forEach(card => {
        card.style.transition = 'none';
        card.offsetHeight; // Force reflow
        card.style.transition = '';
      });
    }, 250);
  }, { passive: true });
  
  // Añadir soporte para teclado (accesibilidad)
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // === FUNCIONALIDADES ADICIONALES DE FILTROS ===
  
  // Atajos de teclado
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K para enfocar la búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    
    // Escape para limpiar filtros
    if (e.key === 'Escape') {
      if (searchInput && document.activeElement === searchInput) {
        searchInput.blur();
      } else {
        clearAllFilters();
      }
    }
  });
  
  // Guardar estado de filtros en URL (opcional)
  function updateURL() {
    const params = new URLSearchParams();
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.tipo) params.set('tipo', currentFilters.tipo);
    if (currentFilters.region) params.set('region', currentFilters.region);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
  }
  
  // Cargar filtros desde URL al inicio
  function loadFiltersFromURL() {
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
  }
  
  // Mejorar la experiencia de filtrado con animaciones escalonadas
  function applyFiltersWithAnimation() {
    let visibleCount = 0;
    let delay = 0;
    
    cards.forEach((card, index) => {
      const nombre = (card.dataset.nombre || '').toLowerCase();
      const tipo = card.dataset.tipo || '';
      const region = card.dataset.region || '';
      
      const matchesSearch = currentFilters.search === '' || 
                           nombre.includes(currentFilters.search.toLowerCase());
      const matchesTipo = currentFilters.tipo === '' || tipo === currentFilters.tipo;
      const matchesRegion = currentFilters.region === '' || region === currentFilters.region;
      
      if (matchesSearch && matchesTipo && matchesRegion) {
        setTimeout(() => {
          showCard(card);
        }, delay);
        delay += 50; // Animación escalonada
        visibleCount++;
      } else {
        hideCard(card);
      }
    });
    
    updateResultsDisplay(visibleCount);
    updateURL();
  }
  
  // Inicializar filtros desde URL
  loadFiltersFromURL();
  
  // Añadir placeholder dinámico a la búsqueda
  if (searchInput) {
    const placeholders = [
      'Buscar por nombre...',
      'Ej: Odín, Zeus, Ra...',
      'Buscar deidades...'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
      if (searchInput !== document.activeElement) {
        searchInput.placeholder = placeholders[placeholderIndex];
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      }
    }, 3000);
  }
  
  // Usar la versión con animación por defecto
  applyFilters = applyFiltersWithAnimation;
  
  console.log(`Galería inicializada con ${cards.length} cards y sistema de filtros activo`);
  
});