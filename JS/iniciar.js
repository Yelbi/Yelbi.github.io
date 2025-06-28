// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

// Variable global para controlar el estado de autenticación
let authState = {
    checking: false,
    authenticated: false,
    userRole: null,
    lastCheck: 0
};

// Constantes de tiempo
const AUTH_CHECK_INTERVAL = 5000; // 5 segundos
const AUTH_CACHE_DURATION = 30000; // 30 segundos
const REDIRECT_DELAY = 200; // Delay mínimo para redirección

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
    if (!alertDiv) return;
    
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

// ============= FUNCIONES DE AUTENTICACIÓN MEJORADAS =============

// Función para verificar si hay token válido localmente (sin hacer petición al servidor)
function hasValidTokenLocally() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    try {
        // Decodificar JWT para verificar expiración
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // Verificar si el token ha expirado
        if (payload.exp && payload.exp < now) {
            console.log('🚫 Token expirado localmente');
            localStorage.removeItem('jwt_token');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        localStorage.removeItem('jwt_token');
        return false;
    }
}

// Función optimizada para obtener información del usuario del token
function getUserInfoFromToken() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            role: payload.role || 'user',
            userId: payload.user_id,
            email: payload.email,
            exp: payload.exp
        };
    } catch (error) {
        console.error('❌ Error obteniendo info del token:', error);
        return null;
    }
}

// Función para redirigir inmediatamente basado en el token local
function immediateRedirectIfAuthenticated() {
    const now = Date.now();
    
    // Evitar verificaciones muy frecuentes
    if (authState.checking || (now - authState.lastCheck < 1000)) {
        return false;
    }
    
    // Verificar si acabamos de hacer login
    if (sessionStorage.getItem('just_logged_in')) {
        console.log('🚫 Acabamos de hacer login, evitando verificación');
        sessionStorage.removeItem('just_logged_in');
        return false;
    }
    
    // Verificar token localmente primero
    if (!hasValidTokenLocally()) {
        console.log('📝 No hay token válido, mostrando login');
        authState.authenticated = false;
        authState.userRole = null;
        return false;
    }
    
    // Obtener información del usuario del token
    const userInfo = getUserInfoFromToken();
    if (!userInfo) {
        console.log('❌ No se pudo obtener info del usuario');
        return false;
    }
    
    console.log('✅ Token válido encontrado, redirigiendo inmediatamente');
    
    // Actualizar estado
    authState.authenticated = true;
    authState.userRole = userInfo.role;
    authState.lastCheck = now;
    
    // Mostrar mensaje de redirección
    showAlert('loginAlert', 'Sesión activa. Redirigiendo...', 'success');
    
    // Redirigir inmediatamente
    const targetUrl = userInfo.role === 'admin' ? '/admin-panel.php' : '/user-panel.php';
    console.log('🚀 Redirigiendo a:', targetUrl);
    
    setTimeout(() => {
        window.location.replace(targetUrl);
    }, REDIRECT_DELAY);
    
    return true;
}

// Función para verificar autenticación con el servidor (verificación completa)
async function verifyAuthWithServer() {
    if (authState.checking) return false;
    
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    authState.checking = true;
    
    try {
        console.log('🔍 Verificando autenticación con servidor...');
        
        const result = await apiRequest('profile', {}, 'GET');
        
        if (result.user && result.user.role) {
            authState.authenticated = true;
            authState.userRole = result.user.role;
            authState.lastCheck = Date.now();
            
            console.log('✅ Usuario verificado con servidor:', result.user.role);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Error verificando con servidor:', error);
        
        // Limpiar token inválido
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem('just_logged_in');
        authState.authenticated = false;
        authState.userRole = null;
        
        return false;
    } finally {
        authState.checking = false;
    }
}

// Función principal de verificación de autenticación
async function checkAuthAndRedirect() {
    // Primero: verificación inmediata con token local
    if (immediateRedirectIfAuthenticated()) {
        return true;
    }
    
    // Si no hay token válido, no continuar
    if (!hasValidTokenLocally()) {
        return false;
    }
    
    // Segundo: verificación con servidor para tokens válidos localmente
    const isServerAuth = await verifyAuthWithServer();
    
    if (isServerAuth && authState.userRole) {
        const targetUrl = authState.userRole === 'admin' ? '/admin-panel.php' : '/user-panel.php';
        console.log('🚀 Redirigiendo después de verificación del servidor:', targetUrl);
        
        showAlert('loginAlert', 'Autenticación verificada. Redirigiendo...', 'success');
        
        setTimeout(() => {
            window.location.replace(targetUrl);
        }, REDIRECT_DELAY);
        
        return true;
    }
    
    return false;
}

// Función para monitoreo continuo de autenticación
function startAuthMonitoring() {
    // Verificación inicial inmediata
    immediateRedirectIfAuthenticated();
    
    // Monitoreo periódico más eficiente
    setInterval(() => {
        // Solo verificar si no estamos ya verificando y ha pasado suficiente tiempo
        const now = Date.now();
        if (!authState.checking && (now - authState.lastCheck > AUTH_CACHE_DURATION)) {
            
            // Verificación rápida local primero
            if (hasValidTokenLocally() && !authState.authenticated) {
                console.log('🔄 Verificación periódica detectó token');
                checkAuthAndRedirect();
            }
        }
    }, AUTH_CHECK_INTERVAL);
    
    // Listener para cambios en localStorage (útil para múltiples pestañas)
    window.addEventListener('storage', (e) => {
        if (e.key === 'jwt_token') {
            if (e.newValue) {
                console.log('🔄 Token detectado en otra pestaña');
                setTimeout(() => immediateRedirectIfAuthenticated(), 100);
            } else {
                console.log('🚫 Token removido en otra pestaña');
                authState.authenticated = false;
                authState.userRole = null;
            }
        }
    });
    
    // Listener para visibilidad de la página
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && hasValidTokenLocally() && !authState.authenticated) {
            console.log('🔄 Página visible, verificando autenticación');
            setTimeout(() => immediateRedirectIfAuthenticated(), 100);
        }
    });
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
        if (strengthEl) strengthEl.innerHTML = '';

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

