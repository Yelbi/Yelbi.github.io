// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

// Funciones para cambiar entre formularios
function showForm(formId) {
    // Ocultar todos los formularios
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    // Mostrar el formulario deseado
    const activeForm = document.getElementById(formId);
    if (activeForm) {
        activeForm.classList.add('active');
    }
}

function showLogin() {
    showForm('loginForm');
}

function showRegister() {
    showForm('registerForm');
}

function showProfile() {
    showForm('profilePanel');
}

// NUEVAS FUNCIONES PARA RECUPERACIÓN DE CONTRASEÑAS
function showForgotPassword() {
    showForm('forgotPasswordForm');
}

function showResetPassword() {
    showForm('resetPasswordForm');
}

function backToLogin() {
    showLogin();
}

// Función para mostrar alertas
function showAlert(elementId, message, type = 'error') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    // Limpiar alerta después de 5 segundos (excepto para info)
    if (type !== 'info') {
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

// Función para mostrar spinner de carga en botones
function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading-spinner"></span>';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Función para validar contraseña
function validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    return {
        valid: password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber,
        requirements: {
            length: password.length >= 8,
            upper: hasUpperCase,
            lower: hasLowerCase,
            number: hasNumber,
            special: hasSpecialChar
        }
    };
}

// Mostrar requisitos de contraseña
function showPasswordRequirements(strengthDiv, password) {
    if (!strengthDiv) return;
    const validation = validatePassword(password);
    let html = '<div class="password-requirements">';
    
    html += `<div class="requirement ${validation.requirements.length ? 'valid' : 'invalid'}">Mínimo 8 caracteres</div>`;
    html += `<div class="requirement ${validation.requirements.upper ? 'valid' : 'invalid'}">Al menos una mayúscula (A-Z)</div>`;
    html += `<div class="requirement ${validation.requirements.lower ? 'valid' : 'invalid'}">Al menos una minúscula (a-z)</div>`;
    html += `<div class="requirement ${validation.requirements.number ? 'valid' : 'invalid'}">Al menos un número (0-9)</div>`;
    html += '</div>';
    
    strengthDiv.innerHTML = html;
}

// NUEVA FUNCIÓN: Solicitar recuperación de contraseña
async function requestPasswordReset(email) {
    if (!email) {
        showAlert('forgotPasswordAlert', 'Por favor, ingresa tu correo electrónico.');
        return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('forgotPasswordAlert', 'Por favor, ingresa un correo electrónico válido.');
        return false;
    }

    setButtonLoading('forgotPasswordBtn', true);

    try {
        const result = await apiRequest('request-password-reset', {
            email: email.toLowerCase().trim()
        });

        showAlert('forgotPasswordAlert', result.message, 'success');
        
        // Limpiar formulario y mostrar mensaje
        document.getElementById('forgotPasswordFormElement').reset();
        
        setTimeout(() => {
            showAlert('loginAlert', 
                'Si el correo existe, recibirás un enlace de recuperación en breve.', 
                'info'
            );
            showLogin();
        }, 3000);

        return true;
    } catch (error) {
        showAlert('forgotPasswordAlert', error.message);
        return false;
    } finally {
        setButtonLoading('forgotPasswordBtn', false);
    }
}

// NUEVA FUNCIÓN: Resetear contraseña con token
async function resetPassword(token, newPassword, confirmPassword) {
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
        showAlert('resetPasswordAlert', 'Las contraseñas no coinciden.');
        return false;
    }

    // Validación de contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        showAlert('resetPasswordAlert', 
            'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        );
        return false;
    }

    setButtonLoading('resetPasswordBtn', true);

    try {
        const result = await apiRequest('reset-password', {
            token: token.trim(),
            new_password: newPassword
        });

        showAlert('resetPasswordAlert', result.message, 'success');
        
        // Limpiar formulario
        document.getElementById('resetPasswordFormElement').reset();
        const strengthEl = document.getElementById('resetPasswordStrength');
        if (strengthEl) strengthEl.innerHTML = '';

        setTimeout(() => {
            showAlert('loginAlert', 
                'Contraseña cambiada exitosamente. Puedes iniciar sesión ahora.', 
                'success'
            );
            showLogin();
        }, 3000);

        return true;
    } catch (error) {
        showAlert('resetPasswordAlert', error.message);
        return false;
    } finally {
        setButtonLoading('resetPasswordBtn', false);
    }
}

