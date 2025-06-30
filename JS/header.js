// JS/header.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const profileImage = document.getElementById('profileImage');
    const dropdownProfileImage = document.getElementById('dropdownProfileImage');

    // Verificar que los elementos existan
    if (!menuToggle || !navMenu) {
        console.error('Menu elements not found');
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

    // Lógica para el menú de perfil
    if (profileMenuToggle && dropdownMenu) {
        profileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // Cerrar el menú desplegable al hacer clic en cualquier lugar
        document.addEventListener('click', function(e) {
            if (dropdownMenu.classList.contains('active') && 
                !e.target.closest('.profile-menu')) {
                dropdownMenu.classList.remove('active');
            }
        });

        // Cargar datos del usuario si está autenticado
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.name) {
                    dropdownUserName.textContent = payload.name;
                    
                    // Cargar imagen de perfil si existe
                    if (payload.profile_image) {
                        profileImage.src = payload.profile_image;
                        dropdownProfileImage.src = payload.profile_image;
                    }
                }
            } catch (e) {
                console.error('Error decoding token', e);
            }
        }
    }
});

// Función global para cerrar sesión
window.logout = function() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/iniciar.php';
};