document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.getElementById('menuToggle');
            const navMenu = document.getElementById('navMenu');

            // Verificar que los elementos existan
            if (!menuToggle || !navMenu) {
                console.error('Elementos del menú no encontrados');
                return;
            }

            // Menu hamburguesa
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                navMenu.classList.toggle('active');
                
                // Cambiar el icono del botón
                if (navMenu.classList.contains('active')) {
                    menuToggle.innerHTML = '✕';
                } else {
                    menuToggle.innerHTML = '☰';
                }
            });

            // Cerrar menú al hacer clic en un enlace
            document.querySelectorAll('.nav-link').forEach(function(link) {
                link.addEventListener('click', function() {
                    navMenu.classList.remove('active');
                    menuToggle.innerHTML = '☰';
                });
            });

            // Cerrar menú al hacer clic fuera de él
            document.addEventListener('click', function(e) {
                if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.innerHTML = '☰';
                }
            });

            // Cerrar menú al redimensionar la ventana
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768) {
                    navMenu.classList.remove('active');
                    menuToggle.innerHTML = '☰';
                }
            });
        });