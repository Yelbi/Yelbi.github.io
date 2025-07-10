// JS/favorites.js - Nuevo archivo para manejo de favoritos

class FavoritesManager {
    constructor() {
        this.favoriteIds = new Set();
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        this.isAuthenticated = await this.checkAuthentication();
        if (this.isAuthenticated) {
            await this.loadFavoriteIds();
            this.setupFavoriteButtons();
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
        return token !== null;
    }

    async loadFavoriteIds() {
        try {
            const response = await this.apiRequest('get-favorite-ids', {}, 'GET');
            this.favoriteIds = new Set(response.favorite_ids);
            this.updateFavoriteButtons();
        } catch (error) {
            console.error('Error loading favorite IDs:', error);
        }
    }

    setupFavoriteButtons() {
        // Crear botones de favoritos para cada card
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const serId = this.getSerIdFromCard(card);
            if (serId) {
                this.addFavoriteButton(card, serId);
            }
        });
    }

    getSerIdFromCard(card) {
        // Extraer el ID del ser desde el href o data attribute
        const href = card.getAttribute('href');
        if (href) {
            const match = href.match(/ser=([^&]+)/);
            if (match) {
                return match[1]; // slug del ser
            }
        }
        return null;
    }

    addFavoriteButton(card, serSlug) {
        // Verificar si ya existe el botón
        if (card.querySelector('.favorite-btn')) {
            return;
        }

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.setAttribute('data-ser-slug', serSlug);
        favoriteBtn.innerHTML = '<i class="fi fi-rr-heart"></i>';
        favoriteBtn.title = 'Añadir a favoritos';
        
        // Añadir evento
        favoriteBtn.addEventListener('click', (e) => this.handleFavoriteClick(e, serSlug));
        
        // Insertar en la card
        card.appendChild(favoriteBtn);
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            const serSlug = btn.getAttribute('data-ser-slug');
            const isFavorite = this.favoriteIds.has(serSlug);
            
            btn.classList.toggle('active', isFavorite);
            btn.innerHTML = isFavorite ? '<i class="fi fi-sr-heart"></i>' : '<i class="fi fi-rr-heart"></i>';
            btn.title = isFavorite ? 'Remover de favoritos' : 'Añadir a favoritos';
        });
    }

    async handleFavoriteClick(event, serSlug) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.isAuthenticated) {
            this.showLoginPrompt();
            return;
        }

        const button = event.currentTarget;
        const wasActive = button.classList.contains('active');
        
        // Optimistic update
        button.classList.toggle('active');
        button.innerHTML = wasActive ? '<i class="fi fi-rr-heart"></i>' : '<i class="fi fi-sr-heart"></i>';
        
        try {
            // Obtener el ID numérico del ser
            const serId = await this.getSerIdFromSlug(serSlug);
            
            if (wasActive) {
                await this.removeFavorite(serId);
                this.favoriteIds.delete(serSlug);
            } else {
                await this.addFavorite(serId);
                this.favoriteIds.add(serSlug);
            }
            
            this.updateFavoriteButtons();
            
        } catch (error) {
            console.error('Error updating favorite:', error);
            // Revertir cambio optimista
            button.classList.toggle('active');
            button.innerHTML = wasActive ? '<i class="fi fi-sr-heart"></i>' : '<i class="fi fi-rr-heart"></i>';
        }
    }

    async getSerIdFromSlug(slug) {
        // Necesitarías un endpoint para convertir slug a ID
        // Por ahora, asumiré que tienes esta función en tu API
        try {
            const response = await this.apiRequest('get-ser-id', { slug }, 'POST');
            return response.id;
        } catch (error) {
            console.error('Error getting ser ID:', error);
            throw error;
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
            const response = await this.apiRequest('get-favorites', {}, 'GET');
            return response.favorites || [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    showLoginPrompt() {
        // Mostrar un modal o alert para invitar a iniciar sesión
        if (confirm('Para guardar favoritos necesitas iniciar sesión. ¿Quieres ir a la página de login?')) {
            window.location.href = '/iniciar.php';
        }
    }

    async apiRequest(action, data = {}, method = 'POST') {
        const API_BASE_URL = 'https://seres.blog/api/auth.php';
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Inicializar el gestor de favoritos
document.addEventListener('DOMContentLoaded', () => {
    window.favoritesManager = new FavoritesManager();
});

// Función para renderizar favoritos en el user panel
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
                <button class="remove-favorite-btn" data-ser-slug="${ser.slug}">
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

        // Añadir eventos a los botones de eliminar
        const removeButtons = favoritesSection.querySelectorAll('.remove-favorite-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const serSlug = btn.getAttribute('data-ser-slug');
                if (confirm('¿Estás seguro de que quieres remover este favorito?')) {
                    try {
                        const serId = await window.favoritesManager.getSerIdFromSlug(serSlug);
                        await window.favoritesManager.removeFavorite(serId);
                        window.favoritesManager.favoriteIds.delete(serSlug);
                        renderFavorites(); // Recargar la lista
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