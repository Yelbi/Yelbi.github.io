document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.survey-question');
    const prevBtn = document.getElementById('surveyPrev');
    const nextBtn = document.getElementById('surveyNext');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const completionScreen = document.getElementById('surveyCompletion');
    const completeBtn = document.getElementById('surveyComplete');
    const form = document.getElementById('surveyForm');
    
    let currentQuestion = 1;
    const totalQuestions = questions.length;
    const answers = {};

    // Inicializar
    updateNavigation();

    // Manejar clic en opciones
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => {
            const questionContainer = item.closest('.survey-question');
            const questionNum = questionContainer.dataset.question;
            const input = item.querySelector('input');
            
            // Limpiar selección anterior
            questionContainer.querySelectorAll('.option-item').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Marcar como seleccionado
            item.classList.add('selected');
            input.checked = true;
            
            // Guardar respuesta
            answers[`q${questionNum}`] = input.value;
            
            // Actualizar navegación
            updateNavigation();
        });
    });

    // Navegación
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 1) {
            switchQuestion(currentQuestion, currentQuestion - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestion < totalQuestions) {
            switchQuestion(currentQuestion, currentQuestion + 1);
        } else {
            showCompletion();
        }
    });

    // Botón de completado
    completeBtn.addEventListener('click', () => {
        const filters = Object.values(answers).join(',');
        window.location.href = `/galeria.php?filter=${filters}`;
    });

    function switchQuestion(oldIndex, newIndex) {
        const oldQuestion = document.querySelector(`[data-question="${oldIndex}"]`);
        const newQuestion = document.querySelector(`[data-question="${newIndex}"]`);
        
        oldQuestion.classList.remove('visible');
        newQuestion.classList.add('visible');
        
        currentQuestion = newIndex;
        updateNavigation();
    }

    function updateNavigation() {
        // Actualizar progreso
        const progress = (currentQuestion / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${currentQuestion} de ${totalQuestions}`;
        
        // Actualizar botones
        prevBtn.disabled = currentQuestion === 1;
        nextBtn.disabled = !answers[`q${currentQuestion}`];
        nextBtn.textContent = currentQuestion === totalQuestions ? 'Finalizar' : 'Siguiente →';
    }

    function showCompletion() {
        form.style.display = 'none';
        document.querySelector('.survey-navigation').style.display = 'none';
        document.querySelector('.survey-header').style.display = 'none';
        completionScreen.style.display = 'block';
    }

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) prevBtn.click();
        if (e.key === 'ArrowRight' && !nextBtn.disabled) nextBtn.click();
    });
});