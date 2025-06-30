// JS/header.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const profileMenuToggle = document.getElementById('profileMenuToggle');
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
        
        // Buscar el nombre en múltiples campos posibles
        const userName = payload.name || payload.username || payload.email || 'Usuario';
        
        // Actualizar el nombre en todas las ubicaciones
        dropdownUserName.textContent = userName;
        
        // Cargar imagen de perfil si existe
        if (payload.profile_image) {
            profileImage.src = payload.profile_image;
            dropdownProfileImage.src = payload.profile_image;
        }

        // Mostrar menú de perfil y ocultar botón de login
        const loginButton = document.getElementById('loginButton');
        const profileMenu = document.getElementById('profileMenu');
        if (loginButton) loginButton.style.display = 'none';
        if (profileMenu) profileMenu.style.display = 'block';
    } catch (e) {
        console.error('Error decoding token', e);
    }
        }
    }

    // Funcionalidad de cambio de idioma
    setupLanguageSwitcher();
});

// Función para configurar el cambio de idioma
function setupLanguageSwitcher() {
    const languageToggle = document.querySelector('.dropdown-item[onclick="toggleLanguage()"]');
    
    if (languageToggle) {
        // Remover el onclick inline si existe
        languageToggle.removeAttribute('onclick');
        
        // Agregar el event listener
        languageToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleLanguageMenu(this);
        });
    }
}

// Función para mostrar/ocultar el submenu de idiomas
function toggleLanguageMenu(element) {
    // Verificar si ya existe un submenu
    let existingSubmenu = element.nextElementSibling;
    if (existingSubmenu && existingSubmenu.classList.contains('language-submenu')) {
        existingSubmenu.remove();
        return;
    }

    // Crear el submenu de idiomas
    const submenu = document.createElement('div');
    submenu.className = 'language-submenu';
    submenu.innerHTML = `
        <a href="?lang=es" class="dropdown-item submenu-item ${getCurrentLanguage() === 'es' ? 'active' : ''}">
            <span class="flag">🇪🇸</span> Español
        </a>
        <a href="?lang=en" class="dropdown-item submenu-item ${getCurrentLanguage() === 'en' ? 'active' : ''}">
            <span class="flag">🇺🇸</span> English
        </a>
    `;

    // Insertar el submenu después del elemento clickeado
    element.parentNode.insertBefore(submenu, element.nextSibling);

    // Agregar estilos inline para el submenu (se podría mover al CSS)
    submenu.style.cssText = `
        background: #f8f9fa;
        border-left: 3px solid #007bff;
        margin-left: 15px;
        border-radius: 4px;
        overflow: hidden;
        animation: slideDown 0.3s ease;
    `;

    // Agregar event listeners para los enlaces de idioma
    submenu.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Permitir que el enlace funcione normalmente
            // El cambio de página se manejará por el href
        });
    });
}

// Función para obtener el idioma actual
function getCurrentLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    
    if (langFromUrl) {
        return langFromUrl;
    }
    
    // Si no hay parámetro en la URL, intentar obtenerlo del localStorage o del navegador
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
        return savedLang;
    }
    
    // Por defecto, usar español
    return 'es';
}

// Función global para cerrar sesión
window.logout = function() {
    localStorage.removeItem('jwt_token');
    
    // Actualizar la interfaz inmediatamente
    const loginButton = document.getElementById('loginButton');
    const profileMenu = document.getElementById('profileMenu');
    
    if (loginButton) loginButton.style.display = 'block';
    if (profileMenu) profileMenu.style.display = 'none';
    
    // Redirigir
    window.location.href = '/iniciar.php';
};

// Función global para el toggle de idioma (mantener compatibilidad)
window.toggleLanguage = function() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'es' ? 'en' : 'es';
    
    // Guardar preferencia
    localStorage.setItem('preferred_language', newLang);
    
    // Cambiar idioma
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.location.href = url.toString();
};