// JS/header.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const unifiedButton = document.getElementById('unifiedButton');
    const profileIcon = document.getElementById('profileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownUserName = document.querySelector('.dropdown-user-name');
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

    // Lógica para el menú unificado
    function setupUnifiedMenu() {
        // Click en botón unificado (no autenticado)
        if (unifiedButton) {
            unifiedButton.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });
        }

        // Click en icono de perfil (autenticado)
        if (profileIcon) {
            profileIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });
        }

        // Cerrar el menú desplegable al hacer clic en cualquier lugar
        document.addEventListener('click', function(e) {
            if (dropdownMenu && dropdownMenu.classList.contains('active') && 
                !e.target.closest('.unified-menu')) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    setupUnifiedMenu();

    // Actualizar interfaz según estado de autenticación
    updateAuthUI();
});

// Función para actualizar la UI según autenticación
function updateAuthUI() {
    const token = localStorage.getItem('jwt_token');
    const isAuthenticated = token && token.trim() !== '';
    
    const unifiedButton = document.getElementById('unifiedButton');
    const profileIcon = document.getElementById('profileIcon');
    const userHeader = document.getElementById('userHeader');
    const guestOptions = document.getElementById('guestOptions');
    const userOptions = document.getElementById('userOptions');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const profileImage = document.getElementById('profileImage');
    const dropdownProfileImage = document.getElementById('dropdownProfileImage');
    
    if (isAuthenticated) {
        // Obtener datos del usuario
        const userName = localStorage.getItem('user_name') || 'Usuario';
        const profileImageUrl = localStorage.getItem('profile_image') || '/Img/default-avatar.png';
        
        // Actualizar elementos
        if (dropdownUserName) dropdownUserName.textContent = userName;
        if (profileImage) profileImage.src = profileImageUrl;
        if (dropdownProfileImage) dropdownProfileImage.src = profileImageUrl;
        
        // Mostrar elementos de usuario autenticado
        if (unifiedButton) unifiedButton.style.display = 'none';
        if (profileIcon) profileIcon.style.display = 'block';
        if (userHeader) userHeader.style.display = 'flex';
        if (guestOptions) guestOptions.style.display = 'none';
        if (userOptions) userOptions.style.display = 'block';
    } else {
        // Mostrar elementos de invitado
        if (unifiedButton) unifiedButton.style.display = 'block';
        if (profileIcon) profileIcon.style.display = 'none';
        if (userHeader) userHeader.style.display = 'none';
        if (guestOptions) guestOptions.style.display = 'block';
        if (userOptions) userOptions.style.display = 'none';
    }
}

// Función global para cerrar sesión
window.logout = function() {
    // Eliminar datos de usuario
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('profile_image');
    
    // Actualizar interfaz
    updateAuthUI();
    
    // Redirigir
    window.location.href = '/iniciar.php';
};

// Función para cambiar idioma
window.toggleLanguage = function() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'es' ? 'en' : 'es';
    
    // Guardar preferencia
    localStorage.setItem('preferred_language', newLang);
    
    // Recargar página con nuevo idioma
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.location.href = url.toString();
};

// Función para obtener el idioma actual
function getCurrentLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    
    if (langFromUrl) {
        return langFromUrl;
    }
    
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
        return savedLang;
    }
    
    return 'es';
}

// Sincronización entre pestañas
window.addEventListener('storage', (event) => {
    if (event.key === 'user_name' || event.key === 'profile_image' || event.key === 'jwt_token') {
        updateAuthUI();
    }
});