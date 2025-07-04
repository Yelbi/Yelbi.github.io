// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

// Variable global para controlar el estado de autenticación
let authState = {
    checking: false,
    authenticated: false,
    userRole: null,
    lastCheck: 0,
    tokenValid: false,
    fastRedirectEnabled: false // Desactivamos la redirección automática
};

// Constantes de tiempo optimizadas
const AUTH_CHECK_INTERVAL = 30000; // 30 segundos (menos frecuente)
const AUTH_CACHE_DURATION = 120000; // 2 minutos de cache
const REDIRECT_DELAY = 50; // Delay mínimo ultra-rápido

// ============= FUNCIONES PARA EL DROPDOWN DEL USUARIO =============

// Función para actualizar el nombre de usuario en el dropdown
function updateDropdownUserName(userName) {
    const dropdownUserNameElements = document.querySelectorAll('#dropdownUserName, .dropdown-user-name');
    
    if (userName) {
        // Actualizar todos los elementos que muestran el nombre de usuario
        dropdownUserNameElements.forEach(element => {
            if (element) {
                element.textContent = userName;
            }
        });
        
        // También actualizar la variable global si existe
        if (typeof window.dropdownUserName !== 'undefined') {
            window.dropdownUserName = userName;
        }
    }
}

// Función para obtener el nombre de usuario desde localStorage o token
function getUserDisplayName() {
    // Primero intentar obtener desde localStorage
    let userName = localStorage.getItem('user_name');
    
    if (!userName) {
        // Si no está en localStorage, intentar extraer del token
        const token = localStorage.getItem('jwt_token');
        if (token) {
            const tokenData = decodeToken(token);
            if (tokenData && tokenData.email) {
                // Si no hay nombre, usar la parte del email antes del @
                userName = tokenData.email.split('@')[0];
            }
        }
    }
    
    return userName || 'Usuario';
}

// Función para inicializar el nombre de usuario en el dropdown
function initializeDropdownUserName() {
    const userName = getUserDisplayName();
    updateDropdownUserName(userName);
}

// Función para actualizar toda la información del usuario en la interfaz
function updateUserInfo(userData) {
    if (!userData) return;
    
    // Actualizar nombre de usuario
    if (userData.name || userData.email) {
        const displayName = userData.name || userData.email.split('@')[0];
        updateDropdownUserName(displayName);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('user_name', displayName);
    }
    
    // Actualizar imagen de perfil si está disponible
    if (userData.profile_image) {
        const profileImages = document.querySelectorAll('#profileImage, #dropdownProfileImage');
        profileImages.forEach(img => {
            if (img) img.src = userData.profile_image;
        });
        
        // Guardar en localStorage
        localStorage.setItem('profile_image', userData.profile_image);
    }
}

// ============= RESTO DE FUNCIONES EXISTENTES =============

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

// ============= SISTEMA DE AUTENTICACIÓN SIMPLIFICADO =============

// Función simplificada para decodificar JWT (sin validación de expiración)
function decodeToken(token) {
    if (!token || typeof token !== 'string') return null;
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(atob(parts[1]));
        
        return {
            role: payload.role || 'user',
            userId: payload.user_id,
            email: payload.email,
            exp: payload.exp,
            iat: payload.iat
        };
    } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
    }
}

// Cache inteligente para información del usuario
const userInfoCache = {
    data: null,
    timestamp: 0,
    
    get() {
        const now = Date.now();
        if (this.data && (now - this.timestamp < AUTH_CACHE_DURATION)) {
            return this.data;
        }
        return null;
    },
    
    set(data) {
        this.data = data;
        this.timestamp = Date.now();
    },
    
    clear() {
        this.data = null;
        this.timestamp = 0;
    }
};

// Función simplificada para verificar token válido (sin verificación de expiración)
function hasValidToken() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        authState.tokenValid = false;
        return false;
    }
    
    // Usar cache si está disponible
    const cachedInfo = userInfoCache.get();
    if (cachedInfo) {
        authState.tokenValid = true;
        authState.userRole = cachedInfo.role;
        return true;
    }
    
    const tokenInfo = decodeToken(token);
    if (!tokenInfo) {
        authState.tokenValid = false;
        return false;
    }
    
    // Guardar en cache
    userInfoCache.set(tokenInfo);
    authState.tokenValid = true;
    authState.userRole = tokenInfo.role;
    
    return true;
}

