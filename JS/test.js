class PersonalityTest {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.answers = {};
        this.questions = [];
        this.init();
    }

    init() {
        this.setupQuestions();
        this.setupEventListeners();
        this.updateProgressBar();
        this.showQuestion(0);
    }

    setupQuestions() {
        const questionElements = document.querySelectorAll('.question');
        questionElements.forEach((question, index) => {
            this.questions.push({
                element: question,
                answered: false
            });
            
            // Crear opciones clickeables
            const labels = question.querySelectorAll('label');
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options';
            
            labels.forEach((label) => {
                const option = document.createElement('div');
                option.className = 'option';
                const input = label.querySelector('input');
                option.dataset.value = input.value;
                option.dataset.question = index + 1;
                option.textContent = label.textContent.trim();
                
                option.addEventListener('click', () => {
                    this.selectOption(index + 1, input.value, option);
                });
                
                optionsContainer.appendChild(option);
            });
            
            question.appendChild(optionsContainer);
        });
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const form = document.getElementById('personalityTest');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTest());
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitTest();
            });
        }
    }

    selectOption(questionNumber, value, optionElement) {
        // Limpiar selección anterior
        const questionContainer = optionElement.closest('.question');
        questionContainer.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Seleccionar nueva opción
        optionElement.classList.add('selected');
        this.answers[`q${questionNumber}`] = value;
        this.questions[questionNumber - 1].answered = true;

        // Marcar el radio correspondiente
        const radioInput = questionContainer.querySelector(`input[value="${value}"]`);
        if (radioInput) {
            radioInput.checked = true;
        }

        this.updateNavigationButtons();

        // Auto-avance después de seleccionar (excepto en la última pregunta)
        if (this.currentQuestion < this.totalQuestions - 1) {
            setTimeout(() => {
                this.nextQuestion();
            }, 500);
        }
    }

    showQuestion(index) {
        // Ocultar todas las preguntas
        this.questions.forEach(question => {
            question.element.classList.remove('active');
        });

        // Mostrar pregunta actual
        if (this.questions[index]) {
            this.questions[index].element.classList.add('active');
        }

        this.updateProgressBar();
        this.updateNavigationButtons();
        this.restoreSelection(index);
    }

    restoreSelection(questionIndex) {
        const questionNumber = questionIndex + 1;
        const answer = this.answers[`q${questionNumber}`];
        
        if (answer) {
            const question = this.questions[questionIndex].element;
            const option = question.querySelector(`[data-value="${answer}"]`);
            if (option) {
                option.classList.add('selected');
            }
        }
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    }

    updateProgressBar() {
        const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${this.currentQuestion + 1} de ${this.totalQuestions}`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentQuestion === this.totalQuestions - 1;
            nextBtn.style.display = this.currentQuestion === this.totalQuestions - 1 ? 'none' : 'inline-flex';
        }

        if (submitBtn) {
            const allAnswered = this.questions.every(q => q.answered);
            submitBtn.disabled = !allAnswered;
            submitBtn.style.display = this.currentQuestion === this.totalQuestions - 1 ? 'inline-flex' : 'none';
        }
    }

    submitTest() {
        const allAnswered = this.questions.every(q => q.answered);
        
        if (!allAnswered) {
            this.showNotification('Por favor, responde todas las preguntas antes de enviar el test.', 'warning');
            return;
        }

        const form = document.getElementById('personalityTest');
        if (form) {
            const submitInput = document.createElement('input');
            submitInput.type = 'hidden';
            submitInput.name = 'submit';
            submitInput.value = '1';
            form.appendChild(submitInput);

            this.showLoading();
            form.submit();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Procesando resultados...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    // Navegación por teclado
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.previousQuestion();
                break;
            case 'ArrowRight':
                this.nextQuestion();
                break;
            case 'Enter':
                if (this.currentQuestion === this.totalQuestions - 1) {
                    this.submitTest();
                } else {
                    this.nextQuestion();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(event.key) - 1;
                const currentQuestion = this.questions[this.currentQuestion];
                const options = currentQuestion.element.querySelectorAll('.option');
                if (options[optionIndex]) {
                    options[optionIndex].click();
                }
                break;
        }
    }
}

// Inicializar el test
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('personalityTest') && !document.querySelector('.test-result')) {
        const test = new PersonalityTest();
        
        // Navegación por teclado
        document.addEventListener('keydown', (e) => test.handleKeyPress(e));
        
        // Ayuda de teclado
        const helpText = document.createElement('div');
        helpText.className = 'keyboard-help';
        helpText.innerHTML = `
            <small>💡 Usa las flechas ← → para navegar o los números 1-4 para seleccionar</small>
        `;
        
        const container = document.querySelector('.test-container');
        if (container) {
            container.appendChild(helpText);
        }
    }
});

// Confetti simple para resultados
function createSimpleConfetti() {
    const confetti = document.getElementById('confetti');
    if (!confetti) return;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 30; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.appendChild(piece);
    }
    
    setTimeout(() => {
        confetti.innerHTML = '';
    }, 4000);
}

// Exportar para uso global
window.PersonalityTest = PersonalityTest;
window.createSimpleConfetti = createSimpleConfetti;