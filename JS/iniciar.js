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
        
        // Redirigir según el rol
        if (result.user && result.user.role === 'admin') {
            window.location.href = '/admin-panel.php';
        } else {
            window.location.href = '/user-panel.php';
        }
        
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



function formatMessageDate(dateString) {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffTime = now - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        // Hoy - mostrar hora
        return messageDate.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (diffDays === 1) {
        return 'Ayer';
    } else if (diffDays < 7) {
        return messageDate.toLocaleDateString('es-ES', { weekday: 'short' });
    } else if (diffDays < 365) {
        return messageDate.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
    } else {
        return messageDate.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }
}

function getAvatarColor(email) {
    // Generar color basado en el email
    const colors = [
        'linear-gradient(135deg, #1a73e8, #4285f4)',
        'linear-gradient(135deg, #34a853, #0f9d58)',
        'linear-gradient(135deg, #ea4335, #d93025)',
        'linear-gradient(135deg, #fbbc04, #f9ab00)',
        'linear-gradient(135deg, #9aa0a6, #5f6368)',
        'linear-gradient(135deg, #ff6d01, #e8710a)',
        'linear-gradient(135deg, #9c27b0, #7b1fa2)',
        'linear-gradient(135deg, #00bcd4, #0097a7)'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
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