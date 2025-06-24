<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles/iniciar.css">
    <title>Sistema de Usuarios</title>
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
                    <label for="registerPassword">Contraseña *</label>
                    <input type="password" id="registerPassword" required>
                    <div id="passwordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="registerConfirmPassword">Confirmar Contraseña *</label>
                    <input type="password" id="registerConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="registerBtn">Crear Cuenta</button>
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
                <button type="submit" class="btn" id="loginBtn">Iniciar Sesión</button>
            </form>
            <a href="#" class="link-btn" onclick="showRegister()">¿No tienes cuenta? Regístrate</a>
            <a href="#" class="link-btn" onclick="showForgotPassword()">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Formulario Recuperación -->
        <div id="forgotPasswordForm" class="form-container">
            <h2>Recuperar Contraseña</h2>
            <div id="forgotPasswordAlert"></div>
            <form id="forgotPasswordFormElement">
                <div class="form-group">
                    <label for="forgotEmail">Correo Electrónico</label>
                    <input type="email" id="forgotEmail" required>
                </div>
                <button type="submit" class="btn" id="forgotPasswordBtn">Enviar Enlace</button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()">Volver al inicio de sesión</a>
        </div>

        <!-- Formulario de Restablecer Contraseña -->
        <div id="resetPasswordForm" class="form-container">
            <h2>Restablecer Contraseña</h2>
            <div id="resetPasswordAlert"></div>
            <form id="resetPasswordFormElement">
                <div class="form-group">
                    <label for="resetToken">Token de Recuperación</label>
                    <input type="text" id="resetToken" required readonly>
                    <small class="form-text text-muted">Este token se completó automáticamente</small>
                </div>
                <div class="form-group">
                    <label for="resetNewPassword">Nueva Contraseña *</label>
                    <input type="password" id="resetNewPassword" required>
                    <div id="resetPasswordStrength" class="password-strength"></div>
                </div>
                <div class="form-group">
                    <label for="resetConfirmPassword">Confirmar Nueva Contraseña *</label>
                    <input type="password" id="resetConfirmPassword" required>
                </div>
                <button type="submit" class="btn" id="resetPasswordBtn">Cambiar Contraseña</button>
            </form>
            <a href="#" class="link-btn" onclick="backToLogin()">Volver al inicio de sesión</a>
        </div>

        <!-- Panel de Perfil -->
        <div id="profilePanel" class="form-container">
            <h2>Mi Perfil</h2>
            <div id="profileAlert"></div>
            <div class="user-info">
                <p><strong>Nombre:</strong> <span id="profileName"></span></p>
                <p><strong>Email:</strong> <span id="profileEmail"></span></p>
                
                <!-- Sección para usuarios normales -->
                <div id="userSection" style="display: none;">
                    <h3>Buzón de Quejas y Sugerencias</h3>
                    <form id="complaintForm">
                        <div class="form-group">
                            <label for="complaintSubject">Asunto *</label>
                            <input type="text" id="complaintSubject" required>
                        </div>
                        <div class="form-group">
                            <label for="complaintDescription">Descripción *</label>
                            <textarea id="complaintDescription" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn">Enviar Mensaje</button>
                    </form>
                </div>
                
                <!-- Sección para administradores -->
                <div id="adminSection" style="display: none;">
                    <h3>Panel de Administración</h3>
                    <div class="mailbox-header">
                        <div class="mailbox-title">
                            Bandeja de entrada
                            <span class="message-count" id="messageCount" style="display: none;">0</span>
                        </div>
                        <button class="btn-refresh" onclick="loadAdminMessages()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Actualizar
                        </button>
                    </div>
    
    <!-- Toolbar -->
    <div class="mailbox-toolbar" style="display: none;">
        <button class="toolbar-btn active">Todos</button>
        <button class="toolbar-btn">No leídos</button>
        <button class="toolbar-btn">Importantes</button>
    </div>
    
    <div id="messagesContainer" class="mailbox-container">
        <!-- Mensajes se cargarán aquí -->
    </div>
</div>
                
                <button class="btn" onclick="logout()">Cerrar Sesión</button>
            </div>
        </div>
    </div>
    <script src="/JS/iniciar.js"></script>
</body>
</html>