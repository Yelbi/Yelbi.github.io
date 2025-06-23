<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/Img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/styles/iniciar.css">
    <link rel="stylesheet" href="/styles/header.css">
    <title>Sistema de Usuarios - Producción</title>
</head>
<body>
<!-- Header -->
    <header class="header">
        <a href="/index.php" class="logo">
            <img src="/Img/logo.png" alt="Logo de Seres">
        </a>
        <nav class="nav-menu" id="navMenu">
            <a href="/index.php" class="nav-link">Inicio</a>
            <a href="/galeria.php" class="nav-link">Galería</a>
            <a href="#" class="nav-link">Contacto</a>
        </nav>
        <div class="menu-toggle" id="menuToggle">
            <i class="fi fi-rr-menu-burger"></i>
        </div>
        <a href="/iniciar.php" class="user-btn"><i class="fi fi-rr-user"></i></a>
    </header>

    <div class="container">
        <!-- Formulario de Registro -->
        <div id="registerForm" class="form-container active">
            <h2>Crear Cuenta</h2>
            <div id="registerAlert"></div>
            <form id="registerFormElement">
                <div class="form-group">
                    <label for="registerName">Nombre Completo *</label>
                    <input type="text" id="registerName" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Correo Electrónico *</label>
                    <input type="email" id="registerEmail" required>
                </div>
                <div class="form-group">
                    <label for="registerPhone">Teléfono (opcional)</label>
                    <input type="tel" id="registerPhone">
                </div>
                <div class="form-group">
                    <label for="registerPassword">Contraseña *</label>
                    <input type="password" id="registerPassword" required>
                    <div id="passwordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="registerConfirmPassword">Confirmar Contraseña *</label>
                    <input type="password" id="registerConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="registerBtn">
                    <span class="btn-text">Crear Cuenta</span>
                </button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()">¿Ya tienes cuenta? Inicia sesión</a>
        </div>

        <!-- Formulario de Inicio de Sesión -->
        <div id="loginForm" class="form-container">
            <h2>Iniciar Sesión</h2>
            <div id="loginAlert"></div>
            <form id="loginFormElement">
                <div class="form-group">
                    <label for="loginEmail">Correo Electrónico</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Contraseña</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="btn" id="loginBtn">
                    <span class="btn-text">Iniciar Sesión</span>
                </button>
            </form>
            <div style="text-align: center; margin: 15px 0;">
                <a href="#" class="link-btn" onclick="showForgotPassword()" style="font-size: 14px;">¿Olvidaste tu contraseña?</a>
            </div>
            <a href="#" class="link-btn" onclick="showRegister()">¿No tienes cuenta? Regístrate</a>
        </div>

        <!-- Formulario de Recuperar Contraseña -->
        <div id="forgotPasswordForm" class="form-container">
            <h2>Recuperar Contraseña</h2>
            <div id="forgotAlert"></div>
            <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
            <form id="forgotPasswordFormElement">
                <div class="form-group">
                    <label for="forgotEmail">Correo Electrónico</label>
                    <input type="email" id="forgotEmail" required>
                </div>
                <button type="submit" class="btn" id="forgotBtn">
                    <span class="btn-text">Enviar Instrucciones</span>
                </button>
            </form>
            <a href="#" class="link-btn" onclick="showLogin()">Volver al login</a>
        </div>

        <!-- Panel de Perfil -->
        <div id="profilePanel" class="form-container">
            <h2>Mi Perfil</h2>
            <div id="profileAlert"></div>
            <div class="user-info">
                <p><strong>Nombre:</strong> <span id="profileName"></span></p>
                <p><strong>Email:</strong> <span id="profileEmail"></span></p>
                <button class="btn" onclick="logout()">Cerrar Sesión</button>
            </div>
        </div>
    </div>

    <script>
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

        // Registro
        async function register(name, email, password, confirmPassword, phone = '') {
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
                    password: password,
                    phone: phone.trim()
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
            const phone = document.getElementById('registerPhone').value;
            
            await register(name, email, password, confirmPassword, phone);
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

        // Verificación de contraseña en tiempo real
        document.getElementById('registerPassword').addEventListener('input', function() {
            const strengthDiv = document.getElementById('passwordStrength');
            showPasswordRequirements(strengthDiv, this.value);
        });
    </script>
</body>
</html>