        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        // Menu hamburguesa
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });