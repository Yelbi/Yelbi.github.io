// JS/header.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownUserName = document.querySelector('.dropdown-user-name');
    const profileImage = document.getElementById('profileImage');
    const dropdownProfileImage = document.getElementById('dropdownProfileImage');
    const languageButton = document.getElementById('languageButton');

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
    }

    // Actualizar interfaz según estado de autenticación
    updateAuthUI();

    // Configurar botón de idioma
    if (languageButton) {
        languageButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleLanguage();
        });
    }
});

// Función para actualizar la UI según autenticación
function updateAuthUI() {
    const token = localStorage.getItem('jwt_token');
    const isAuthenticated = token && token.trim() !== '';
    
    const loginButton = document.getElementById('loginButton');
    const profileMenu = document.getElementById('profileMenu');
    const languageButton = document.getElementById('languageButton');
    
    if (isAuthenticated) {
        // Obtener datos del usuario
        const userName = localStorage.getItem('user_name') || 'Usuario';
        const profileImageUrl = localStorage.getItem('profile_image') || '/Img/default-avatar.png';
        
        // Actualizar elementos
        if (dropdownUserName) dropdownUserName.textContent = userName;
        if (profileImage) profileImage.src = profileImageUrl;
        if (dropdownProfileImage) dropdownProfileImage.src = profileImageUrl;
        
        // Mostrar menú de perfil y ocultar botones de login
        if (loginButton) loginButton.style.display = 'none';
        if (languageButton) languageButton.style.display = 'none';
        if (profileMenu) profileMenu.style.display = 'block';
    } else {
        // Mostrar botones de login/idioma y ocultar perfil
        if (loginButton) loginButton.style.display = 'block';
        if (languageButton) languageButton.style.display = 'block';
        if (profileMenu) profileMenu.style.display = 'none';
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