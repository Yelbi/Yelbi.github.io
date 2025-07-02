// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

document.addEventListener('DOMContentLoaded', async () => {
    if (await verifyAuthentication()) {
        await loadProfile();
        await loadProfileImage();
        await loadFavorites(); // Cargar favoritos después de autenticar
        setupProfileImagePreview();
    } else {
        // Mostrar mensaje si no está autenticado
        const favoritesContainer = document.getElementById('favoritesList');
        if (favoritesContainer) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <div>
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <p>Debes iniciar sesión para ver tus favoritos</p>
                </div>
            `;
        }
    }
});

// Nueva función para verificar autenticación de manera más robusta
async function verifyAuthentication() {
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    
    if (!token) {
        console.log('No token found, redirecting to login');
        redirectToLogin();
        return false;
    }

    if (isTokenExpired(token)) {
        console.log('Token expired, redirecting to login');
        clearUserSession();
        redirectToLogin();
        return false;
    }

    try {
        // Verificar con el servidor
        const response = await fetch(`${API_BASE_URL}?action=verify-session`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.valid) {
                return true; // Autenticación válida
            }
        }
        
        throw new Error('Invalid session');
        
    } catch (error) {
        console.log('Session verification failed:', error.message);
        clearUserSession();
        redirectToLogin();
        return false;
    }
}

// Función mejorada para verificar expiración de token
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
        
        // Usar margen de 60 segundos
        return decoded.exp < (currentTime + 60);
    } catch (error) {
        console.error('Error decodificando token:', error);
        return true;
    }
}

// Función para redirigir al login
function redirectToLogin() {
    setTimeout(() => {
        window.location.href = '/iniciar.php';
    }, 100);
}

async function loadProfile() {
    try {
        const result = await apiRequest('profile', {}, 'GET');
        if (result.user) {
            document.getElementById('profileName').textContent = result.user.name;
            document.getElementById('profileEmail').textContent = result.user.email;
            
            // Guardar datos importantes
            localStorage.setItem('user_name', result.user.name);
            localStorage.setItem('user_email', result.user.email);
            localStorage.setItem('user_id', result.user.id);
            
        } else {
            throw new Error('No se pudo cargar el perfil');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showAlert('profileAlert', 'Error cargando perfil: ' + error.message, 'error');
        
        // Solo redirigir si es un error de autenticación específico
        if (error.message.includes('401') || error.message.includes('403') || 
            error.message.includes('Sesión expirada') || error.message.includes('Token')) {
            clearUserSession();
            redirectToLogin();
        }
    }
}

// Función para limpiar completamente la sesión
function clearUserSession() {
    // Limpiar localStorage - mantener imágenes de perfil
    const keysToRemove = ['jwt_token', 'user_name', 'user_id', 'user_email', 'user_role'];
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    
    // Limpiar favoritos en la UI
    const favoritesContainer = document.getElementById('favoritesList');
    if (favoritesContainer) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <div>
                    <i class="fi fi-rr-heart"></i>
                </div>
                <p>Debes iniciar sesión para ver tus favoritos</p>
            </div>
        `;
    }
}

function logout() {
    clearUserSession();
    redirectToLogin();
}

async function submitComplaint(subject, description) {
    try {
        await apiRequest('submit-complaint', {
            subject: subject,
            description: description
        });
        showAlert('profileAlert', 'Mensaje enviado correctamente', 'success');
        document.getElementById('complaintForm').reset();
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
    }
}

// Función para mostrar alertas
function showAlert(elementId, message, type = 'error') {
    const alertDiv = document.getElementById(elementId);
    if (!alertDiv) return;
    
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// API Request MEJORADO - menos agresivo con redirecciones
async function apiRequest(action, data = {}, method = 'POST') {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method: method,
            headers: headers,
            body: method !== 'GET' ? JSON.stringify(data) : null
        };

        const url = `${API_BASE_URL}?action=${action}`;
        const response = await fetch(url, options);
        
        // Verificar si la respuesta indica que el token ha expirado
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Sesión expirada (${response.status})`);
        }
        
        // Primero obtener la respuesta como texto
        const textResponse = await response.text();
        
        // Si la respuesta está vacía, manejar adecuadamente
        if (!textResponse.trim()) {
            if (response.ok) {
                return { success: true }; // Para casos donde no se espera contenido
            } else {
                throw new Error('Respuesta vacía del servidor');
            }
        }
        
        try {
            const result = JSON.parse(textResponse);
            if (!response.ok) {
                throw new Error(result.error || `Error ${response.status}`);
            }
            return result;
        } catch (e) {
            console.error('Respuesta no JSON:', textResponse);
            throw new Error(`Respuesta inválida: ${textResponse.slice(0, 200)}`);
        }
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Solo limpiar sesión y redirigir en casos específicos
        if (error.message.includes('Sesión expirada') || 
            error.message.includes('401') || 
            error.message.includes('403')) {
            clearUserSession();
            redirectToLogin();
        }
        
        throw new Error(error.message || 'Error en la conexión');
    }
}

// Función mejorada para configurar la previsualización de imagen
function setupProfileImagePreview() {
    const fileInput = document.getElementById('newProfileImage');
    if (!fileInput) return;
    
    const fileInfo = document.getElementById('fileInfo');
    
    // Crear elemento de información de archivo si no existe
    if (!fileInfo) {
        const fileInfoElement = document.createElement('div');
        fileInfoElement.id = 'fileInfo';
        fileInfoElement.className = 'file-info';
        fileInput.parentNode.insertBefore(fileInfoElement, fileInput.nextSibling);
    }
    
    // Crear contenedor de previsualización si no existe
    let previewContainer = document.querySelector('.preview-container');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        const previewImage = document.createElement('img');
        previewImage.className = 'preview-image';
        previewImage.id = 'imagePreview';
        previewContainer.appendChild(previewImage);
        
        const actualFileInfo = document.getElementById('fileInfo');
        actualFileInfo.parentNode.insertBefore(previewContainer, actualFileInfo.nextSibling);
    }
    
    const previewImage = document.getElementById('imagePreview');

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        const actualFileInfo = document.getElementById('fileInfo');
        
        if (!file) {
            if (actualFileInfo) actualFileInfo.textContent = '';
            if (previewImage) previewImage.style.display = 'none';
            return;
        }

        // Validar tipo y tamaño
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            if (actualFileInfo) {
                actualFileInfo.textContent = 'Formato no válido. Use JPG, PNG, GIF o WEBP.';
                actualFileInfo.style.color = '#f44336';
            }
            this.value = '';
            if (previewImage) previewImage.style.display = 'none';
            return;
        }

        if (file.size > maxSize) {
            if (actualFileInfo) {
                actualFileInfo.textContent = 'El archivo es demasiado grande (máximo 2MB).';
                actualFileInfo.style.color = '#f44336';
            }
            this.value = '';
            if (previewImage) previewImage.style.display = 'none';
            return;
        }

        if (actualFileInfo) {
            actualFileInfo.textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
            actualFileInfo.style.color = 'rgba(255, 255, 255, 0.7)';
        }
        
        // Mostrar previsualización
        if (previewImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });
}

// Event listener mejorado para el formulario de foto de perfil
const profilePictureForm = document.getElementById('profilePictureForm');
if (profilePictureForm) {
    profilePictureForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('newProfileImage');
        const file = fileInput?.files[0];
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalButtonText = submitButton?.innerHTML || 'Actualizar';
        
        if (!file) {
            showAlert('profileAlert', 'Por favor selecciona una imagen', 'error');
            return;
        }
        
        // Mostrar estado de carga
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<div class="loading-spinner small"></div> Subiendo...';
        }
        
        try {
            const formData = new FormData();
            formData.append('profileImage', file);
            
            const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
            
            const response = await fetch(`${API_BASE_URL}?action=update-profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            // Verificar si la sesión ha expirado
            if (response.status === 401 || response.status === 403) {
                clearUserSession();
                redirectToLogin();
                return;
            }
            
            const result = await response.json();
            
            if (response.ok && result.profileImage) {
                const userId = localStorage.getItem('user_id');
                if (userId) {
                    // Guardar en localStorage con clave específica
                    const userImageKey = getUserImageKey(userId);
                    localStorage.setItem(userImageKey, result.profileImage);
                }
                
                // Actualizar todos los elementos de imagen
                updateImageElements(result.profileImage);
                
                showAlert('profileAlert', 'Foto de perfil actualizada correctamente', 'success');
                
                // Limpiar formulario y previsualización
                fileInput.value = '';
                const fileInfo = document.getElementById('fileInfo');
                const previewImage = document.getElementById('imagePreview');
                if (fileInfo) fileInfo.textContent = '';
                if (previewImage) previewImage.style.display = 'none';
                
            } else {
                throw new Error(result.error || 'Error al actualizar la foto');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('profileAlert', 'Error al subir la imagen: ' + error.message, 'error');
        } finally {
            // Restaurar botón
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });
}

