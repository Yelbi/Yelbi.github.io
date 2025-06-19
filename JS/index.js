let currentSection = 0;
        const sections = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const container = document.getElementById('container');
        const scrollIndicator = document.getElementById('scrollIndicator');
        let isScrolling = false;

        // Función para ir a una sección específica
        function goToSection(index) {
            if (index < 0 || index >= sections.length || isScrolling) return;
            
            isScrolling = true;
            currentSection = index;
            
            // Scroll suave a la sección
            sections[currentSection].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Actualizar clases activas
            updateActiveSection();
            
            // Ocultar indicador de scroll después de la primera interacción
            if (currentSection > 0) {
                scrollIndicator.classList.add('hidden');
            }
            
            // Resetear el flag después de la animación
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        }

        // Función para actualizar la sección activa
        function updateActiveSection() {
            sections.forEach((section, index) => {
                section.classList.toggle('active', index === currentSection);
            });
            
            navDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSection);
            });
        }

        // Event listeners para los puntos de navegación
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSection(index);
            });
        });

        // Control con la rueda del mouse
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (isScrolling) return;
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    // Scroll hacia abajo
                    goToSection(currentSection + 1);
                } else {
                    // Scroll hacia arriba
                    goToSection(currentSection - 1);
                }
            }, 50);
        });

        // Control con las teclas de flecha
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                goToSection(currentSection + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSection(currentSection - 1);
            }
        });

        // Control táctil para dispositivos móviles
        let touchStartY = 0;
        let touchEndY = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        container.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe hacia arriba - ir a la siguiente sección
                    goToSection(currentSection + 1);
                } else {
                    // Swipe hacia abajo - ir a la sección anterior
                    goToSection(currentSection - 1);
                }
            }
        }

        // Inicialización
        updateActiveSection();

        // Ocultar el indicador de scroll después de 5 segundos
        setTimeout(() => {
            if (currentSection === 0) {
                scrollIndicator.style.opacity = '0.7';
            }
        }, 5000);