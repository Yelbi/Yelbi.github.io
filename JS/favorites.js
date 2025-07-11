class FavoritesManager {
    constructor() {
        this.favoriteIds = new Set();
        this.isAuthenticated = false;
        this.init();
    }

async init() {
    this.isAuthenticated = await this.checkAuthentication();
    if (this.isAuthenticated) {
        try {
            await this.loadFavoriteIds();
            this.setupFavoriteButtons();
        } catch (error) {
            console.error('Error loading favorites:', error);
            // Manejar error de token expirado
            if (error.message.includes('401') || error.message.includes('token')) {
                this.showSessionExpired();
            }
        }
    }
}

    async checkAuthentication() {
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        return token !== null;
    }

    async loadFavoriteIds() {
        try {
            // Usar GET para esta acción
            const response = await this.apiRequest('get-favorite-ids', {}, 'GET');
            this.favoriteIds = new Set(response.favorite_ids);
            this.updateFavoriteButtons();
        } catch (error) {
            console.error('Error loading favorite IDs:', error);
        }
    }

    setupFavoriteButtons() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const serId = this.getSerIdFromCard(card);
            if (serId) {
                this.addFavoriteButton(card, serId);
            }
        });
    }

    getSerIdFromCard(card) {
        return card.getAttribute('data-ser-id');
    }

    addFavoriteButton(card, serId) {
        if (card.querySelector('.favorite-btn')) return;

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.setAttribute('data-ser-id', serId);
        favoriteBtn.innerHTML = '<i class="fi fi-rr-heart"></i>';
        favoriteBtn.title = 'Añadir a favoritos';
        
        favoriteBtn.addEventListener('click', (e) => this.handleFavoriteClick(e, serId));
        card.appendChild(favoriteBtn);
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            const serId = btn.getAttribute('data-ser-id');
            const isFavorite = this.favoriteIds.has(parseInt(serId));
            
            btn.classList.toggle('active', isFavorite);
            btn.innerHTML = isFavorite ? '<i class="fi fi-sr-heart"></i>' : '<i class="fi fi-rr-heart"></i>';
            btn.title = isFavorite ? 'Remover de favoritos' : 'Añadir a favoritos';
        });
    }

    async handleFavoriteClick(event, serId) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.isAuthenticated) {
            this.showLoginPrompt();
            return;
        }

        const button = event.currentTarget;
        const wasActive = button.classList.contains('active');
        
        button.classList.toggle('active');
        button.innerHTML = wasActive ? '<i class="fi fi-rr-heart"></i>' : '<i class="fi fi-sr-heart"></i>';
        
        try {
            if (wasActive) {
                await this.removeFavorite(serId);
                this.favoriteIds.delete(parseInt(serId));
            } else {
                await this.addFavorite(serId);
                this.favoriteIds.add(parseInt(serId));
            }
            this.updateFavoriteButtons();
        } catch (error) {
            console.error('Error updating favorite:', error);
            button.classList.toggle('active');
            button.innerHTML = wasActive ? '<i class="fi fi-sr-heart"></i>' : '<i class="fi fi-rr-heart"></i>';
        }
    }

    async addFavorite(serId) {
        return await this.apiRequest('add-favorite', { ser_id: serId });
    }

    async removeFavorite(serId) {
        return await this.apiRequest('remove-favorite', { ser_id: serId });
    }

    async loadUserFavorites() {
        try {
            const language = document.documentElement.lang || 'es';
            // Usar GET para esta acción con parámetros en URL
            const response = await this.apiRequest('get-favorites', { lang: language }, 'GET');
            return response.favorites || [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    showLoginPrompt() {
        if (confirm('Para guardar favoritos necesitas iniciar sesión. ¿Quieres ir a la página de login?')) {
            window.location.href = '/iniciar.php';
        }
    }

async apiRequest(action, data = {}, method = 'GET') {
    const API_BASE_URL = 'https://seres.blog/api/auth.php';
    
    try {
        const headers = {};
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let url = `${API_BASE_URL}?action=${action}`;
        
        // Para GET: añadir parámetros a la URL
        if (method === 'GET' && Object.keys(data).length > 0) {
            const params = new URLSearchParams(data);
            url += `&${params.toString()}`;
        }
        
        const options = {
            method: method,
            headers: headers
        };
        
        // Para POST: añadir cuerpo
        if (method === 'POST') {
            options.body = JSON.stringify(data);
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, options);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Invalid response: ${text.slice(0, 100)}`);
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
}

document.addEventListener('DOMContentLoaded', () => {
    window.favoritesManager = new FavoritesManager();
});

async function renderFavorites() {
    const favoritesSection = document.querySelector('.favorites-section');
    if (!favoritesSection) return;

    try {
        const favorites = await window.favoritesManager.loadUserFavorites();
        
        if (favorites.length === 0) {
            favoritesSection.innerHTML = `
                <div class="section-header">
                    <div class="section-icon">
                        <i class="fi fi-rr-heart"></i>
                    </div>
                    <h2 class="section-title">Mis Favoritos</h2>
                </div>
                <div class="empty-favorites">
                    <i class="fi fi-rr-heart"></i>
                    <p>No tienes favoritos aún</p>
                    <a href="/galeria.php" class="btn">Explorar Seres</a>
                </div>
            `;
            return;
        }

        const favoritesHTML = favorites.map(ser => `
            <div class="favorite-item">
                <a href="/detalle.php?ser=${ser.slug}" class="favorite-link">
                    <img src="${ser.imagen}" alt="${ser.nombre}" loading="lazy">
                    <div class="favorite-info">
                        <h3>${ser.nombre}</h3>
                        <div class="favorite-badges">
                            <span class="badge">${ser.tipo}</span>
                            <span class="badge">${ser.region}</span>
                        </div>
                    </div>
                </a>
                <button class="remove-favorite-btn" data-ser-id="${ser.id}">
                    <i class="fi fi-rr-trash"></i>
                </button>
            </div>
        `).join('');

        favoritesSection.innerHTML = `
            <div class="section-header">
                <div class="section-icon">
                    <i class="fi fi-rr-heart"></i>
                </div>
                <h2 class="section-title">Mis Favoritos (${favorites.length})</h2>
            </div>
            <div class="favorites-grid">
                ${favoritesHTML}
            </div>
        `;

        const removeButtons = favoritesSection.querySelectorAll('.remove-favorite-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const serId = btn.getAttribute('data-ser-id');
                if (confirm('¿Estás seguro de que quieres remover este favorito?')) {
                    try {
                        await window.favoritesManager.removeFavorite(serId);
                        window.favoritesManager.favoriteIds.delete(parseInt(serId));
                        renderFavorites();
                    } catch (error) {
                        console.error('Error removing favorite:', error);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error rendering favorites:', error);
        favoritesSection.innerHTML = `
            <div class="section-header">
                <div class="section-icon">
                    <i class="fi fi-rr-heart"></i>
                </div>
                <h2 class="section-title">Mis Favoritos</h2>
            </div>
            <div class="error-message">
                <p>Error cargando favoritos</p>
            </div>
        `;
    }
}