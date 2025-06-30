// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
});

async function loadProfile() {
    try {
        const result = await apiRequest('profile', {}, 'GET');
        if (result.user) {
            document.getElementById('profileName').textContent = result.user.name;
            document.getElementById('profileEmail').textContent = result.user.email;
        } else {
            throw new Error('No se pudo cargar el perfil');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        
        // Manejar específicamente errores 401 y 403
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/iniciar.php';
        } else {
            showAlert('profileAlert', 'Error cargando perfil: ' + error.message, 'error');
        }
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
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

// API Request
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

// Llamar a esta función en DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadProfileImage(); // Nueva función
});

// Función para cargar la imagen de perfil
async function loadProfileImage() {
    try {
        const result = await apiRequest('get-profile-image', {}, 'GET');
        if (result.profileImage) {
            document.getElementById('currentProfileImage').src = result.profileImage;
            localStorage.setItem('profile_image', result.profileImage);
            updateAuthUI(); // Actualizar UI en header
        }
    } catch (error) {
        console.error('Error cargando imagen de perfil:', error);
    }
}

// Configurar previsualización de imagen
function setupProfileImagePreview() {
    const fileInput = document.getElementById('newProfileImage');
    const fileInfo = document.getElementById('fileInfo');
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    const previewImage = document.createElement('img');
    previewImage.className = 'preview-image';
    previewImage.id = 'imagePreview';
    previewContainer.appendChild(previewImage);
    fileInput.parentNode.insertBefore(previewContainer, fileInput.nextSibling);

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        // Validar tipo y tamaño
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            fileInfo.textContent = 'Formato no válido. Use JPG, PNG o GIF.';
            this.value = '';
            previewImage.style.display = 'none';
            return;
        }

        if (file.size > maxSize) {
            fileInfo.textContent = 'El archivo es demasiado grande (máx. 2MB).';
            this.value = '';
            previewImage.style.display = 'none';
            return;
        }

        fileInfo.textContent = `Archivo: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
        
        // Mostrar previsualización
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        }
        reader.readAsDataURL(file);
    });
}

// Event listener para el formulario de foto
document.getElementById('profilePictureForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('newProfileImage');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('profileAlert', 'Por favor selecciona una imagen', 'error');
        return;
    }
    
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
        
        const result = await response.json();
        
        if (response.ok) {
            // Actualizar imagen localmente
            document.getElementById('currentProfileImage').src = result.profileImage;
            localStorage.setItem('profile_image', result.profileImage);
            updateAuthUI();
            showAlert('profileAlert', 'Foto de perfil actualizada correctamente', 'success');
        } else {
            throw new Error(result.error || 'Error al actualizar la foto');
        }
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
    }
});

// Event Listener
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('complaintSubject').value;
    const description = document.getElementById('complaintDescription').value;
    await submitComplaint(subject, description);
});