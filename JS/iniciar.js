    // Configuración
    const API_BASE_URL = 'https://seres.blog/api/auth.php';
    
    // Funciones para cambiar entre formularios
    function showForm(formId) {
        // Ocultar todos los formularios
        document.querySelectorAll('.form-container').forEach(form => {
            form.classList.remove('active');
        });
        // Mostrar el formulario deseado
        document.getElementById(formId).classList.add('active');
    }
    
    function showLogin() {
        showForm('loginForm');
    }
    
    function showRegister() {
        showForm('registerForm');
    }
    
    function showForgotPassword() {
        showForm('forgotPasswordForm');
    }
    
    function showProfile() {
        showForm('profilePanel');
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
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loading-spinner"></span>';
        } else {
            button.disabled = false;
            button.querySelector('.btn-text') 
                ? button.innerHTML = '<span class="btn-text">' + button.querySelector('.btn-text').textContent + '</span>'
                : button.innerHTML = button.textContent;
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
        const validation = validatePassword(password);
        let html = '<div class="password-requirements">';
        
        html += `<div class="requirement ${validation.requirements.length ? 'valid' : 'invalid'}">Mínimo 8 caracteres</div>`;
        html += `<div class="requirement ${validation.requirements.upper ? 'valid' : 'invalid'}">Al menos una mayúscula (A-Z)</div>`;
        html += `<div class="requirement ${validation.requirements.lower ? 'valid' : 'invalid'}">Al menos una minúscula (a-z)</div>`;
        html += `<div class="requirement ${validation.requirements.number ? 'valid' : 'invalid'}">Al menos un número (0-9)</div>`;
        html += '</div>';
        
        strengthDiv.innerHTML = html;
    }

    // Alternar visibilidad de contraseña
    function togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
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
            document.getElementById('passwordStrength').textContent = '';

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
            
            // Manejar respuestas no JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta inválida: ${text.slice(0, 100)}`);
            }

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `Error ${response.status}`);
            }

            return result;
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

            // Verificar si se recibió token
            if (!result.token) {
                throw new Error('No se recibió token de autenticación');
            }

            // Guardar token en localStorage
            localStorage.setItem('jwt_token', result.token);

            showAlert('loginAlert', '¡Inicio de sesión exitoso!', 'success');
            
            // Cargar y mostrar perfil
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
            
            // Mostrar sección según tipo de usuario usando role
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

    // Recuperar contraseña
    async function forgotPassword(email) {
        if (!email) {
            showAlert('forgotAlert', 'Por favor ingresa tu email.');
            return false;
        }

        setButtonLoading('forgotBtn', true);

        try {
            const result = await apiRequest('forgot-password', {
                email: email.toLowerCase().trim()
            });

            showAlert('forgotAlert', result.message, 'success');
            return true;
        } catch (error) {
            showAlert('forgotAlert', error.message);
            return false;
        } finally {
            setButtonLoading('forgotBtn', false);
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
        const stats = document.getElementById('mailboxStats');
        
        // Mostrar estado de carga
        container.innerHTML = '<div class="empty-mailbox">Cargando mensajes...</div>';
        
        const result = await apiRequest('get-complaints', {}, 'GET');
        
        // Actualizar estadísticas
        stats.innerHTML = `<span>${result.complaints.length} mensajes</span>`;
        
        if (result.complaints.length === 0) {
            container.innerHTML = '<div class="empty-mailbox">No hay mensajes</div>';
            return;
        }
        
        container.innerHTML = '';
        
        result.complaints.forEach(complaint => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.dataset.id = complaint.id;
            messageElement.innerHTML = `
                <div class="message-header">
                    <div class="sender-info" onclick="window.toggleMessageDetail(${complaint.id})">
                        <span class="sender-avatar">${complaint.user_email.charAt(0).toUpperCase()}</span>
                        <div>
                            <div class="sender-name">${complaint.user_email}</div>
                            <div class="message-subject">${complaint.subject}</div>
                        </div>
                    </div>
                    <div class="message-meta">
                        <span class="message-date">${new Date(complaint.created_at).toLocaleDateString()}</span>
                        <button class="btn-delete" onclick="window.deleteMessage(event, ${complaint.id})">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="message-body" id="messageBody-${complaint.id}" style="display:none;">
                    <p>${complaint.description}</p>
                    <div class="message-footer">
                        <small>Enviado el: ${new Date(complaint.created_at).toLocaleString()}</small>
                    </div>
                </div>
            `;
            container.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        showAlert('profileAlert', 'Error cargando mensajes', 'error');
        container.innerHTML = '<div class="empty-mailbox error">Error al cargar mensajes</div>';
    }
}

// Alternar vista detallada del mensaje (corregido)
window.toggleMessageDetail = function(messageId) {
    const messageBody = document.getElementById(`messageBody-${messageId}`);
    if (messageBody) {
        messageBody.style.display = messageBody.style.display === 'none' ? 'block' : 'none';
    }
}

// Eliminar mensaje (versión mejorada)
window.deleteMessage = async function(event, messageId) {
    event.stopPropagation();
    
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) {
        return;
    }
    
    try {
        const deleteBtn = event.target.closest('.btn-delete');
        const originalHTML = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<span class="loading-spinner small"></span>';
        
        // Agregar efecto visual de eliminación
        const messageElement = deleteBtn.closest('[data-id]');
        messageElement.style.opacity = '0.5';
        messageElement.style.pointerEvents = 'none';
        
        await apiRequest('delete-complaint', { id: messageId });
        
        // Eliminar visualmente el mensaje con animación
        messageElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        messageElement.style.transform = 'translateX(-100%)';
        messageElement.style.opacity = '0';
        
        setTimeout(() => {
            messageElement.remove();
            
            // Actualizar contador
            const messages = document.querySelectorAll('.message-item');
            const stats = document.getElementById('mailboxStats');
            stats.innerHTML = `<span>${messages.length} mensajes</span>`;
        }, 300);
    } catch (error) {
        showAlert('profileAlert', error.message || 'Error al eliminar el mensaje', 'error');
        // Restaurar botón si hay error
        if (deleteBtn) deleteBtn.innerHTML = originalHTML;
    }
}

    // Al cargar la página, verificar si hay token
    document.addEventListener('DOMContentLoaded', () => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
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

    document.getElementById('forgotPasswordFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        
        await forgotPassword(email);
    });

    // Evento para enviar queja/sugerencia
    document.getElementById('complaintForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = document.getElementById('complaintSubject').value;
        const description = document.getElementById('complaintDescription').value;
        await submitComplaint(subject, description);
    });

    // Verificación de contraseña en tiempo real
    document.getElementById('registerPassword').addEventListener('input', function() {
        const strengthDiv = document.getElementById('passwordStrength');
        showPasswordRequirements(strengthDiv, this.value);
    });

    document.body.addEventListener('click', function(e) {
    if (e.target.closest('.btn-delete')) {
        const messageId = e.target.closest('.message-item').dataset.id;
        window.deleteMessage(e, messageId);
    }
});