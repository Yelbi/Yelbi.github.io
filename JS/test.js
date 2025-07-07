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
        // Obtener todas las preguntas del DOM
        const questionElements = document.querySelectorAll('.question');
        questionElements.forEach((question, index) => {
            this.questions.push({
                element: question,
                answered: false
            });
            
            // Agregar índice a cada pregunta
            const questionNumber = question.querySelector('h3');
            if (questionNumber) {
                const numberSpan = document.createElement('span');
                numberSpan.className = 'question-number';
                numberSpan.textContent = `Pregunta ${index + 1} de ${this.totalQuestions}`;
                question.insertBefore(numberSpan, questionNumber);
            }
            
            // Crear contenedor de opciones
            const labels = question.querySelectorAll('label');
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options';
            
            labels.forEach((label, optIndex) => {
                const option = document.createElement('div');
                option.className = 'option';
                option.dataset.value = label.querySelector('input').value;
                option.dataset.question = index + 1;
                option.innerHTML = label.innerHTML;
                
                // Agregar evento de clic
                option.addEventListener('click', () => {
                    this.selectOption(index + 1, option.dataset.value, option);
                });
                
                optionsContainer.appendChild(option);
                label.style.display = 'none';
            });
            
            question.appendChild(optionsContainer);
        });
    }

    setupEventListeners() {
        // Botón anterior
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        // Botón siguiente
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        // Botón enviar
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTest());
        }

        // Prevenir envío del formulario por defecto
        const form = document.getElementById('personalityTest');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitTest();
            });
        }
    }

    selectOption(questionNumber, value, optionElement) {
        // Remover selección anterior
        const questionContainer = optionElement.closest('.question');
        questionContainer.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Agregar selección actual
        optionElement.classList.add('selected');
        
        // Guardar respuesta
        this.answers[`q${questionNumber}`] = value;
        
        // Marcar pregunta como respondida
        this.questions[questionNumber - 1].answered = true;

        // Actualizar el input radio correspondiente
        const radioInput = questionContainer.querySelector(`input[value="${value}"]`);
        if (radioInput) {
            radioInput.checked = true;
        }

        // Actualizar botones
        this.updateNavigationButtons();

        // Auto-avanzar después de un breve delay si no es la última pregunta
        if (this.currentQuestion < this.totalQuestions - 1) {
            setTimeout(() => {
                this.nextQuestion();
            }, 800);
        }
    }

    showQuestion(index) {
        // Ocultar todas las preguntas
        this.questions.forEach((question, i) => {
            question.element.classList.remove('active', 'prev');
            if (i < index) {
                question.element.classList.add('prev');
            }
        });

        // Mostrar pregunta actual
        if (this.questions[index]) {
            this.questions[index].element.classList.add('active');
        }

        // Actualizar progreso
        this.updateProgressBar();
        this.updateNavigationButtons();

        // Restaurar selección si existe
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

        // Botón anterior
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 0;
        }

        // Botón siguiente
        if (nextBtn) {
            nextBtn.disabled = this.currentQuestion === this.totalQuestions - 1;
        }

        // Botón enviar
        if (submitBtn) {
            const allAnswered = this.questions.every(q => q.answered);
            submitBtn.disabled = !allAnswered;
            submitBtn.style.display = this.currentQuestion === this.totalQuestions - 1 ? 'inline-flex' : 'none';
        }

        // Ocultar botón siguiente en la última pregunta
        if (nextBtn) {
            nextBtn.style.display = this.currentQuestion === this.totalQuestions - 1 ? 'none' : 'inline-flex';
        }
    }

    submitTest() {
        const allAnswered = this.questions.every(q => q.answered);
        
        if (!allAnswered) {
            this.showNotification('Por favor, responde todas las preguntas antes de enviar el test.', 'warning');
            return;
        }

        // Crear y enviar formulario
        const form = document.getElementById('personalityTest');
        if (form) {
            // Crear botón de envío temporal
            const submitInput = document.createElement('input');
            submitInput.type = 'hidden';
            submitInput.name = 'submit';
            submitInput.value = '1';
            form.appendChild(submitInput);

            // Mostrar loading
            this.showLoading();

            // Enviar formulario
            form.submit();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

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
                <p>Calculando tu resultado...</p>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const spinnerStyles = `
            .loading-spinner {
                text-align: center;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = spinnerStyles;
        document.head.appendChild(style);

        document.body.appendChild(loading);
    }

    // Métodos para navegación por teclado
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

// Inicializar el test cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página del test y no en los resultados
    if (document.getElementById('personalityTest') && !document.querySelector('.test-result')) {
        const test = new PersonalityTest();
        
        // Agregar navegación por teclado
        document.addEventListener('keydown', (e) => test.handleKeyPress(e));
        
        // Agregar indicador de navegación por teclado
        const helpText = document.createElement('div');
        helpText.className = 'keyboard-help';
        helpText.innerHTML = `
            <small>💡 Usa las flechas ← → para navegar, Enter para continuar, o números 1-4 para seleccionar opciones</small>
        `;
        helpText.style.cssText = `
            text-align: center;
            margin-top: 1rem;
            padding: 0.5rem;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            color: #667eea;
            font-size: 0.9rem;
        `;
        
        const container = document.querySelector('.test-container');
        if (container) {
            container.appendChild(helpText);
        }
    }
});

// Función para manejar el cambio de idioma en tiempo real
function updateLanguage() {
    // Esta función se puede expandir para cambiar dinámicamente el idioma
    // sin recargar la página si es necesario
    console.log('Idioma actualizado');
}

// Exportar para uso global si es necesario
window.PersonalityTest = PersonalityTest;