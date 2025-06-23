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
        <a href="#" class="user-btn"><i class="fi fi-rr-user"></i></a>
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

        <!-- Panel de Perfil (corregido: debe estar dentro del contenedor) -->
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
        const API_BASE_URL = '/api/auth.php'; // Ajusta según tu estructura
        
        // Funciones de navegación
        function showForm(formId) {
            document.querySelectorAll('.form-container').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(formId).classList.add('active');
            clearAlerts();
        }

        function showRegister() { showForm('registerForm'); }
        function showLogin() { showForm('loginForm'); }
        function showForgotPassword() { showForm('forgotPasswordForm'); }
        function showProfile() { showForm('profilePanel'); }

        // Limpiar alertas
        function clearAlerts() {
            ['registerAlert', 'loginAlert', 'forgotAlert', 'profileAlert'].forEach(id => {
                document.getElementById(id).innerHTML = '';
            });
        }

        // Mostrar alerta
        function showAlert(containerId, message, type = 'error') {
            const container = document.getElementById(containerId);
            container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => container.innerHTML = '', 8000);
        }

        // Mostrar loading en botón
        function setButtonLoading(buttonId, loading = true) {
            const button = document.getElementById(buttonId);
            const textSpan = button.querySelector('.btn-text');
            
            if (loading) {
                button.disabled = true;
                textSpan.innerHTML = '<span class="loading-spinner"></span> Procesando...';
            } else {
                button.disabled = false;
                // Restaurar texto original basado en el botón
                const originalTexts = {
                    'registerBtn': 'Crear Cuenta',
                    'loginBtn': 'Iniciar Sesión',
                    'forgotBtn': 'Enviar Instrucciones'
                };
                textSpan.textContent = originalTexts[buttonId] || 'Procesar';
            }
        }

        // Verificar fortaleza de contraseña
        function checkPasswordStrength(password, targetId) {
            const strengthDiv = document.getElementById(targetId);
            if (!strengthDiv) return;

            let strength = 0;
            let feedback = [];

            if (password.length >= 8) strength++;
            else feedback.push('mínimo 8 caracteres');

            if (/[A-Z]/.test(password)) strength++;
            else feedback.push('una mayúscula');

            if (/[a-z]/.test(password)) strength++;
            else feedback.push('una minúscula');

            if (/[0-9]/.test(password)) strength++;
            else feedback.push('un número');

            if (/[^A-Za-z0-9]/.test(password)) {
                strength++;
            } else {
                feedback.push('un carácter especial');
            }

            if (strength < 3) {
                strengthDiv.textContent = `Débil - Falta: ${feedback.join(', ')}`;
                strengthDiv.className = 'password-strength strength-weak';
            } else if (strength < 4) {
                strengthDiv.textContent = 'Media - Agregar más caracteres especiales';
                strengthDiv.className = 'password-strength strength-medium';
            } else {
                strengthDiv.textContent = '¡Fuerte!';
                strengthDiv.className = 'password-strength strength-strong';
            }
        }

        // Realizar petición API
        async function apiRequest(action, data = {}, method = 'POST') {
            try {
                // 1. Crear headers primero
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                // 2. Añadir token si está disponible
                const token = localStorage.getItem('jwt_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // 3. Configurar opciones
                const options = {
                    method: method,
                    headers: headers
                };

                // Solo agregar body para métodos que lo requieran
                if (method === 'POST' || method === 'PUT') {
                    options.body = JSON.stringify(data);
                }

                const url = `${API_BASE_URL}?action=${action}`;
                const response = await fetch(url, options);
                
                // 4. Manejar errores HTTP
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
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

            if (password.length < 8) {
                showAlert('registerAlert', 'La contraseña debe tener al menos 8 caracteres.');
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
                    showAlert('loginAlert', 'Cuenta creada. Revisa tu email para verificar tu cuenta antes de iniciar sesión.', 'info');
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

        // Verificación de fortaleza de contraseña en tiempo real
        document.getElementById('registerPassword').addEventListener('input', function() {
            checkPasswordStrength(this.value, 'passwordStrength');
        });
    </script>
</body>
</html>