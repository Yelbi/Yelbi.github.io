// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadProfileImage();
    setupProfileImagePreview();
});

async function loadProfile() {
    try {
        // Verificar primero si tenemos un token válido
        const token = localStorage.getItem('jwt_token');
        if (!token || isTokenExpired(token)) {
            clearUserSession();
            window.location.href = '/iniciar.php';
            return;
        }

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
        
        // Manejar específicamente errores 401 y 403
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Sesión expirada')) {
            clearUserSession();
            window.location.href = '/iniciar.php';
        } else {
            showAlert('profileAlert', 'Error cargando perfil: ' + error.message, 'error');
        }
    }
}

// Función para limpiar completamente la sesión
function clearUserSession() {
    // Limpiar localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('profile_image');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    
    // Limpiar sessionStorage también
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('profile_image');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_email');
}

function logout() {
    clearUserSession();
    window.location.href = '/iniciar.php';
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
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// API Request mejorado
async function apiRequest(action, data = {}, method = 'POST') {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = localStorage.getItem('jwt_token');
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
            // Si es error de autenticación, limpiar y redirigir
            clearUserSession();
            window.location.href = '/iniciar.php';
            throw new Error('Sesión expirada. Redirigiendo...');
        }
        
        const textResponse = await response.text();
        
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
        throw new Error(error.message || 'Error en la conexión');
    }
}

// Función mejorada para configurar la previsualización de imagen
function setupProfileImagePreview() {
    const fileInput = document.getElementById('newProfileImage');
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
            actualFileInfo.textContent = '';
            previewImage.style.display = 'none';
            return;
        }

        // Validar tipo y tamaño
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            actualFileInfo.textContent = 'Formato no válido. Use JPG, PNG, GIF o WEBP.';
            actualFileInfo.style.color = '#f44336';
            this.value = '';
            previewImage.style.display = 'none';
            return;
        }

        if (file.size > maxSize) {
            actualFileInfo.textContent = 'El archivo es demasiado grande (máximo 2MB).';
            actualFileInfo.style.color = '#f44336';
            this.value = '';
            previewImage.style.display = 'none';
            return;
        }

        actualFileInfo.textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
        actualFileInfo.style.color = 'rgba(255, 255, 255, 0.7)';
        
        // Mostrar previsualización
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        }
        reader.readAsDataURL(file);
    });
}

// Event listener mejorado para el formulario de foto de perfil
document.getElementById('profilePictureForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('newProfileImage');
    const file = fileInput.files[0];
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    if (!file) {
        showAlert('profileAlert', 'Por favor selecciona una imagen', 'error');
        return;
    }
    
    // Mostrar estado de carga
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loading-spinner small"></div> Subiendo...';
    
    try {
        const formData = new FormData();
        formData.append('profileImage', file);
        
        const response = await fetch(`${API_BASE_URL}?action=update-profile-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: formData
        });
        
        // Verificar si la sesión ha expirado
        if (response.status === 401 || response.status === 403) {
            clearUserSession();
            window.location.href = '/iniciar.php';
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
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

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
    } else if (typeof updateAuthUI === 'function') {
        updateAuthUI();
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
        
        // Si es error de autenticación, limpiar sesión
        if (error.message.includes('401') || error.message.includes('403')) {
            clearUserSession();
            window.location.href = '/iniciar.php';
        }
    }
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
    } else if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
}

// Event Listener para formulario de quejas
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('complaintSubject').value;
    const description = document.getElementById('complaintDescription').value;
    await submitComplaint(subject, description);
});