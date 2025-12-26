// Server Status System for SIMBA.RP
class ServerStatus {
    constructor(config = {}) {
        this.config = {
            serverCode: config.serverCode || 'changeme', // Replace with actual server code
            updateInterval: config.updateInterval || 30000, // 30 seconds
            elementId: config.elementId || 'serverStatus',
            offlineText: config.offlineText || 'Server Offline',
            showPlayers: config.showPlayers !== false,
            showMaxPlayers: config.showMaxPlayers !== false,
            showQueue: config.showQueue !== false,
            showPing: config.showPing !== false,
            ...config
        };

        this.status = {
            online: false,
            players: 0,
            maxPlayers: 0,
            queue: 0,
            ping: 0,
            name: 'SIMBA.RP',
            lastUpdate: null,
            vars: {},
            resources: []
        };

        this.isFetching = false;
        this.init();
    }

    async init() {
        await this.updateStatus();
        
        // Auto-update interval
        this.interval = setInterval(() => this.updateStatus(), this.config.updateInterval);
        
        // Update when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateStatus();
            }
        });
        
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.render();
        });
    }

    async updateStatus() {
        if (this.isFetching) return;
        
        this.isFetching = true;
        
        try {
            const response = await fetch(
                `https://servers-frontend.fivem.net/api/servers/single/${this.config.serverCode}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    cache: 'no-cache'
                }
            );

            if (response.ok) {
                const data = await response.json();
                this.handleSuccess(data);
            } else {
                this.handleError('Server not responding');
            }
        } catch (error) {
            console.error('Server status fetch error:', error);
            this.handleError('Connection failed');
        } finally {
            this.isFetching = false;
        }
    }

    handleSuccess(data) {
        if (!data || !data.Data) {
            this.handleError('Invalid server data');
            return;
        }

        const serverData = data.Data;
        
        this.status = {
            online: true,
            players: serverData.clients || 0,
            maxPlayers: serverData.sv_maxclients || 0,
            queue: serverData.queue || 0,
            ping: serverData.ping || 0,
            name: serverData.hostname || 'SIMBA.RP',
            lastUpdate: new Date(),
            vars: serverData.vars || {},
            resources: serverData.resources || [],
            icon: serverData.icon || null
        };

        this.render();
        this.dispatchUpdateEvent();
        
        // Update player count on homepage
        this.updatePlayerCount();
    }

    handleError(message) {
        this.status = {
            online: false,
            players: 0,
            maxPlayers: 0,
            queue: 0,
            ping: 0,
            name: 'SIMBA.RP',
            lastUpdate: new Date(),
            vars: {},
            resources: []
        };

        this.render();
        console.warn('Server status error:', message);
    }

    render() {
        const element = document.getElementById(this.config.elementId);
        if (!element) return;

        const lang = localStorage.getItem('simbaRP_language') || 'en';
        
        if (this.status.online) {
            element.innerHTML = this.createOnlineHTML(lang);
        } else {
            element.innerHTML = this.createOfflineHTML(lang);
        }
    }

    createOnlineHTML(lang) {
        const translations = {
            en: {
                online: 'Online',
                players: 'Players',
                queue: 'Queue',
                ping: 'Ping',
                lastUpdated: 'Last updated'
            },
            ar: {
                online: 'متصل',
                players: 'لاعبين',
                queue: 'قائمة الانتظار',
                ping: 'البنج',
                lastUpdated: 'آخر تحديث'
            },
            es: {
                online: 'En Línea',
                players: 'Jugadores',
                queue: 'En Cola',
                ping: 'Ping',
                lastUpdated: 'Última actualización'
            }
        };

        const t = translations[lang] || translations.en;
        
        return `
            <div class="status-online">
                <div class="status-header">
                    <span class="status-indicator online"></span>
                    <span class="status-title">${t.online}</span>
                    <span class="server-name">${this.escapeHTML(this.status.name)}</span>
                </div>
                
                <div class="status-details">
                    ${this.config.showPlayers ? `
                    <div class="status-item">
                        <span class="status-label">${t.players}:</span>
                        <span class="status-value players">
                            ${this.status.players}${this.config.showMaxPlayers ? `/${this.status.maxPlayers}` : ''}
                        </span>
                    </div>
                    ` : ''}
                    
                    ${this.config.showQueue && this.status.queue > 0 ? `
                    <div class="status-item">
                        <span class="status-label">${t.queue}:</span>
                        <span class="status-value queue">${this.status.queue}</span>
                    </div>
                    ` : ''}
                    
                    ${this.config.showPing ? `
                    <div class="status-item">
                        <span class="status-label">${t.ping}:</span>
                        <span class="status-value ping">${this.status.ping}ms</span>
                    </div>
                    ` : ''}
                </div>
                
                ${this.status.lastUpdate ? `
                <div class="status-footer">
                    <span class="last-updated">
                        <i class="fas fa-sync-alt"></i>
                        ${t.lastUpdated}: ${this.formatTime(this.status.lastUpdate)}
                    </span>
                </div>
                ` : ''}
            </div>
        `;
    }

    createOfflineHTML(lang) {
        const translations = {
            en: {
                offline: 'Offline',
                retry: 'Retry',
                players: 'Players'
            },
            ar: {
                offline: 'غير متصل',
                retry: 'إعادة المحاولة',
                players: 'لاعبين'
            },
            es: {
                offline: 'Fuera de Línea',
                retry: 'Reintentar',
                players: 'Jugadores'
            }
        };

        const t = translations[lang] || translations.en;
        
        return `
            <div class="status-offline">
                <div class="status-header">
                    <span class="status-indicator offline"></span>
                    <span class="status-title">${t.offline}</span>
                </div>
                <div class="status-details">
                    <p>${this.config.offlineText}</p>
                    <button class="retry-btn" onclick="serverStatus.updateStatus()">
                        <i class="fas fa-redo"></i> ${t.retry}
                    </button>
                </div>
            </div>
        `;
    }

    updatePlayerCount() {
        const playerElement = document.getElementById('onlinePlayers');
        if (playerElement && this.status.online) {
            playerElement.textContent = this.status.players;
        }
    }

    formatTime(date) {
        if (!(date instanceof Date)) date = new Date(date);
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        const translations = {
            en: {
                justNow: 'Just now',
                minuteAgo: 'minute ago',
                minutesAgo: 'minutes ago'
            },
            ar: {
                justNow: 'الآن',
                minuteAgo: 'دقيقة مضت',
                minutesAgo: 'دقائق مضت'
            },
            es: {
                justNow: 'Ahora mismo',
                minuteAgo: 'minuto atrás',
                minutesAgo: 'minutos atrás'
            }
        };

        const lang = localStorage.getItem('simbaRP_language') || 'en';
        const t = translations[lang] || translations.en;
        
        if (diffMins < 1) return t.justNow;
        if (diffMins === 1) return `1 ${t.minuteAgo}`;
        if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    dispatchUpdateEvent() {
        const event = new CustomEvent('serverStatusUpdate', {
            detail: { ...this.status }
        });
        document.dispatchEvent(event);
    }

    // Public methods
    getStatus() {
        return { ...this.status };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.render();
    }

    setServerCode(code) {
        this.config.serverCode = code;
        this.updateStatus();
    }

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to initialize server status
    const statusElement = document.getElementById('serverStatus');
    
    if (statusElement) {
        // Create global instance
        window.serverStatus = new ServerStatus({
            serverCode: 'YOUR_SERVER_CODE_HERE', // Replace with actual code
            updateInterval: 30000
        });
        
        // Listen for updates
        document.addEventListener('serverStatusUpdate', function(event) {
            console.log('Server status updated:', event.detail);
            
            // Update any other elements that depend on server status
            if (event.detail.online) {
                // Server is online
                console.log(`Server: ${event.detail.players}/${event.detail.maxPlayers} players`);
            }
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerStatus;
}