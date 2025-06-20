// Animación de estrellas
        const canvas = document.getElementById('starfield');
        const ctx = canvas.getContext('2d');
        let stars = [];
        
        // Parámetros fijos
        const params = {
            starCount: 1000,
            speed: 2.0,
            twinkle: 0.2,  // Parpadeo reducido a 0.2
            size: 1.0
        };
        
        // Ajustar tamaño del canvas
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        
        // Generador de estrellas mejorado
        function createStars(num) {
            stars = [];
            for (let i = 0; i < num; i++) {
                const starType = Math.random();
                let size, speed, color, twinkleRate;
                
                if (starType < 0.7) {
                    // Estrellas pequeñas (70%)
                    size = Math.random() * 0.8 + 0.2;
                    speed = Math.random() * 0.5 + 0.5;
                    color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
                    twinkleRate = Math.random() * 0.02;
                } else if (starType < 0.9) {
                    // Estrellas medianas (20%)
                    size = Math.random() * 1.5 + 0.8;
                    speed = Math.random() * 1.0 + 1.0;
                    color = `rgba(255, 240, 200, ${Math.random() * 0.8 + 0.2})`;
                    twinkleRate = Math.random() * 0.03 + 0.01;
                } else {
                    // Estrellas grandes y coloridas (10%)
                    size = Math.random() * 2.5 + 1.5;
                    speed = Math.random() * 1.5 + 1.5;
                    const colorType = Math.random();
                    if (colorType < 0.4) {
                        color = `rgba(200, 220, 255, ${Math.random() * 0.9 + 0.1})`; // Azul
                    } else if (colorType < 0.7) {
                        color = `rgba(255, 200, 150, ${Math.random() * 0.9 + 0.1})`; // Naranja
                    } else {
                        color = `rgba(220, 180, 255, ${Math.random() * 0.9 + 0.1})`; // Púrpura
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
        
        // Inicializar estrellas
        createStars(params.starCount);
        
        function animate() {
            // Fondo negro sólido
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Actualizar y dibujar estrellas
            for (let s of stars) {
                // Movimiento en perspectiva
                s.z -= s.speed * params.speed;
                
                // Reiniciar estrella si sale del campo de visión
                if (s.z <= 0) {
                    s.z = canvas.width;
                    s.x = Math.random() * canvas.width;
                    s.y = Math.random() * canvas.height;
                }
                
                // Calcular posición en pantalla
                const k = 128.0 / s.z;
                const px = (s.x - canvas.width/2) * k + canvas.width/2;
                const py = (s.y - canvas.height/2) * k + canvas.height/2;
                
                // Efecto de parpadeo con parámetro ajustado
                const twinkle = Math.sin(Date.now() * s.twinkleRate + s.twinkleOffset) * params.twinkle * 0.5 + 0.5;
                s.size = s.baseSize * twinkle * params.size;
                
                // Ajustar tamaño por perspectiva
                const size = s.size * (1 - s.z/canvas.width) * 3;
                
                // Dibujar estrella
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Destello sutil para estrellas grandes
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

        // Funcionalidad de navegación por secciones
        const sections = document.querySelectorAll('.section');
        const navDots = document.querySelectorAll('.nav-dot');
        const scrollIndicator = document.getElementById('scrollIndicator');
        
        // Actualizar navegación por puntos
        function updateNavDots() {
            const scrollPosition = window.scrollY;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navDots.forEach(dot => dot.classList.remove('active'));
                    navDots[index].classList.add('active');
                    
                    // Ocultar indicador en la última sección
                    if (index === sections.length - 1) {
                        scrollIndicator.classList.add('hidden');
                    } else {
                        scrollIndicator.classList.remove('hidden');
                    }
                }
            });
        }
        
        // Event listeners para puntos de navegación
        navDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const sectionIndex = parseInt(dot.getAttribute('data-section'));
                sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Scroll snapping
        window.addEventListener('scroll', updateNavDots);
        updateNavDots();
        
        // Efecto de desplazamiento suave para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });