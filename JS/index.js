let currentSection = 0;
        const sections = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const container = document.getElementById('container');
        const scrollIndicator = document.getElementById('scrollIndicator');
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

        // Código de la animación de estrellas
        const canvas = document.getElementById('starfield');
        const ctx = canvas.getContext('2d');
        let stars = [];
        
        const params = {
            starCount: 1000,
            speed: 2.0,
            twinkle: 0.2,
            size: 1.0
        };
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        
        function createStars(num) {
            stars = [];
            for (let i = 0; i < num; i++) {
                const starType = Math.random();
                let size, speed, color, twinkleRate;
                
                if (starType < 0.7) {
                    size = Math.random() * 0.8 + 0.2;
                    speed = Math.random() * 0.5 + 0.5;
                    color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
                    twinkleRate = Math.random() * 0.02;
                } else if (starType < 0.9) {
                    size = Math.random() * 1.5 + 0.8;
                    speed = Math.random() * 1.0 + 1.0;
                    color = `rgba(255, 240, 200, ${Math.random() * 0.8 + 0.2})`;
                    twinkleRate = Math.random() * 0.03 + 0.01;
                } else {
                    size = Math.random() * 2.5 + 1.5;
                    speed = Math.random() * 1.5 + 1.5;
                    const colorType = Math.random();
                    if (colorType < 0.4) {
                        color = `rgba(200, 220, 255, ${Math.random() * 0.9 + 0.1})`;
                    } else if (colorType < 0.7) {
                        color = `rgba(255, 200, 150, ${Math.random() * 0.9 + 0.1})`;
                    } else {
                        color = `rgba(220, 180, 255, ${Math.random() * 0.9 + 0.1})`;
                    }
                    twinkleRate = Math.random() * 0.05 + 0.02;
                }
                
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: Math.random() * canvas.width,
                    baseSize: size,
                    speed: speed,
                    color: color,
                    twinkleRate: twinkleRate,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    size: size
                });
            }
        }
        
        createStars(params.starCount);
        
        function animate() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let s of stars) {
                s.z -= s.speed * params.speed;
                
                if (s.z <= 0) {
                    s.z = canvas.width;
                    s.x = Math.random() * canvas.width;
                    s.y = Math.random() * canvas.height;
                }
                
                const k = 128.0 / s.z;
                const px = (s.x - canvas.width/2) * k + canvas.width/2;
                const py = (s.y - canvas.height/2) * k + canvas.height/2;
                
                const twinkle = Math.sin(Date.now() * s.twinkleRate + s.twinkleOffset) * params.twinkle * 0.5 + 0.5;
                s.size = s.baseSize * twinkle * params.size;
                
                const size = s.size * (1 - s.z/canvas.width) * 3;
                
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
                
                if (size > 1.5) {
                    ctx.globalAlpha = 0.3 * twinkle;
                    ctx.beginPath();
                    ctx.arc(px, py, size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();