// API Request optimizado
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

// Login optimizado
async function login(email, password) {
    if (!email || !password) {
        showAlert('loginAlert', 'Por favor, completa todos los campos.');
        return false;
    }

    console.log('🔄 Iniciando login para:', email);

    setButtonLoading('loginBtn', true);

    try {
        const result = await apiRequest('login', {
            email: email.toLowerCase().trim(),
            password: password
        });

        console.log('✅ Resultado del login:', result);

        if (!result.token) {
            throw new Error('No se recibió token de autenticación');
        }

        // Guardar token
        localStorage.setItem('jwt_token', result.token);
        
        // Marcar que acabamos de hacer login exitoso
        sessionStorage.setItem('just_logged_in', 'true');
        
        console.log('💾 Token guardado');

        // Determinar rol del usuario
        let userRole = 'user';
        if (result.user && result.user.role) {
            userRole = result.user.role;
        } else if (result.is_admin) {
            userRole = 'admin';
        }

        // Actualizar estado de autenticación
        authState.authenticated = true;
        authState.userRole = userRole;
        authState.lastCheck = Date.now();

        console.log('👤 Role detectado:', userRole);

        // Mostrar mensaje de éxito
        showAlert('loginAlert', 'Iniciando sesión...', 'success');
        
        // Redirigir inmediatamente
        const targetUrl = userRole === 'admin' ? '/admin-panel.php' : '/user-panel.php';
        console.log('🚀 Redirigiendo a:', targetUrl);
        
        setTimeout(() => {
            window.location.replace(targetUrl);
        }, REDIRECT_DELAY);
        
        return true;
    } catch (error) {
        console.error('❌ Error en login:', error);
        showAlert('loginAlert', error.message || 'Error en el inicio de sesión');
        return false;
    } finally {
        setButtonLoading('loginBtn', false);
    }
}

// Cerrar sesión mejorado
function logout() {
    // Limpiar todo el estado
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('just_logged_in');
    sessionStorage.removeItem('auth_checked');
    
    // Resetear estado de autenticación
    authState.authenticated = false;
    authState.userRole = null;
    authState.checking = false;
    authState.lastCheck = 0;
    
    // Redirigir
    window.location.href = '/iniciar.php';
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

// Hacer las funciones globales para que funcionen desde el HTML
window.showForgotPassword = showForgotPassword;
window.showResetPassword = showResetPassword;
window.backToLogin = backToLogin;

// Al cargar la página - VERSIÓN ULTRA OPTIMIZADA
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 DOMContentLoaded ejecutándose...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    const justLoggedIn = sessionStorage.getItem('just_logged_in');
    
    console.log('📊 Estado inicial:', { 
        hasToken: !!localStorage.getItem('jwt_token'), 
        hasResetToken: !!resetToken, 
        justLoggedIn: !!justLoggedIn,
        currentPath: window.location.pathname
    });
    
    // 1. Manejar reset password primero (tiene prioridad)
    if (resetToken) {
        console.log('🔑 Manejando reset token');
        const tokenInput = document.getElementById('resetToken');
        if (tokenInput) {
            tokenInput.value = resetToken;
            tokenInput.readOnly = true;
            tokenInput.style.backgroundColor = '#f8f9fa';
        }
        showResetPassword();
        return;
    }
    
    // 2. Si acabamos de hacer login, NO verificar el token (evitar bucle)
    if (justLoggedIn) {
        console.log('🚫 Acabamos de hacer login, evitando verificación');
        sessionStorage.removeItem('just_logged_in');
        showLogin(); // Mostrar formulario mientras se procesa la redirección
        return;
    }
    
    // 3. Verificación ultra rápida de autenticación
    const isAuthenticated = await checkAuthAndRedirect();
    
    // 4. Si no está autenticado, mostrar formulario de login
    if (!isAuthenticated) {
        console.log('📝 Mostrando formulario de login');
        showLogin();
    }
    
    // 5. Iniciar monitoreo continuo
    startAuthMonitoring();
});

// Event Listeners
document.getElementById('registerFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    await register(name, email, password, confirmPassword);
});

document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    await login(email, password);
});

// Event listeners para recuperación de contraseñas
document.getElementById('forgotPasswordFormElement')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    requestPasswordReset(email);
});

document.getElementById('resetPasswordFormElement')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('resetNewPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;
    
    resetPassword(token, newPassword, confirmPassword);
});

// Evento para enviar queja/sugerencia
document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
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

// Verificación de contraseña en tiempo real para reset
document.getElementById('resetNewPassword')?.addEventListener('input', function() {
    const strengthDiv = document.getElementById('resetPasswordStrength');
    if (strengthDiv) {
        showPasswordRequirements(strengthDiv, this.value);
    }
});