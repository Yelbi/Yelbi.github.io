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

// Event Listener
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('complaintSubject').value;
    const description = document.getElementById('complaintDescription').value;
    await submitComplaint(subject, description);
});