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
            const result = await apiRequest('get-complaints', {}, 'GET');
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            
            result.complaints.forEach(complaint => {
                container.innerHTML += `
                    <div class="message-item">
                        <h4>${complaint.subject}</h4>
                        <p><strong>De:</strong> ${complaint.user_email}</p>
                        <p>${complaint.description}</p>
                        <small>${new Date(complaint.created_at).toLocaleString()}</small>
                        <hr>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Error loading messages:', error);
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