// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadAdminMessages();
});

async function loadProfile() {
    try {
        const result = await apiRequest('profile', {}, 'GET');
        if (result.user) {
            document.getElementById('profileName').textContent = result.user.name;
            document.getElementById('profileEmail').textContent = result.user.email;
        } else {
            throw new Error('No se pudo cargar el perfil');
        }
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
        setTimeout(() => {
            window.location.href = '/iniciar.php';
        }, 2000);
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/iniciar.php';
}

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

// Función para mostrar alertas
function showAlert(elementId, message, type = 'error') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
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

// Cargar mensajes para admin
async function loadAdminMessages() {
    try {
        const container = document.getElementById('messagesContainer');
        const messageCountElement = document.getElementById('messageCount');
        
        // Mostrar loading
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <span>Cargando mensajes...</span>
            </div>
        `;
        
        const result = await apiRequest('get-complaints', {}, 'GET');
        
        const totalMessages = result.complaints ? result.complaints.length : 0;
        
        // Actualizar contador
        if (messageCountElement) {
            if (totalMessages > 0) {
                messageCountElement.textContent = totalMessages;
                messageCountElement.style.display = 'inline-block';
            } else {
                messageCountElement.style.display = 'none';
            }
        }
        
        if (totalMessages === 0) {
            container.innerHTML = `
                <div class="empty-mailbox">
                    <div class="empty-icon">📭</div>
                    <h3>No hay mensajes</h3>
                    <p>Cuando los usuarios envíen mensajes, aparecerán aquí organizados como en Gmail.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        // Ordenar mensajes por fecha (más recientes primero)
        const sortedComplaints = result.complaints.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        sortedComplaints.forEach((complaint, index) => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.dataset.id = complaint.id;
            
            // Marcar como no leído si es reciente (opcional)
            const isRecent = (Date.now() - new Date(complaint.created_at).getTime()) < 24 * 60 * 60 * 1000;
            if (isRecent) {
                messageElement.classList.add('unread');
            }
            
            const formattedDate = formatMessageDate(complaint.created_at);
            const avatar = complaint.user_email.charAt(0).toUpperCase();
            
            messageElement.innerHTML = `
                <div class="message-header" onclick="toggleMessageDetail(${complaint.id})">
                    <div class="sender-info">
                        <div class="sender-avatar" style="background: ${getAvatarColor(complaint.user_email)}">${avatar}</div>
                        <div class="sender-details">
                            <div class="sender-name">${complaint.user_email}</div>
                            <div class="message-subject">${truncateText(complaint.subject, 60)}</div>
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
                        <small>
                            📅 Enviado el: ${new Date(complaint.created_at).toLocaleString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </small>
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
        
        // Cerrar otros mensajes abiertos
        document.querySelectorAll('.message-item.expanded').forEach(item => {
            if (item !== messageItem) {
                item.classList.remove('expanded');
                const bodyElement = item.querySelector('.message-body');
                if (bodyElement) bodyElement.style.display = 'none';
            }
        });
        
        if (isVisible) {
            messageBody.style.display = 'none';
            messageItem.classList.remove('expanded');
        } else {
            messageBody.style.display = 'block';
            messageItem.classList.add('expanded');
            
            // Marcar como leído
            messageItem.classList.remove('unread');
            
            // Scroll suave al mensaje
            messageItem.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }
}

// Eliminar mensaje
async function deleteMessage(event, messageId) {
    event.stopPropagation();
    
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) {
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
        // Mostrar loading en el botón
        deleteBtn.innerHTML = '<div class="loading-spinner small"></div>';
        deleteBtn.disabled = true;
        
        // Animación de eliminación
        messageElement.style.opacity = '0.5';
        messageElement.style.pointerEvents = 'none';
        messageElement.style.transform = 'scale(0.98)';
        
        await apiRequest('delete-complaint', { 
            id: messageId  
        }, 'POST'); 
        
        // Animación de salida
        messageElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
        messageElement.style.transform = 'translateX(-100%) scale(0.9)';
        messageElement.style.opacity = '0';
        messageElement.style.maxHeight = '0';
        messageElement.style.marginBottom = '0';
        messageElement.style.paddingTop = '0';
        messageElement.style.paddingBottom = '0';
        
        setTimeout(() => {
            messageElement.remove();
            
            // Actualizar contador
            const remainingMessages = document.querySelectorAll('.message-item');
            const messageCountElement = document.getElementById('messageCount');
            
            if (remainingMessages.length === 0) {
                const container = document.getElementById('messagesContainer');
                container.innerHTML = `
                    <div class="empty-mailbox">
                        <div class="empty-icon">📭</div>
                        <h3>No hay mensajes</h3>
                        <p>Todos los mensajes han sido eliminados.</p>
                    </div>
                `;
                if (messageCountElement) {
                    messageCountElement.style.display = 'none';
                }
            } else {
                if (messageCountElement) {
                    messageCountElement.textContent = remainingMessages.length;
                }
            }
        }, 400);
        
        // Mostrar confirmación
        showAlert('profileAlert', 'Mensaje eliminado correctamente', 'success');
        setTimeout(() => {
            document.getElementById('profileAlert').innerHTML = '';
        }, 3000);
        
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        
        // Restaurar estado
        messageElement.style.opacity = '1';
        messageElement.style.pointerEvents = 'auto';
        messageElement.style.transform = 'scale(1)';
        deleteBtn.innerHTML = originalHTML;
        deleteBtn.disabled = false;
        
        showAlert('profileAlert', error.message || 'Error al eliminar el mensaje', 'error');
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

// Hacer funciones accesibles globalmente
window.toggleMessageDetail = toggleMessageDetail;
window.deleteMessage = deleteMessage;
window.loadAdminMessages = loadAdminMessages;