// Configuración
const API_BASE_URL = 'https://seres.blog/api/auth.php';

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadAdminMessages();
    await loadVotingResults();
    await loadPendingImages();
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
        console.error('Profile load error:', error);
        
        // Manejar específicamente errores 401 y 403
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/iniciar.php';
        } else {
            showAlert('profileAlert', 'Error cargando perfil: ' + error.message, 'error');
        }
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
        console.log(`Making request to: ${url}`); // Debug log
        
        const response = await fetch(url, options);
        const textResponse = await response.text();
        
        console.log(`Response for ${action}:`, textResponse); // Debug log
        
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
            // Usar avatar del usuario si está disponible
            const avatarImage = complaint.user_profile_image || '/Img/default-avatar.png';
            const avatar = `<img src="${avatarImage}" alt="${complaint.user_email}">`;
            
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

// FUNCIÓN CORREGIDA PARA CARGAR RESULTADOS DE VOTACIÓN
async function loadVotingResults() {
    try {
        const container = document.getElementById('votingResultsContainer');
        
        // Verificar que el contenedor existe
        if (!container) {
            console.error('No se encontró el contenedor votingResultsContainer');
            return;
        }
        
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <span>Cargando resultados...</span>
            </div>
        `;
        
        console.log('Solicitando resultados de votación...'); // Debug log
        
        // Timeout reducido a 10 segundos
        const timeoutId = setTimeout(() => {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Timeout al cargar resultados</h3>
                    <p>La solicitud tardó demasiado en responder</p>
                    <button class="btn-retry" onclick="loadVotingResults()">Reintentar</button>
                </div>
            `;
        }, 10000);

        // Probar múltiples endpoints posibles
        let result = null;
        const possibleEndpoints = ['get-vote-results', 'voting-results', 'get-votes', 'vote-results'];
        
        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Probando endpoint: ${endpoint}`);
                result = await apiRequest(endpoint, {}, 'GET');
                console.log(`Éxito con endpoint ${endpoint}:`, result);
                break;
            } catch (error) {
                console.log(`Error con endpoint ${endpoint}:`, error.message);
                // Continuar con el siguiente endpoint
            }
        }
        
        clearTimeout(timeoutId);
        
        if (!result) {
            throw new Error('No se pudo obtener datos de ningún endpoint de votación');
        }
        
        console.log('Respuesta de resultados:', result); // Debug log
        
        // Manejar diferentes estructuras de respuesta de manera más robusta
        let votingData = null;
        let totalVotes = 0;
        
        // Intentar extraer los datos de votación
        if (result.success && result.data) {
            // Estructura: { success: true, data: { results: [...], total: X } }
            votingData = result.data.results || result.data;
            totalVotes = result.data.total || 0;
        } else if (result.results) {
            // Estructura: { results: [...], total: X }
            votingData = result.results;
            totalVotes = result.total || 0;
        } else if (Array.isArray(result)) {
            // Estructura: [{ mythology: "...", votes: X }, ...]
            votingData = result;
            totalVotes = result.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);
        } else if (result.data && Array.isArray(result.data)) {
            // Estructura: { data: [{ mythology: "...", votes: X }, ...] }
            votingData = result.data;
            totalVotes = result.data.reduce((sum, item) => sum + (parseInt(item.votes) || 0), 0);
        } else {
            console.log('Estructura de respuesta no reconocida:', result);
            throw new Error('Estructura de respuesta no válida');
        }
        
        // Validar que tenemos datos válidos
        if (!votingData || !Array.isArray(votingData)) {
            throw new Error('Los datos de votación no están en formato de array');
        }
        
        if (votingData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No hay votos registrados</h3>
                    <p>Cuando los usuarios voten, los resultados aparecerán aquí.</p>
                    <button class="btn-retry" onclick="loadVotingResults()">Actualizar</button>
                </div>
            `;
            return;
        }
        
        // Normalizar datos y calcular total si no se proporcionó
        const normalizedData = votingData.map(item => ({
            mythology: item.mythology || item.name || item.option || 'Sin nombre',
            votes: parseInt(item.votes) || parseInt(item.count) || 0
        }));
        
        // Recalcular total si es necesario
        if (totalVotes === 0) {
            totalVotes = normalizedData.reduce((sum, item) => sum + item.votes, 0);
        }
        
        // Ordenar por número de votos (descendente)
        const sortedResults = [...normalizedData].sort((a, b) => b.votes - a.votes);
        
        let html = `
            <div class="results-summary">
                <div class="total-votes">
                    <i class="fi fi-rr-users"></i>
                    Total de votos: <strong>${totalVotes}</strong>
                </div>
                <div class="last-updated">
                    Última actualización: ${new Date().toLocaleString('es-ES')}
                </div>
            </div>
            <div class="results-list">
        `;
        
        sortedResults.forEach((item, index) => {
            const votes = item.votes;
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
            const mythology = item.mythology;
            
            html += `
                <div class="result-item" style="animation-delay: ${index * 0.1}s">
                    <div class="result-header">
                        <div class="mythology-name">
                            <span class="rank">#${index + 1}</span>
                            ${mythology}
                        </div>
                        <div class="vote-percentage">${percentage}%</div>
                    </div>
                    <div class="vote-bar-container">
                        <div class="vote-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="vote-count">
                        ${votes} ${votes === 1 ? 'voto' : 'votos'}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Animar las barras
        setTimeout(() => {
            const bars = container.querySelectorAll('.vote-bar');
            bars.forEach(bar => {
                bar.style.transition = 'width 0.8s ease-out';
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading voting results:', error);
        const container = document.getElementById('votingResultsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar resultados</h3>
                    <p>${error.message}</p>
                    <div class="error-actions">
                        <button class="btn-retry" onclick="loadVotingResults()">Reintentar</button>
                        <button class="btn-debug" onclick="debugVotingResults()">Debug</button>
                    </div>
                </div>
            `;
        }
    }
}

