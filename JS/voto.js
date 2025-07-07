Vue.config.devtools = true;

// Componente Card mejorado
Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
      @keydown.enter="handleClick"
      @keydown.space.prevent="handleClick"
      tabindex="0"
      :class="{ selected: isSelected, disabled: isDisabled }"
      ref="card"
      role="button"
      :aria-pressed="isSelected"
      :aria-disabled="isDisabled">
      <div class="card" :style="cardStyle">
        <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
        <div class="card-info">
          <slot name="header"></slot>
          <slot name="content"></slot>
        </div>
      </div>
    </div>`,
  
  mounted() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.updateDimensions);
    clearTimeout(this.mouseLeaveDelay);
  },
  
  props: {
    dataImage: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      width: 0,
      height: 0,
      mouseX: 0,
      mouseY: 0,
      mouseLeaveDelay: null,
      isMobile: false
    };
  },
  
  computed: {
    mousePX() {
      return this.width ? this.mouseX / this.width : 0;
    },
    
    mousePY() {
      return this.height ? this.mouseY / this.height : 0;
    },
    
    cardStyle() {
      if (this.isMobile) return {};
      
      const rX = this.mousePX * 15;
      const rY = this.mousePY * -15;
      return {
        transform: `rotateY(${rX}deg) rotateX(${rY}deg)`
      };
    },
    
    cardBgTransform() {
      if (this.isMobile) return {};
      
      const tX = this.mousePX * -20;
      const tY = this.mousePY * -20;
      return {
        transform: `translateX(${tX}px) translateY(${tY}px)`
      };
    },
    
    cardBgImage() {
      return {
        backgroundImage: `url(${this.dataImage})`
      };
    }
  },
  
  methods: {
    updateDimensions() {
      if (this.$refs.card) {
        this.width = this.$refs.card.offsetWidth;
        this.height = this.$refs.card.offsetHeight;
      }
      this.isMobile = window.innerWidth <= 768;
    },
    
    handleMouseMove(e) {
      if (this.isMobile || this.isDisabled) return;
      
      const rect = this.$refs.card.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left - this.width / 2;
      this.mouseY = e.clientY - rect.top - this.height / 2;
    },
    
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
    },
    
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 300);
    },
    
    handleClick() {
      if (!this.isDisabled) {
        this.$emit('select');
      }
    }
  }
});

// Aplicación principal
const app = new Vue({
  el: '#app',
  
  data() {
    return {
      options: [
        {
          title: 'Mitología Eslava',
          description: 'Bosques, Espíritus y Ancestros',
          image: 'https://i.pinimg.com/736x/db/62/86/db628698b9e588926246c6309e30e588.jpg',
          value: 'Mitología Eslava'
        },
        {
          title: 'Mitología Azteca',
          description: 'Sacrificio, Guerra y Sol',
          image: 'https://i.pinimg.com/736x/b1/e7/f3/b1e7f3aa3207248b933f488642d9c2d9.jpg',
          value: 'Mitología Azteca'
        },
        {
          title: 'Hinduismo',
          description: 'Karma, Dharma y Moksha',
          image: 'https://i.pinimg.com/736x/3d/6d/b2/3d6db2f75afdd70fcb8befc6ed7c2c75.jpg',
          value: 'Hinduismo'
        },
        {
          title: 'Mitología Japonesa',
          description: 'Kami, Naturaleza y Armonía',
          image: 'https://i.pinimg.com/736x/ed/ae/fb/edaefbe97bdf09b5ba412bfc80574df7.jpg',
          value: 'Mitología Japonesa'
        }
      ],
      selectedOption: null,
      isSubmitting: false,
      hasVoted: false,
      isLoading: true,
      debugMode: false,
      alertTimeout: null
    };
  },
  
  computed: {
    canVote() {
      return !this.hasVoted && !this.isSubmitting && this.selectedOption !== null;
    },
    
    submitButtonText() {
      if (this.isSubmitting) return 'Enviando...';
      if (this.selectedOption !== null) return 'Enviar mi voto';
      return 'Selecciona una opción';
    }
  },
  
  methods: {
    selectOption(index) {
      if (this.hasVoted) {
        this.showAlert('Ya has votado anteriormente', 'warning');
        return;
      }
      
      this.selectedOption = index;
      this.debugLog(`Opción seleccionada: ${this.options[index].title}`);
      
      // Feedback visual adicional
      this.showAlert(`Has seleccionado: ${this.options[index].title}`, 'success');
    },
    
    showAlert(message, type = 'error') {
      const alertContainer = document.getElementById('voteAlert');
      if (!alertContainer) {
        console.error('Elemento voteAlert no encontrado');
        return;
      }
      
      // Limpiar timeout anterior
      if (this.alertTimeout) {
        clearTimeout(this.alertTimeout);
      }
      
      // Crear elemento de alerta
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type}`;
      alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="fi fi-rr-${this.getAlertIcon(type)}"></i>
          <span>${message}</span>
        </div>
      `;
      
      // Limpiar alertas anteriores y agregar nueva
      alertContainer.innerHTML = '';
      alertContainer.appendChild(alertDiv);
      
      // Auto-hide después de 5 segundos
      this.alertTimeout = setTimeout(() => {
        if (alertContainer.contains(alertDiv)) {
          alertDiv.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (alertContainer.contains(alertDiv)) {
              alertContainer.removeChild(alertDiv);
            }
          }, 300);
        }
      }, 5000);
    },
    
    getAlertIcon(type) {
      const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle'
      };
      return icons[type] || 'info-circle';
    },
    
    debugLog(message) {
      if (this.debugMode) {
        console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
      }
    },
    
    getAuthToken() {
      // Intentar obtener token de diferentes fuentes
      const sources = [
        () => localStorage.getItem('jwt_token'),
        () => sessionStorage.getItem('jwt_token'),
        () => localStorage.getItem('auth_token'),
        () => sessionStorage.getItem('auth_token')
      ];
      
      for (const getToken of sources) {
        const token = getToken();
        if (token) {
          this.debugLog(`Token encontrado en: ${getToken.name}`);
          return token;
        }
      }
      
      this.debugLog('No se encontró token de autenticación');
      return null;
    },
    
    async makeApiRequest(action, data = {}, method = 'POST') {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const url = `https://seres.blog/api/auth.php?action=${action}`;
      this.debugLog(`Realizando petición ${method} a: ${url}`);
      
      const options = {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      };
      
      if (method !== 'GET' && Object.keys(data).length > 0) {
        options.body = JSON.stringify(data);
        this.debugLog(`Datos enviados: ${JSON.stringify(data)}`);
      }
      
      try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        this.debugLog(`Respuesta del servidor (${response.status}): ${responseText}`);
        
        if (!responseText.trim()) {
          throw new Error('Respuesta vacía del servidor');
        }
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing JSON:', responseText);
          throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`);
        }
        
        if (!response.ok) {
          throw new Error(result.error || result.message || `Error HTTP ${response.status}`);
        }
        
        return result;
        
      } catch (networkError) {
        if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw networkError;
      }
    },
    
    async checkVoteStatus() {
      try {
        this.isLoading = true;
        const token = this.getAuthToken();
        
        if (!token) {
          this.debugLog('No hay token, usuario no autenticado');
          this.showAlert('Debes iniciar sesión para votar', 'warning');
          return;
        }
        
        const result = await this.makeApiRequest('check-vote', {}, 'GET');
        
        if (result.success !== undefined) {
          this.hasVoted = result.hasVoted || false;
          this.debugLog(`Estado de voto: ${this.hasVoted ? 'Ya votó' : 'No ha votado'}`);
          
          if (this.hasVoted) {
            this.showAlert('Ya has votado anteriormente. ¡Gracias por participar!', 'success');
          }
        } else {
          this.debugLog('Respuesta inesperada del servidor para check-vote');
          console.warn('Respuesta inesperada:', result);
        }
        
      } catch (error) {
        console.error('Error checking vote status:', error);
        this.debugLog(`Error verificando estado de voto: ${error.message}`);
        
        if (this.isAuthError(error)) {
          this.handleAuthError();
        } else {
          this.showAlert('Error al verificar el estado de votación', 'error');
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async submitVote() {
      // Validaciones previas
      if (this.selectedOption === null) {
        this.showAlert('Por favor selecciona una opción', 'warning');
        return;
      }

      if (this.hasVoted) {
        this.showAlert('Ya has votado anteriormente', 'warning');
        return;
      }
      
      if (this.isSubmitting) {
        this.showAlert('Ya se está procesando tu voto', 'warning');
        return;
      }

      this.isSubmitting = true;
      const selectedMythology = this.options[this.selectedOption].value;
      
      this.debugLog(`Enviando voto para: ${selectedMythology}`);

      try {
        const token = this.getAuthToken();
        
        if (!token) {
          this.showAlert('Debes iniciar sesión para votar', 'warning');
          this.redirectToLogin();
          return;
        }

        const result = await this.makeApiRequest('submit-vote', { 
          mythology: selectedMythology,
          timestamp: Date.now()
        });

        if (result.success) {
          this.hasVoted = true;
          this.selectedOption = null;
          this.showAlert('¡Gracias por tu voto! Tu selección ha sido registrada.', 'success');
          this.debugLog('Voto enviado exitosamente');
          
          // Opcional: Scroll to top para mostrar mensaje
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          throw new Error(result.error || result.message || 'Error desconocido al enviar el voto');
        }

      } catch (error) {
        console.error('Error submitting vote:', error);
        this.debugLog(`Error enviando voto: ${error.message}`);
        
        if (this.isAuthError(error)) {
          this.handleAuthError();
        } else if (error.message.includes('already voted')) {
          this.hasVoted = true;
          this.showAlert('Ya has votado anteriormente', 'warning');
        } else {
          this.showAlert(`Error al enviar el voto: ${error.message}`, 'error');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    
    isAuthError(error) {
      return error.message.includes('401') || 
             error.message.includes('403') || 
             error.message.includes('token') ||
             error.message.includes('autenticación');
    },
    
    handleAuthError() {
      this.showAlert('Sesión expirada. Redirigiendo al login...', 'warning');
      setTimeout(() => {
        this.redirectToLogin();
      }, 2000);
    },
    
    redirectToLogin() {
      // Limpiar tokens expirados
      localStorage.removeItem('jwt_token');
      sessionStorage.removeItem('jwt_token');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      window.location.href = '/iniciar.php';
    },
    
    // Método para toggle debug mode (útil para desarrollo)
    toggleDebugMode() {
      this.debugMode = !this.debugMode;
      this.debugLog(`Debug mode ${this.debugMode ? 'activado' : 'desactivado'}`);
    }
  },
  
  async mounted() {
    this.debugLog('Aplicación iniciada');
    this.debugLog(`User Agent: ${navigator.userAgent}`);
    this.debugLog(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Verificar estado de votación
    await this.checkVoteStatus();
    
    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.debugLog(`Viewport cambiado a: ${window.innerWidth}x${window.innerHeight}`);
    });
  },
  
  beforeDestroy() {
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
  }
});

// Agregar estilos para animación de salida
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);