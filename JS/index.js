let currentSection = 0;
        const sections = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const container = document.getElementById('container');
        const scrollIndicator = document.getElementById('scrollIndicator');
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        let isScrolling = false;

        function goToSection(index) {
            if (index < 0 || index >= sections.length || isScrolling) return;
            
            isScrolling = true;
            currentSection = index;
            
            sections[currentSection].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            updateActiveSection();
            
            if (currentSection > 0) {
                scrollIndicator.classList.add('hidden');
            }
            
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        }

        function updateActiveSection() {
            sections.forEach((section, index) => {
                section.classList.toggle('active', index === currentSection);
            });
            
            navDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSection);
            });
        }

        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSection(index);
            });
        });

        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (isScrolling) return;
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    goToSection(currentSection + 1);
                } else {
                    goToSection(currentSection - 1);
                }
            }, 50);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                goToSection(currentSection + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSection(currentSection - 1);
            }
        });

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
                    goToSection(currentSection + 1);
                } else {
                    goToSection(currentSection - 1);
                }
            }
        }

        updateActiveSection();

        setTimeout(() => {
            if (currentSection === 0) {
                scrollIndicator.style.opacity = '0.7';
            }
        }, 5000);