// Función de debug para votación
async function debugVotingResults() {
    console.log('=== DEBUG VOTING RESULTS ===');
    try {
        const token = localStorage.getItem('jwt_token');
        console.log('Token exists:', !!token);
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
        
        // Verificar conectividad básica
        console.log('Verificando conectividad...');
        const basicTest = await fetch('https://seres.blog/api/auth.php?action=profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Estado de conectividad:', basicTest.status);
        
        // Probar diferentes endpoints
        const endpoints = ['get-vote-results', 'voting-results', 'get-votes', 'vote-results'];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`\n--- Probando endpoint: ${endpoint} ---`);
                const result = await apiRequest(endpoint, {}, 'GET');
                console.log(`✅ Éxito con ${endpoint}:`, result);
                
                // Analizar estructura
                console.log(`Tipo de respuesta: ${typeof result}`);
                console.log(`Es array: ${Array.isArray(result)}`);
                console.log(`Propiedades: ${Object.keys(result)}`);
                
            } catch (error) {
                console.log(`❌ Error en ${endpoint}:`, error.message);
            }
        }
        
        // Mostrar información adicional
        console.log('\n=== INFORMACIÓN ADICIONAL ===');
        console.log('User Agent:', navigator.userAgent);
        console.log('Timestamp:', new Date().toISOString());
        console.log('URL actual:', window.location.href);
        
    } catch (error) {
        console.error('Error en debug:', error);
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

// En DOMContentLoaded
await loadPendingImages();

async function loadPendingImages() {
    try {
        const container = document.getElementById('pendingImagesContainer');
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <span>Cargando imágenes pendientes...</span>
            </div>
        `;

        const result = await apiRequest('get-pending-images', {}, 'GET');
        
        // Verificar si hay imágenes
        if (!result.images || result.images.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🖼️</div>
                    <h3>No hay imágenes pendientes</h3>
                    <p>Todas las imágenes han sido revisadas.</p>
                </div>
            `;
            return;
        }

        let html = `<div class="image-grid">`;
        result.images.forEach(image => {
            // Asegurarse de que todos los campos existen
            const serName = image.ser_name || 'Desconocido';
            const userEmail = image.email || 'Usuario desconocido';
            const date = image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Fecha desconocida';
            
            html += `
                <div class="image-card" data-id="${image.id}">
                    <img src="${image.image_url}" alt="Imagen pendiente" onerror="this.src='/Img/image-placeholder.png'">
                    <div class="image-info">
                        <p><strong>Ser:</strong> ${serName}</p>
                        <p><strong>Usuario:</strong> ${userEmail}</p>
                        <p><strong>Fecha:</strong> ${date}</p>
                    </div>
                    <div class="image-actions">
                        <button class="btn-approve" onclick="approveImage(${image.id})">Aprobar</button>
                        <button class="btn-reject" onclick="rejectImage(${image.id})">Rechazar</button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        container.innerHTML = html;

    } catch (error) {
        const container = document.getElementById('pendingImagesContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error al cargar imágenes</h3>
                    <p>${error.message}</p>
                    <button class="btn-retry" onclick="loadPendingImages()">Reintentar</button>
                </div>
            `;
        }
        console.error('Error loading pending images:', error);
    }
}

async function approveImage(imageId) {
    try {
        await apiRequest('approve-image', { id: imageId });
        showAlert('profileAlert', 'Imagen aprobada correctamente', 'success');
        loadPendingImages();
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
    }
}

async function rejectImage(imageId) {
    try {
        await apiRequest('reject-image', { id: imageId });
        showAlert('profileAlert', 'Imagen rechazada', 'success');
        loadPendingImages();
    } catch (error) {
        showAlert('profileAlert', error.message, 'error');
    }
}


// Hacer funciones accesibles globalmente
window.approveImage = approveImage;
window.rejectImage = rejectImage;
window.toggleMessageDetail = toggleMessageDetail;
window.deleteMessage = deleteMessage;
window.loadAdminMessages = loadAdminMessages;
window.loadVotingResults = loadVotingResults;
window.debugVotingResults = debugVotingResults;