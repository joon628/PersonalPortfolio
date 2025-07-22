// API Client for Portfolio Admin System
// Replaces localStorage with SQLite backend

class PortfolioAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.isAuthenticated = false;
        this.username = null;
    }

    // Make HTTP requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Include cookies for session
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(username, password) {
        try {
            const result = await this.request('/login', {
                method: 'POST',
                body: { username, password }
            });
            
            this.isAuthenticated = true;
            this.username = result.username;
            return result;
        } catch (error) {
            this.isAuthenticated = false;
            this.username = null;
            throw error;
        }
    }

    async logout() {
        try {
            const result = await this.request('/logout', {
                method: 'POST'
            });
            
            this.isAuthenticated = false;
            this.username = null;
            return result;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    async checkAuthStatus() {
        try {
            const result = await this.request('/auth/status');
            this.isAuthenticated = result.authenticated;
            this.username = result.username || null;
            return result;
        } catch (error) {
            this.isAuthenticated = false;
            this.username = null;
            return { authenticated: false };
        }
    }

    // Portfolio data methods
    async getPortfolioData() {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }
        
        return await this.request('/portfolio');
    }

    async getPublicPortfolioData() {
        return await this.request('/portfolio/public');
    }

    async savePortfolioData(data) {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }
        
        return await this.request('/portfolio', {
            method: 'POST',
            body: data
        });
    }

    // Utility methods
    async ping() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/status`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Create global instance
const portfolioAPI = new PortfolioAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioAPI;
}

// Make available globally
window.portfolioAPI = portfolioAPI;