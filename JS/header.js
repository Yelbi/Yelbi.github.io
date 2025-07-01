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

    // Actualizar interfaz según estado de autenticación al cargar
    updateAuthUI();
});

// Función mejorada para validar token
async function checkTokenValidity() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        updateAuthUI();
        return;
    }

    try {
        // Verificar si el token ha expirado mediante una llamada al API
        const response = await fetch('https://seres.blog/api/auth.php?action=validate-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        const result = await response.json();
        if (!result.valid) {
            throw new Error('Token expirado');
        }

    } catch (error) {
        console.log('Token expirado o inválido, limpiando sesión...');
        clearUserSession();
        updateAuthUI();
    }
}

// Función para limpiar completamente la sesión
function clearUserSession() {
    const userId = localStorage.getItem('user_id');
    
    // Si tenemos un usuario, mantener solo su imagen
    if (userId) {
        const userImageKey = getUserImageKey(userId);
        const userImage = localStorage.getItem(userImageKey);
        
        // Limpiar todo el localStorage excepto la imagen de este usuario
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
            if (key !== userImageKey) {
                localStorage.removeItem(key);
            }
        }
        
        // Restaurar la imagen si existía
        if (userImage) {
            localStorage.setItem(userImageKey, userImage);
        }
    } else {
        // Limpiar todo si no hay usuario
        localStorage.clear();
    }
    
    // Limpiar sessionStorage
    sessionStorage.clear();
}

// Función mejorada para actualizar la UI según autenticación
function updateAuthUI() {
    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('user_id');
    const isAuthenticated = token && token.trim() !== '' && !isTokenExpired(token);
    
    const unifiedButton = document.getElementById('unifiedButton');
    const profileIcon = document.getElementById('profileIcon');
    const userHeader = document.getElementById('userHeader');
    const guestOptions = document.getElementById('guestOptions');
    const userOptions = document.getElementById('userOptions');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const profileImage = document.getElementById('profileImage');
    const dropdownProfileImage = document.getElementById('dropdownProfileImage');
    
    if (isAuthenticated && userId) {
        // Obtener nombre de usuario
        const userName = localStorage.getItem('user_name') || 'Usuario';
        
        // Obtener imagen específica del usuario
        const userImageKey = getUserImageKey(userId);
        let profileImageUrl = localStorage.getItem(userImageKey) || '/Img/default-avatar.png';
        
        // Asegurar que la URL de la imagen sea absoluta
        if (profileImageUrl && !profileImageUrl.startsWith('http') && !profileImageUrl.startsWith('/')) {
            profileImageUrl = '/' + profileImageUrl;
        }
        
        // Agregar timestamp para evitar cache de imágenes
        const timestampedUrl = profileImageUrl + '?v=' + Date.now();
        
        // Actualizar elementos
        if (dropdownUserName) dropdownUserName.textContent = userName;
        if (profileImage) {
            profileImage.src = timestampedUrl;
            profileImage.onerror = function() {
                this.src = '/Img/default-avatar.png';
            };
        }
        if (dropdownProfileImage) {
            dropdownProfileImage.src = timestampedUrl;
            dropdownProfileImage.onerror = function() {
                this.src = '/Img/default-avatar.png';
            };
        }
        
        // Mostrar elementos de usuario autenticado
        if (unifiedButton) unifiedButton.style.display = 'none';
        if (profileIcon) profileIcon.style.display = 'block';
        if (userHeader) userHeader.style.display = 'flex';
        if (guestOptions) guestOptions.style.display = 'none';
        if (userOptions) userOptions.style.display = 'block';
    } else {
        // Limpiar sesión si el token no es válido
        if (token) {
            clearUserSession();
        }
        
        // Mostrar elementos de invitado
        if (unifiedButton) unifiedButton.style.display = 'block';
        if (profileIcon) profileIcon.style.display = 'none';
        if (userHeader) userHeader.style.display = 'none';
        if (guestOptions) guestOptions.style.display = 'block';
        if (userOptions) userOptions.style.display = 'none';
    }
}

// Función para verificar si un token JWT ha expirado
function isTokenExpired(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

        const decoded = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000;
        
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

// Función global mejorada para cerrar sesión
window.logout = function() {
    // Limpiar completamente la sesión
    clearUserSession();
    
    // Actualizar interfaz
    updateAuthUI();
    
    // Mostrar mensaje de confirmación
    console.log('Sesión cerrada correctamente');
    
    // Redirigir después de un pequeño delay para asegurar que se ejecute la limpieza
    setTimeout(() => {
        window.location.href = '/iniciar.php';
    }, 100);
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

// Función global para actualizar foto de perfil desde otras partes de la aplicación
window.updateProfileImage = function(newImageUrl) {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        const userImageKey = getUserImageKey(userId);
        localStorage.setItem(userImageKey, newImageUrl);
    }
    updateAuthUI();
};

// Sincronización mejorada entre pestañas
window.addEventListener('storage', (event) => {
    if (event.key === 'user_name' || event.key === 'profile_image' || event.key === 'jwt_token') {
        updateAuthUI();
    }
    
    // Si se elimina el token en otra pestaña, actualizar esta también
    if (event.key === 'jwt_token' && !event.newValue) {
        clearUserSession();
        updateAuthUI();
    }
});