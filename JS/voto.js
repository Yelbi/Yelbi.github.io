Vue.config.devtools = true;

Vue.component('card', {
  template: `
    <div class="card-wrap"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      ref="card">
      <div class="card"
        :style="cardStyle">
        <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
        <div class="card-info">
          <slot name="header"></slot>
          <slot name="content"></slot>
        </div>
      </div>
    </div>`,
  mounted() {
    this.width = this.$refs.card.offsetWidth;
    this.height = this.$refs.card.offsetHeight;
  },
  props: ['dataImage'],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null
  }),
  computed: {
    mousePX() {
      return this.mouseX / this.width;
    },
    mousePY() {
      return this.mouseY / this.height;
    },
    cardStyle() {
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return {
        transform: `rotateY(${rX}deg) rotateX(${rY}deg)`
      };
    },
    cardBgTransform() {
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return {
        transform: `translateX(${tX}px) translateY(${tY}px)`
      }
    },
    cardBgImage() {
      return {
        backgroundImage: `url(${this.dataImage})`
      }
    }
  },
  methods: {
    handleMouseMove(e) {
      this.mouseX = e.pageX - this.$refs.card.offsetLeft - this.width/2;
      this.mouseY = e.pageY - this.$refs.card.offsetTop - this.height/2;
    },
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
    },
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(()=>{
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    }
  }
});

const app = new Vue({
  el: '#app',
  data: {
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
    debugMode: false // Para mostrar logs adicionales
  },
  computed: {
    canVote() {
      return !this.hasVoted && !this.isSubmitting && this.selectedOption !== null;
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
    },
    
    showAlert(message, type = 'error') {
      const alertDiv = document.getElementById('voteAlert');
      if (!alertDiv) {
        console.error('Elemento voteAlert no encontrado');
        return;
      }
      
      alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      
      // Auto-hide después de 5 segundos
      setTimeout(() => {
        alertDiv.innerHTML = '';
      }, 5000);
    },
    
    debugLog(message) {
      if (this.debugMode) {
        console.log(`[DEBUG] ${message}`);
      }
    },
    
    getAuthToken() {
      // Buscar token en localStorage y sessionStorage
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      this.debugLog(`Token encontrado: ${token ? 'Sí' : 'No'}`);
      return token;
    },
    
    async makeApiRequest(action, data = {}, method = 'POST') {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }
      
      const url = `https://seres.blog/api/auth.php?action=${action}`;
      this.debugLog(`Realizando petición a: ${url}`);
      
      const options = {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (method !== 'GET' && Object.keys(data).length > 0) {
        options.body = JSON.stringify(data);
        this.debugLog(`Datos enviados: ${JSON.stringify(data)}`);
      }
      
      const response = await fetch(url, options);
      const responseText = await response.text();
      
      this.debugLog(`Respuesta del servidor: ${responseText}`);
      
      if (!responseText.trim()) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing JSON:', responseText);
        throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || `Error HTTP ${response.status}`);
      }
      
      return result;
    },
    
    async checkVoteStatus() {
      try {
        this.isLoading = true;
        const token = this.getAuthToken();
        
        if (!token) {
          this.debugLog('No hay token, usuario no autenticado');
          this.isLoading = false;
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
        }
        
      } catch (error) {
        console.error('Error checking vote status:', error);
        this.debugLog(`Error verificando estado de voto: ${error.message}`);
        
        // Si hay error 401/403, redirigir al login
        if (error.message.includes('401') || error.message.includes('403')) {
          this.showAlert('Sesión expirada. Redirigiendo al login...', 'warning');
          setTimeout(() => {
            window.location.href = '/iniciar.php';
          }, 2000);
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async submitVote() {
      // Validaciones previas
      if (this.selectedOption === null) {
        this.showAlert('Por favor selecciona una opción');
        return;
      }

      if (this.hasVoted) {
        this.showAlert('Ya has votado anteriormente');
        return;
      }
      
      if (this.isSubmitting) {
        this.showAlert('Ya se está procesando tu voto');
        return;
      }

      this.isSubmitting = true;
      const selectedMythology = this.options[this.selectedOption].value;
      
      this.debugLog(`Enviando voto para: ${selectedMythology}`);

      try {
        const token = this.getAuthToken();
        
        if (!token) {
          this.showAlert('Debes iniciar sesión para votar');
          setTimeout(() => {
            window.location.href = '/iniciar.php';
          }, 2000);
          return;
        }

        const result = await this.makeApiRequest('submit-vote', { 
          mythology: selectedMythology 
        });

        if (result.success) {
          this.hasVoted = true;
          this.showAlert('¡Gracias por tu voto! Tu selección ha sido registrada.', 'success');
          
          // Opcional: Deshabilitar la selección visualmente
          this.selectedOption = null;
          
          this.debugLog('Voto enviado exitosamente');
        } else {
          throw new Error(result.error || 'Error desconocido al enviar el voto');
        }

      } catch (error) {
        console.error('Error submitting vote:', error);
        this.debugLog(`Error enviando voto: ${error.message}`);
        
        // Manejar errores específicos
        if (error.message.includes('401') || error.message.includes('403')) {
          this.showAlert('Sesión expirada. Redirigiendo al login...', 'warning');
          setTimeout(() => {
            window.location.href = '/iniciar.php';
          }, 2000);
        } else if (error.message.includes('already voted')) {
          this.hasVoted = true;
          this.showAlert('Ya has votado anteriormente');
        } else {
          this.showAlert('Error al enviar el voto: ' + error.message);
        }
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  
  async mounted() {
    this.debugLog('Componente montado, verificando estado de voto...');
    await this.checkVoteStatus();
  }
});