function getUserImageKey(userId) {
    return `profile_image_${userId}`;
}

// Función auxiliar para actualizar elementos de imagen
function updateImageElements(imageUrl) {
    // Usar timestamp para evitar cache
    const timestampedUrl = imageUrl + '?v=' + Date.now();
    
    // Actualizar imagen actual en la página
    const currentImage = document.getElementById('currentProfileImage');
    if (currentImage) {
        currentImage.src = timestampedUrl;
        currentImage.onerror = function() {
            this.src = '/Img/default-avatar.png';
        };
    }
    
    // Actualizar UI del header usando la función global
    if (typeof window.updateProfileImage === 'function') {
        window.updateProfileImage(imageUrl);
    }
}

// Función mejorada para cargar la imagen de perfil
async function loadProfileImage() {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            throw new Error('ID de usuario no encontrado');
        }
        
        // Obtener clave específica del usuario
        const userImageKey = getUserImageKey(userId);
        
        // Intentar con la imagen en cache (localStorage)
        const cachedImage = localStorage.getItem(userImageKey);
        if (cachedImage) {
            updateImageElements(cachedImage);
            return;
        }

        // Si no hay en cache, cargar desde el servidor
        const result = await apiRequest('get-profile-image', {}, 'GET');
        if (result.profileImage) {
            // Guardar en localStorage con clave específica
            localStorage.setItem(userImageKey, result.profileImage);
            updateImageElements(result.profileImage);
        } else {
            // Usar imagen por defecto si no hay
            updateImageElements('/Img/default-avatar.png');
        }
    } catch (error) {
        console.error('Error cargando imagen de perfil:', error);
        // Usar imagen por defecto si hay error
        updateImageElements('/Img/default-avatar.png');
    }
}

