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

    // Verificar token al cargar la página
    checkTokenValidity();
});

// Función mejorada para validar token - SIN REDIRIGIR AUTOMÁTICAMENTE
async function checkTokenValidity() {
    const token = getStoredToken();
    
    // Si no hay token, simplemente actualizar UI como invitado
    if (!token) {
        updateAuthUI(false);
        return;
    }

    // Verificar si el token ha expirado localmente primero
    if (isTokenExpired(token)) {
        console.log('Token expirado localmente');
        clearUserSession();
        updateAuthUI(false);
        return;
    }

    try {
        // Verificar token en el servidor - MEJORADO
        const response = await fetch('https://seres.blog/api/auth.php?action=verify-session', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.valid) {
                // Token válido, actualizar UI como autenticado
                updateAuthUI(true);
                return;
            }
        }
        
        // Si llegamos aquí, el token no es válido
        throw new Error('Token no válido');

    } catch (error) {
        console.log('Error validando token:', error.message);
        clearUserSession();
        updateAuthUI(false);
    }
}

// Función para obtener token almacenado (prioriza localStorage)
function getStoredToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
}

// Función mejorada para limpiar sesión - MENOS AGRESIVA
function clearUserSession() {
    // Solo limpiar datos de autenticación, mantener imágenes de perfil
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('user_role');
}

// Función helper para obtener clave de imagen del usuario
function getUserImageKey(userId) {
    return `profile_image_${userId}`;
}

// Función MEJORADA para actualizar la UI - Aceptar parámetro de estado
function updateAuthUI(isAuthenticated = null) {
    const token = getStoredToken();
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    
    // Si no se proporciona estado, calcularlo
    if (isAuthenticated === null) {
        isAuthenticated = token && token.trim() !== '' && !isTokenExpired(token) && userId;
    }
    
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
        const userName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'Usuario';
        
        // Obtener imagen específica del usuario
        const userImageKey = getUserImageKey(userId);
        let profileImageUrl = localStorage.getItem(userImageKey) || '/Img/default-avatar.png';
        
        // Asegurar que la URL de la imagen sea correcta
        if (profileImageUrl && !profileImageUrl.startsWith('http') && !profileImageUrl.startsWith('/')) {
            profileImageUrl = '/' + profileImageUrl;
        }
        
        // Agregar timestamp para evitar cache de imágenes
        const timestampedUrl = profileImageUrl.includes('?') 
            ? profileImageUrl + '&v=' + Date.now()
            : profileImageUrl + '?v=' + Date.now();
        
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
        // Mostrar elementos de invitado
        if (unifiedButton) unifiedButton.style.display = 'block';
        if (profileIcon) profileIcon.style.display = 'none';
        if (userHeader) userHeader.style.display = 'none';
        if (guestOptions) guestOptions.style.display = 'block';
        if (userOptions) userOptions.style.display = 'none';
    }
}

// Función MEJORADA para verificar si un token JWT ha expirado
function isTokenExpired(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

        const decoded = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000;
        
        // Usar margen de 60 segundos en lugar de 5 minutos
        return decoded.exp < (currentTime + 60);
    } catch (error) {
        console.error('Error decodificando token:', error);
        return true;
    }
}

// Función global mejorada para cerrar sesión
window.logout = function() {
    // Limpiar sesión
    clearUserSession();
    
    // Actualizar interfaz
    updateAuthUI(false);
    
    // Mostrar mensaje de confirmación
    console.log('Sesión cerrada correctamente');
    
    // Redirigir después de un pequeño delay
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
    const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    if (userId) {
        const userImageKey = getUserImageKey(userId);
        localStorage.setItem(userImageKey, newImageUrl);
    }
    updateAuthUI(true); // Forzar como autenticado
};

// Sincronización mejorada entre pestañas
window.addEventListener('storage', (event) => {
    if (event.key === 'user_name' || event.key === 'jwt_token' || event.key?.startsWith('profile_image_')) {
        // Revalidar estado de autenticación
        checkTokenValidity();
    }
    
    // Si se elimina el token en otra pestaña, actualizar esta también
    if (event.key === 'jwt_token' && !event.newValue) {
        clearUserSession();
        updateAuthUI(false);
    }
});

// Función MEJORADA para establecer datos de usuario después del login
window.setUserData = function(userData, token) {
    // Guardar en localStorage por defecto
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('user_email', userData.email);
    
    if (userData.role) {
        localStorage.setItem('user_role', userData.role);
    }
    
    // Actualizar UI inmediatamente como autenticado
    updateAuthUI(true);
};