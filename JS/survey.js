class SurveyManager {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 3;
        this.answers = {};
        this.isCompleted = false;
        
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.modal = document.getElementById('surveyModal');
        this.trigger = document.getElementById('surveyTrigger');
        this.closeBtn = document.getElementById('surveyClose');
        this.form = document.getElementById('surveyForm');
        this.questions = document.querySelectorAll('.survey-question');
        this.prevBtn = document.getElementById('surveyPrev');
        this.nextBtn = document.getElementById('surveyNext');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.completion = document.getElementById('surveyCompletion');
        this.completeBtn = document.getElementById('surveyComplete');
    }

    bindEvents() {
        this.trigger.addEventListener('click', () => this.openModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.completeBtn.addEventListener('click', () => this.handleCompletion());

        // Escuchar cambios en las opciones
        this.form.addEventListener('change', (e) => this.handleAnswerChange(e));
        
        // Escuchar clicks en las opciones
        document.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'radio') {
                    const radio = item.querySelector('input[type="radio"]');
                    if (radio) radio.click();
                }
            });
        });

        // Teclas de navegación
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active')) {
                if (e.key === 'Escape') this.closeModal();
                if (e.key === 'ArrowLeft' && !this.prevBtn.disabled) this.previousQuestion();
                if (e.key === 'ArrowRight' && !this.nextBtn.disabled) this.nextQuestion();
            }
        });
    }

    openModal() {
        this.modal.classList.add('active');
        this.modal.style.display = 'flex'; // Asegurar que el modal se muestre
        document.body.style.overflow = 'hidden';
        this.updateProgress();
        
        // Animar entrada de preguntas
        setTimeout(() => {
            this.animateCurrentQuestion();
        }, 300);
    }

    closeModal() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }

    handleAnswerChange(e) {
        const questionNum = e.target.name;
        const value = e.target.value;
        
        this.answers[questionNum] = value;
        
        // Marcar opción como seleccionada
        const currentQuestion = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        if (currentQuestion) {
            currentQuestion.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            const selectedOption = e.target.closest('.option-item');
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
        
        this.updateNavigationButtons();
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.hideCurrentQuestion();
            this.currentQuestion++;
            setTimeout(() => {
                this.showCurrentQuestion();
                this.updateProgress();
                this.updateNavigationButtons();
            }, 300);
        } else {
            this.showCompletion();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.hideCurrentQuestion();
            this.currentQuestion--;
            setTimeout(() => {
                this.showCurrentQuestion();
                this.updateProgress();
                this.updateNavigationButtons();
            }, 300);
        }
    }

    showCurrentQuestion() {
        const currentQ = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        if (currentQ) {
            currentQ.style.display = 'block';
            setTimeout(() => {
                currentQ.classList.add('visible');
            }, 50);
        }
    }

    hideCurrentQuestion() {
        const currentQ = document.querySelector(`[data-question="${this.currentQuestion}"]`);
        if (currentQ) {
            currentQ.classList.remove('visible');
            setTimeout(() => {
                currentQ.style.display = 'none';
            }, 300);
        }
    }

    animateCurrentQuestion() {
        this.questions.forEach(q => {
            q.style.display = 'none';
            q.classList.remove('visible');
        });
        this.showCurrentQuestion();
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.totalQuestions) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.currentQuestion} de ${this.totalQuestions}`;
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentQuestion === 1;
        
        const currentAnswer = this.answers[`q${this.currentQuestion}`];
        this.nextBtn.disabled = !currentAnswer;
        
        if (this.currentQuestion === this.totalQuestions && currentAnswer) {
            this.nextBtn.textContent = 'Finalizar';
        } else {
            this.nextBtn.textContent = 'Siguiente';
        }
    }

    showCompletion() {
        this.form.style.display = 'none';
        const navigation = document.querySelector('.survey-navigation');
        const header = document.querySelector('.survey-header');
        
        if (navigation) navigation.style.display = 'none';
        if (header) header.style.display = 'none';
        
        this.completion.style.display = 'block';
        this.isCompleted = true;
        
        // Guardar respuestas en memoria (sin localStorage)
        this.saveAnswers();
    }

    saveAnswers() {
        // Guardar respuestas en memoria durante la sesión
        console.log('Respuestas de la encuesta:', this.answers);
        
        // Aquí podrías enviar las respuestas al servidor si fuera necesario
        // fetch('/api/save-survey', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(this.answers)
        // });
    }

    handleCompletion() {
        this.closeModal();
        
        // Redirigir a galería con filtros basados en respuestas
        const recommendations = this.getRecommendations();
        
        // Construir la URL con los filtros
        const params = new URLSearchParams();
        recommendations.forEach(rec => params.append('filter', rec));
        
        window.location.href = `/galeria.php?${params.toString()}`;
    }

    getRecommendations() {
        // Lógica para generar recomendaciones basadas en respuestas
        const recommendations = [];
        
        if (this.answers.q1) recommendations.push(this.answers.q1);
        if (this.answers.q2) recommendations.push(this.answers.q2);
        if (this.answers.q3) recommendations.push(this.answers.q3);
        
        return recommendations;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SurveyManager();
});