// Función de redirección simplificada
function fastRedirect() {
    if (!authState.fastRedirectEnabled) return false;
    
    const now = Date.now();
    
    // Evitar verificaciones muy frecuentes (menos de 500ms)
    if (authState.checking || (now - authState.lastCheck < 500)) {
        return false;
    }
    
    // Verificar si acabamos de hacer login
    if (sessionStorage.getItem('just_logged_in')) {
        console.log('🚫 Evitando verificación post-login');
        sessionStorage.removeItem('just_logged_in');
        return false;
    }
    
    // Verificación del token
    if (!hasValidToken()) {
        console.log('📝 Token inválido, permaneciendo en login');
        authState.authenticated = false;
        return false;
    }
    
    console.log('⚡ Redirección activada');
    
    // Actualizar estado inmediatamente
    authState.authenticated = true;
    authState.lastCheck = now;
    
    // Determinar URL de destino
    const targetUrl = authState.userRole === 'admin' ? '/admin-panel.php' : '/user-panel.php';
    
    console.log('🚀 Redirigiendo a:', targetUrl);
    
    // Redirección inmediata sin mensaje
    window.location.replace(targetUrl);
    
    return true;
}

// Sistema de monitoreo simplificado (sin verificación de expiración)
function startSimpleMonitoring() {
    // Verificación inicial
    setTimeout(() => fastRedirect(), 10);
    
    // Monitoreo básico
    const monitoringInterval = setInterval(() => {
        const now = Date.now();
        
        // Solo verificar si ha pasado suficiente tiempo y no estamos verificando
        if (!authState.checking && (now - authState.lastCheck > AUTH_CACHE_DURATION)) {
            
            // Verificación local
            if (hasValidToken() && !authState.authenticated) {
                console.log('🔄 Monitoreo detectó cambio de estado');
                fastRedirect();
            }
        }
    }, AUTH_CHECK_INTERVAL);
    
    // Listener para cambios en localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'jwt_token') {
            userInfoCache.clear(); // Limpiar cache
            
            if (e.newValue) {
                console.log('🔄 Token detectado en otra pestaña');
                setTimeout(() => fastRedirect(), 50);
            } else {
                console.log('🚫 Token removido en otra pestaña');
                authState.authenticated = false;
                authState.userRole = null;
                authState.tokenValid = false;
            }
        }
    });
    
    // Listener para visibilidad
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !authState.authenticated) {
            console.log('🔄 Página visible, verificación');
            setTimeout(() => fastRedirect(), 25);
        }
    });
    
    // Limpiar intervalo al cerrar página
    window.addEventListener('beforeunload', () => {
        clearInterval(monitoringInterval);
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

// API Request optimizado con reintentos
async function apiRequest(action, data = {}, method = 'POST', retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
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
            console.error(`API Error (intento ${attempt + 1}):`, error);
            
            // Si es el último intento, lanzar error
            if (attempt === retries) {
                throw new Error(error.message || 'Error en la conexión');
            }
            
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
}

// Login simplificado
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

        console.log('✅ Login exitoso');

        if (!result.token) {
            throw new Error('No se recibió token de autenticación');
        }

        // Limpiar estado anterior
        userInfoCache.clear();
        
        // Guardar token inmediatamente
        localStorage.setItem('jwt_token', result.token);
        
        // Marcar login exitoso
        sessionStorage.setItem('just_logged_in', 'true');
        
        console.log('💾 Token guardado');

        // Determinar rol del usuario
        let userRole = 'user';
        if (result.user && result.user.role) {
            userRole = result.user.role;
        } else if (result.is_admin) {
            userRole = 'admin';
        }

        // Actualizar estado inmediatamente
        authState.authenticated = true;
        authState.userRole = userRole;
        authState.tokenValid = true;
        authState.lastCheck = Date.now();

        // Guardar info en cache
        const userData = {
            role: userRole,
            userId: result.user?.id,
            email: email,
            name: result.user?.name || email.split('@')[0],
            profile_image: result.user?.profile_image || '/Img/default-avatar.png'
        };
        userInfoCache.set(userData);

        console.log('👤 Role:', userRole);

        // Actualizar la interfaz para mostrar el menú de perfil
        updateAuthUI();
        
        // Actualizar información del usuario en dropdown
        updateUserInfo(userData);

        // REDIRECCIÓN AUTOMÁTICA AL PANEL
        const targetUrl = userRole === 'admin' ? '/admin-panel.php' : '/user-panel.php';
        console.log('🚀 Redirigiendo a:', targetUrl);
        window.location.href = targetUrl;
        
        return true;
    } catch (error) {
        console.error('❌ Error en login:', error);
        showAlert('loginAlert', error.message || 'Error en el inicio de sesión');
        return false;
    } finally {
        setButtonLoading('loginBtn', false);
    }
}

