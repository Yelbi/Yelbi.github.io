<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Usuarios - Producción</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 450px;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .form-container {
            display: none;
        }

        .form-container.active {
            display: block;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: 600;
        }

        .form-group {
            margin-bottom: 25px;
            position: relative;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
            font-size: 14px;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"],
        textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
            position: relative;
        }

        .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-1px);
        }

        .link-btn {
            display: block;
            text-align: center;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .link-btn:hover {
            color: #764ba2;
            text-decoration: underline;
        }

        .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            font-weight: 500;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }

        .user-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .user-info h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 20px;
        }

        .user-info p {
            color: #666;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .user-info strong {
            color: #333;
        }

        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .password-strength {
            margin-top: 5px;
            font-size: 12px;
        }

        .strength-weak { color: #dc3545; }
        .strength-medium { color: #ffc107; }
        .strength-strong { color: #28a745; }

        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .email-verification-notice {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        @media (max-width: 480px) {
            .container {
                margin: 20px;
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
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

        <!-- Panel de Usuario -->
        <div id="userPanel" class="form-container">
            <h2>Mi Perfil</h2>
            <div id="userAlert"></div>
            <div id="emailVerificationNotice" class="email-verification-notice" style="display: none;">
                <strong>⚠️ Email no verificado</strong><br>
                Por favor verifica tu email para acceder a todas las funcionalidades.
            </div>
            <div id="userInfo" class="user-info">
                <h3>Información Personal</h3>
                <p><strong>Nombre:</strong> <span id="userName"></span></p>
                <p><strong>Email:</strong> <span id="userEmail"></span></p>
                <p><strong>Teléfono:</strong> <span id="userPhone">No proporcionado</span></p>
                <p><strong>Fecha de registro:</strong> <span id="userDate"></span></p>
                <p><strong>Estado:</strong> <span id="userStatus"></span></p>
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="showEditProfile()">Editar Perfil</button>
                <button class="btn-secondary" onclick="showChangePassword()">Cambiar Contraseña</button>
                <button class="btn-secondary" onclick="logout()">Cerrar Sesión</button>
            </div>
        </div>

        <!-- Formulario de Edición de Perfil -->
        <div id="editProfileForm" class="form-container">
            <h2>Editar Perfil</h2>
            <div id="editAlert"></div>
            <form id="editProfileFormElement">
                <div class="form-group">
                    <label for="editName">Nombre Completo *</label>
                    <input type="text" id="editName" required>
                </div>
                <div class="form-group">
                    <label for="editEmail">Correo Electrónico *</label>
                    <input type="email" id="editEmail" required>
                </div>
                <div class="form-group">
                    <label for="editPhone">Teléfono</label>
                    <input type="tel" id="editPhone">
                </div>
                <button type="submit" class="btn" id="editBtn">
                    <span class="btn-text">Guardar Cambios</span>
                </button>
            </form>
            <div class="form-actions">
                <button class="btn-secondary" onclick="showUserPanel()">Cancelar</button>
            </div>
        </div>

        <!-- Formulario de Cambio de Contraseña -->
        <div id="changePasswordForm" class="form-container">
            <h2>Cambiar Contraseña</h2>
            <div id="changePasswordAlert"></div>
            <form id="changePasswordFormElement">
                <div class="form-group">
                    <label for="newPassword">Nueva Contraseña *</label>
                    <input type="password" id="newPassword" required>
                    <div id="newPasswordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="confirmNewPassword">Confirmar Nueva Contraseña *</label>
                    <input type="password" id="confirmNewPassword" required>
                </div>
                <button type="submit" class="btn" id="changePasswordBtn">
                    <span class="btn-text">Cambiar Contraseña</span>
                </button>
            </form>
            <div class="form-actions">
                <button class="btn-secondary" onclick="showUserPanel()">Cancelar</button>
            </div>
        </div>
    </div>

    <script>
        // Configuración
        const API_BASE_URL = '/api/auth.php'; // Ajusta según tu estructura
        let currentUser = null;
        let sessionToken = localStorage.getItem('session_token');

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
        function showUserPanel() { showForm('userPanel'); }
        function showEditProfile() { 
            showForm('editProfileForm');
            populateEditForm();
        }
        function showChangePassword() { showForm('changePasswordForm'); }

        // Limpiar alertas
        function clearAlerts() {
            ['registerAlert', 'loginAlert', 'forgotAlert', 'userAlert', 'editAlert', 'changePasswordAlert'].forEach(id => {
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
                    'forgotBtn': 'Enviar Instrucciones',
                    'editBtn': 'Guardar Cambios',
                    'changePasswordBtn': 'Cambiar Contraseña'
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
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                if (sessionToken && method !== 'POST') {
                    options.headers['Authorization'] = `Bearer ${sessionToken}`;
                }

                if (method === 'POST' || method === 'PUT') {
                    options.body = JSON.stringify(data);
                }

                const url = `${API_BASE_URL}?action=${action}`;
                const response = await fetch(url, options);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Error en la petición');
                }

                return result;
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

            setButtonLoading('loginBtn',