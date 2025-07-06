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
    hasVoted: false
  },
  methods: {
    selectOption(index) {
      if (this.hasVoted) return;
      this.selectedOption = index;
    },
    
    showAlert(message, type = 'error') {
      const alertDiv = document.getElementById('voteAlert');
      alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      
      setTimeout(() => {
        alertDiv.innerHTML = '';
      }, 5000);
    },
    
async submitVote() {
    if (this.selectedOption === null) {
        this.showAlert('Por favor selecciona una opción');
        return;
    }

    if (this.hasVoted) {
        this.showAlert('Ya has votado anteriormente');
        return;
    }

    this.isSubmitting = true;
    const selectedMythology = this.options[this.selectedOption].value;

    try {
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        if (!token) {
            this.showAlert('Debes iniciar sesión para votar');
            setTimeout(() => {
                window.location.href = '/iniciar.php';
            }, 2000);
            return;
        }

        const response = await fetch('https://seres.blog/api/auth.php?action=submit-vote', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mythology: selectedMythology })
        });

        const responseText = await response.text();
        console.log('Response:', responseText); // Para debugging

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing JSON:', responseText);
            throw new Error('Respuesta inválida del servidor');
        }

        if (response.ok && result.success) {
            this.hasVoted = true;
            this.showAlert('¡Gracias por tu voto!', 'success');
        } else {
            throw new Error(result.error || `Error ${response.status}`);
        }

    } catch (error) {
        console.error('Error:', error);
        this.showAlert('Error: ' + error.message);
    } finally {
        this.isSubmitting = false;
    }
}
  },
  async mounted() {
    // Verificar si ya votó
    try {
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      if (token) {
        const response = await fetch('https://seres.blog/api/auth.php?action=check-vote', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.hasVoted = result.hasVoted;
          if (this.hasVoted) {
            this.showAlert('Ya has votado anteriormente. Gracias por participar!', 'success');
          }
        }
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  }
});