// Cerrar sesión optimizado
function logout() {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar todo el estado
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('profile_image');
    sessionStorage.removeItem('just_logged_in');
    sessionStorage.removeItem('auth_checked');
    
    // Limpiar cache
    userInfoCache.clear();
    
    // Resetear estado de autenticación
    authState.authenticated = false;
    authState.userRole = null;
    authState.checking = false;
    authState.lastCheck = 0;
    authState.tokenValid = false;
    
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

// Función para actualizar la interfaz de usuario según el estado de autenticación
function updateAuthUI() {
    const loginButton = document.getElementById('loginButton');
    const profileMenu = document.getElementById('profileMenu');
    const panelRedirect = document.getElementById('panelRedirect');
    
    if (hasValidToken()) {
        // Obtener datos del usuario desde el cache
        const cachedUser = userInfoCache.get();
        
        if (cachedUser) {
            // Actualizar imágenes de perfil
            const profileImages = document.querySelectorAll('#profileImage, #dropdownProfileImage');
            profileImages.forEach(img => {
                img.src = cachedUser.profile_image || '/Img/default-avatar.png';
            });
            
            // Actualizar nombre de usuario usando la nueva función
            updateDropdownUserName(cachedUser.name || cachedUser.email.split('@')[0]);
        }
        
        // Mostrar menú de perfil y ocultar botón de login
        if (loginButton) loginButton.style.display = 'none';
        if (profileMenu) profileMenu.style.display = 'block';
        if (panelRedirect) panelRedirect.style.display = 'block';
    } else {
        // Mostrar botón de login y ocultar menú de perfil
        if (loginButton) loginButton.style.display = 'block';
        if (profileMenu) profileMenu.style.display = 'none';
        if (panelRedirect) panelRedirect.style.display = 'none';
    }
}

// Hacer las funciones globales para que funcionen desde el HTML
window.showForgotPassword = showForgotPassword;
window.showResetPassword = showResetPassword;
window.backToLogin = backToLogin;
window.updateAuthUI = updateAuthUI;
window.updateDropdownUserName = updateDropdownUserName;
window.getUserDisplayName = getUserDisplayName;
window.initializeDropdownUserName = initializeDropdownUserName;
window.updateUserInfo = updateUserInfo;
window.logout = logout;

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando sistema de autenticación...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    const justLoggedIn = sessionStorage.getItem('just_logged_in');
    
    console.log('📊 Estado inicial:', { 
        hasToken: !!localStorage.getItem('jwt_token'), 
        hasResetToken: !!resetToken, 
        justLoggedIn: !!justLoggedIn,
        currentPath: window.location.pathname
    });
    
    // 1. Manejar reset password (prioridad máxima)
    if (resetToken) {
        console.log('🔑 Procesando reset token');
        const tokenInput = document.getElementById('resetToken');
        if (tokenInput) {
            tokenInput.value = resetToken;
            tokenInput.readOnly = true;
            tokenInput.style.backgroundColor = '#f8f9fa';
        }
        showResetPassword();
        return;
    }
    
    // 2. Si hay token válido, redirigir automáticamente
    if (hasValidToken()) {
        console.log('🔑 Usuario autenticado, redirigiendo...');
        
        // Inicializar dropdown con información del usuario
        initializeDropdownUserName();
        
        const userRole = authState.userRole;
        const targetUrl = userRole === 'admin' ? '/admin-panel.php' : '/user-panel.php';
        window.location.href = targetUrl;
        return;
    }
    
    // 3. Si acabamos de hacer login, evitar verificación
    if (justLoggedIn) {
        console.log('🚫 Post-login, evitando verificación');
        sessionStorage.removeItem('just_logged_in');
    }
    
    // 4. Mostrar formulario de login
    showLogin();
});

// Event Listeners optimizados
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