// Registro
async function register(name, email, password, confirmPassword) {
    if (!name || !email || !password || !confirmPassword) {
        showAlert('registerAlert', 'Por favor, completa todos los campos obligatorios.');
        return false;
    }

    if (password !== confirmPassword) {
        showAlert('registerAlert', 'Las contraseñas no coinciden.');
        return false;
    }

    // Validación mejorada de contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showAlert('registerAlert', 
            'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
        );
        return false;
    }

    setButtonLoading('registerBtn', true);

    try {
        const result = await apiRequest('register', {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        showAlert('registerAlert', result.message, 'success');
        
        // Limpiar formulario
        document.getElementById('registerFormElement').reset();
        const strengthEl = document.getElementById('passwordStrength');
        if (strengthEl) strengthEl.textContent = '';

        setTimeout(() => {
            if (result.verification_token) {
                showAlert('loginAlert', 
                    `Cuenta creada. Para desarrollo, usa este token: ${result.verification_token}`, 
                    'info'
                );
            } else {
                showAlert('loginAlert', 
                    'Cuenta creada. Revisa tu email para verificar tu cuenta.', 
                    'info'
                );
            }
            showLogin();
        }, 3000);

        return true;
    } catch (error) {
        showAlert('registerAlert', error.message);
        return false;
    } finally {
        setButtonLoading('registerBtn', false);
    }
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

// Login
async function login(email, password) {
    if (!email || !password) {
        showAlert('loginAlert', 'Por favor, completa todos los campos.');
        return false;
    }

    setButtonLoading('loginBtn', true);

    try {
        const result = await apiRequest('login', {
            email: email.toLowerCase().trim(),
            password: password
        });

        if (!result.token) {
            throw new Error('No se recibió token de autenticación');
        }

        localStorage.setItem('jwt_token', result.token);
        showAlert('loginAlert', '¡Inicio de sesión exitoso!', 'success');
        
        await loadProfile();
        
        return true;
    } catch (error) {
        showAlert('loginAlert', error.message || 'Error en el inicio de sesión');
        return false;
    } finally {
        setButtonLoading('loginBtn', false);
    }
}

// Cargar perfil
async function loadProfile() {
    try {
        const result = await apiRequest('profile', {}, 'GET');
        if (result.user) {
            document.getElementById('profileName').textContent = result.user.name;
            document.getElementById('profileEmail').textContent = result.user.email;
            
            if (result.user.role === 'admin') {
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('userSection').style.display = 'none';
                await loadAdminMessages();
            } else {
                document.getElementById('adminSection').style.display = 'none';
                document.getElementById('userSection').style.display = 'block';
            }
            
            showProfile();
        } else {
            throw new Error('No se pudo cargar el perfil');
        }
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
        showLogin();
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('jwt_token');
    showLogin();
    showAlert('loginAlert', 'Sesión cerrada correctamente', 'success');
}

// Enviar queja/sugerencia
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

// Cargar mensajes para admin
async function loadAdminMessages() {
    try {
        const container = document.getElementById('messagesContainer');
        
        container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><span>Cargando mensajes...</span></div>';
        
        const result = await apiRequest('get-complaints', {}, 'GET');
        
        const totalMessages = result.complaints ? result.complaints.length : 0;
        
        if (totalMessages === 0) {
            container.innerHTML = `
                <div class="empty-mailbox">
                    <div class="empty-icon">📫</div>
                    <h3>No hay mensajes</h3>
                    <p>Cuando los usuarios envíen mensajes, aparecerán aquí.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        result.complaints.forEach(complaint => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.dataset.id = complaint.id;
            
            const formattedDate = new Date(complaint.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageElement.innerHTML = `
    <div class="message-header">
        <div class="sender-info" onclick="toggleMessageDetail(${complaint.id})">
            <div class="sender-avatar">${complaint.user_email.charAt(0).toUpperCase()}</div>
            <div class="sender-details">
                <div class="sender-name">${complaint.user_email}</div>
                <div class="message-subject">${complaint.subject}</div>
            </div>
        </div>
        <div class="message-meta">
            <span class="message-date">${formattedDate}</span>
            <button class="btn-delete" onclick="deleteMessage(event, ${complaint.id})" title="Eliminar mensaje">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    </div>
    <div class="message-body" id="messageBody-${complaint.id}" style="display:none;">
        <div class="message-content">
            <p>${complaint.description}</p>
        </div>
        <div class="message-footer">
            <small>📅 Enviado el: ${new Date(complaint.created_at).toLocaleString('es-ES')}</small>
        </div>
    </div>
`;
            container.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        const container = document.getElementById('messagesContainer');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Error al cargar mensajes</h3>
                <p>${error.message}</p>
                <button class="btn-retry" onclick="loadAdminMessages()">Reintentar</button>
            </div>
        `;
        showAlert('profileAlert', 'Error cargando mensajes', 'error');
    }
}

// Alternar vista detallada del mensaje
function toggleMessageDetail(messageId) {
    const messageBody = document.getElementById(`messageBody-${messageId}`);
    const messageItem = document.querySelector(`[data-id="${messageId}"]`);
    
    if (messageBody && messageItem) {
        const isVisible = messageBody.style.display === 'block';
        
        if (isVisible) {
            messageBody.style.display = 'none';
            messageItem.classList.remove('expanded');
        } else {
            messageBody.style.display = 'block';
            messageItem.classList.add('expanded');
        }
    }
}

// Eliminar mensaje
async function deleteMessage(event, messageId) {
    event.stopPropagation();
    
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
        return;
    }
    
    const messageElement = document.querySelector(`[data-id="${messageId}"]`);
    if (!messageElement) {
        console.error('Elemento de mensaje no encontrado');
        return;
    }
    
    const deleteBtn = event.target.closest('.btn-delete');
    const originalHTML = deleteBtn.innerHTML;
    
    try {
        deleteBtn.innerHTML = '<div class="loading-spinner small"></div>';
        deleteBtn.disabled = true;
        
        messageElement.style.opacity = '0.5';
        messageElement.style.pointerEvents = 'none';
        
        await apiRequest('delete-complaint', { 
            id: messageId  
        }, 'POST'); 
        
        messageElement.style.transition = 'all 0.4s ease';
        messageElement.style.transform = 'translateX(-100%)';
        messageElement.style.opacity = '0';
        messageElement.style.maxHeight = '0';
        messageElement.style.marginBottom = '0';
        messageElement.style.padding = '0';
        
        setTimeout(() => {
            messageElement.remove();
            
            const remainingMessages = document.querySelectorAll('.message-item');
            if (remainingMessages.length === 0) {
                const container = document.getElementById('messagesContainer');
                container.innerHTML = `
                    <div class="empty-mailbox">
                        <div class="empty-icon">📫</div>
                        <h3>No hay mensajes</h3>
                        <p>Todos los mensajes han sido eliminados.</p>
                    </div>
                `;
            }
        }, 400);
        
        showAlert('profileAlert', 'Mensaje eliminado correctamente', 'success');
        setTimeout(() => {
            document.getElementById('profileAlert').innerHTML = '';
        }, 3000);
        
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        
        messageElement.style.opacity = '1';
        messageElement.style.pointerEvents = 'auto';
        deleteBtn.innerHTML = originalHTML;
        deleteBtn.disabled = false;
        
        showAlert('profileAlert', error.message || 'Error al eliminar el mensaje', 'error');
    }
}

// Hacer las funciones globales para que funcionen desde el HTML
window.toggleMessageDetail = toggleMessageDetail;
window.deleteMessage = deleteMessage;
window.loadAdminMessages = loadAdminMessages;
window.showForgotPassword = showForgotPassword;
window.showResetPassword = showResetPassword;
window.backToLogin = backToLogin;

// Al cargar la página, verificar si hay token
document.addEventListener('DOMContentLoaded', () => {
    const jwtToken = localStorage.getItem('jwt_token');
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (resetToken) {
        const tokenInput = document.getElementById('resetToken');
        tokenInput.value = resetToken;
        tokenInput.readOnly = true;  // Hacer el campo de solo lectura
        tokenInput.style.backgroundColor = '#f8f9fa';  // Estilo visual para indicar que no es editable
        showResetPassword();
    } else if (jwtToken) {
        loadProfile();
    } else {
        showLogin();
    }
});

// Event Listeners
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    await register(name, email, password, confirmPassword);
});

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    await login(email, password);
});

// NUEVOS EVENT LISTENERS PARA RECUPERACIÓN DE CONTRASEÑAS
document.getElementById('forgotPasswordFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    requestPasswordReset(email); // Usar la función existente
});

document.getElementById('resetPasswordFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('resetNewPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value; // Capturar valor real
    
    resetPassword(token, newPassword, confirmPassword);
});

// Evento para enviar queja/sugerencia
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('complaintSubject').value;
    const description = document.getElementById('complaintDescription').value;
    await submitComplaint(subject, description);
});

// Verificación de contraseña en tiempo real
document.getElementById('registerPassword')?.addEventListener('input', function() {
    const strengthDiv = document.getElementById('passwordStrength');
    if (strengthDiv) {
        showPasswordRequirements(strengthDiv, this.value);
    }
});

// NUEVO: Verificación de contraseña en tiempo real para reset
document.getElementById('resetNewPassword')?.addEventListener('input', function() {
    const strengthDiv = document.getElementById('resetPasswordStrength');
    if (strengthDiv) {
        showPasswordRequirements(strengthDiv, this.value);
    }
});

// Función para mostrar formulario reset
function showResetPassword() {
    document.querySelectorAll('.form-container').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById('resetPasswordForm').classList.add('active');
}