async function loadFavorites() {
    try {
        const token = getUserToken();
        if (!token) {
            throw new Error('No autenticado');
        }
        
        const response = await fetch('/api/favorites.php?action=list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Manejar respuestas vacías
        if (response.status === 204) { // No Content
            renderFavorites([]);
            return;
        }
        
        // Manejar errores HTTP
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        renderFavorites(result.favorites);
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        showAlert('profileAlert', 'Error cargando favoritos: ' + error.message, 'error');
        
        // Mostrar estado vacío si hay error
        const container = document.getElementById('favoritesList');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <p>Error cargando favoritos</p>
                </div>
            `;
        }
    }
}

function getUserToken() {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
}

function renderFavorites(favorites) {
    const container = document.getElementById('favoritesList');
    if (!container) return;
    
    // Si no hay favoritos o no es un array
    if (!Array.isArray(favorites)) {
        container.innerHTML = `
            <div class="empty-state">
                <div>
                    <i class="fi fi-rr-heart"></i>
                </div>
                <p>Error al cargar favoritos</p>
            </div>
        `;
        return;
    }
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>
                    <i class="fi fi-rr-heart"></i>
                </div>
                <p>Aún no tienes elementos favoritos</p>
                <p>Cuando marques contenido como favorito, aparecerá aquí</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favorites.map(fav => `
        <div class="favorite-item" data-ser-id="${fav.id}">
            <img src="${fav.imagen}" alt="${fav.nombre}" onerror="this.src='/Img/default-image.jpg'">
            <div class="favorite-info">
                <h4>${fav.nombre}</h4>
                <p>${fav.tipo} • ${fav.region}</p>
            </div>
            <button class="remove-favorite" aria-label="Quitar de favoritos">
                <i class="fi fi-rr-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Eventos para botones de eliminar
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', async () => {
            const item = btn.closest('.favorite-item');
            const serId = item.dataset.serId;
            
            try {
                await removeFavorite(serId);
                item.remove();
                
                // Actualizar contador si no hay favoritos
                if (container.querySelectorAll('.favorite-item').length === 0) {
                    renderFavorites([]);
                }
            } catch (error) {
                showAlert('profileAlert', 'Error: ' + error.message, 'error');
            }
        });
    });
}

async function removeFavorite(serId) {
    const token = getUserToken();
    if (!token) {
        throw new Error('Debes iniciar sesión para quitar favoritos');
    }
    
    const response = await fetch('/api/favorites.php?action=remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serId })
    });
    
    // Manejar respuestas vacías
    const responseText = await response.text();
    if (!responseText) {
        if (response.ok) {
            return; // Éxito sin contenido
        } else {
            throw new Error('Respuesta vacía del servidor');
        }
    }
    
    if (!response.ok) {
        const result = JSON.parse(responseText);
        throw new Error(result.error || 'Error al quitar favorito');
    }
}

// Event Listener para formulario de quejas
const complaintForm = document.getElementById('complaintForm');
if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = document.getElementById('complaintSubject')?.value;
        const description = document.getElementById('complaintDescription')?.value;
        
        if (subject && description) {
            await submitComplaint(subject, description);
        }
    });
}