// Admin Dashboard System for SIMBA.RP
class AdminDashboard {
    constructor() {
        this.config = {
            apiBaseUrl: '/api/admin', // Change to your actual API endpoint
            updateInterval: 60000, // 1 minute
            maxApplications: 50,
            maxActivities: 20
        };

        this.state = {
            applications: [],
            members: [],
            reports: [],
            activities: [],
            serverStats: null,
            isLoading: false
        };

        this.init();
    }

    async init() {
        // Load initial data
        await this.loadDashboardData();
        
        // Set up auto-refresh
        setInterval(() => this.loadDashboardData(), this.config.updateInterval);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize charts if needed
        this.initializeCharts();
    }

    async loadDashboardData() {
        if (this.state.isLoading) return;
        
        this.state.isLoading = true;
        this.showLoading(true);
        
        try {
            // Load all data in parallel
            const [applications, members, reports, activities, serverStats] = await Promise.all([
                this.fetchApplications(),
                this.fetchMembers(),
                this.fetchReports(),
                this.fetchActivities(),
                this.fetchServerStats()
            ]);

            this.state = {
                ...this.state,
                applications,
                members,
                reports,
                activities,
                serverStats
            };

            this.updateUI();
            this.showNotification('Dashboard updated successfully', 'success');
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to update dashboard', 'error');
        } finally {
            this.state.isLoading = false;
            this.showLoading(false);
        }
    }

    async fetchApplications() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const applications = [
                    {
                        id: 1,
                        discord: 'Alex_RP#1234',
                        age: 24,
                        experience: 'intermediate',
                        date: '2023-10-15',
                        status: 'pending',
                        character: 'Former military officer',
                        whyJoin: 'Looking for serious roleplay'
                    },
                    {
                        id: 2,
                        discord: 'Sarah_Gamer#5678',
                        age: 28,
                        experience: 'advanced',
                        date: '2023-10-14',
                        status: 'pending',
                        character: 'Business owner',
                        whyJoin: 'Professional roleplay community'
                    }
                ];
                resolve(applications);
            }, 500);
        });
    }

    async fetchMembers() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const members = Array.from({ length: 427 }, (_, i) => ({
                    id: i + 1,
                    name: `User${i}#${1000 + i}`,
                    joinDate: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0],
                    status: Math.random() > 0.3 ? 'active' : 'inactive',
                    warnings: Math.floor(Math.random() * 3)
                }));
                resolve(members);
            }, 500);
        });
    }

    async fetchReports() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const reports = [
                    { id: 1, type: 'rdm', reporter: 'User1#1234', reported: 'User2#5678', status: 'open' },
                    { id: 2, type: 'toxic', reporter: 'User3#9012', reported: 'User4#3456', status: 'investigating' },
                    { id: 3, type: 'exploit', reporter: 'User5#7890', reported: 'User6#1234', status: 'resolved' }
                ];
                resolve(reports);
            }, 500);
        });
    }

    async fetchActivities() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const activities = [
                    { id: 1, type: 'application_approved', user: 'Alex_RP#1234', timestamp: Date.now() - 120000 },
                    { id: 2, type: 'member_joined', user: 'Sarah_Gamer#5678', timestamp: Date.now() - 3600000 },
                    { id: 3, type: 'report_submitted', user: 'Mike_Flow#9012', timestamp: Date.now() - 7200000 }
                ];
                resolve(activities);
            }, 500);
        });
    }

    async fetchServerStats() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    players: 156,
                    maxPlayers: 200,
                    queue: 12,
                    uptime: 86400, // 24 hours in seconds
                    ping: 45,
                    online: true
                });
            }, 500);
        });
    }

    updateUI() {
        this.updateStats();
        this.updateApplicationsTable();
        this.updateActivitiesList();
        this.updateServerInfo();
    }

    updateStats() {
        // Update total members
        const totalMembers = this.state.members.length;
        document.getElementById('totalMembers')?.textContent = totalMembers.toLocaleString();
        document.getElementById('memberChange')?.textContent = '+12%';

        // Update online now
        const onlineNow = this.state.members.filter(m => m.status === 'active').length;
        document.getElementById('onlineNow')?.textContent = onlineNow.toLocaleString();
        document.getElementById('onlineChange')?.textContent = '+8%';

        // Update pending applications
        const pendingApps = this.state.applications.filter(app => app.status === 'pending').length;
        document.getElementById('pendingApps')?.textContent = pendingApps;
        document.getElementById('appChange')?.textContent = '-5%';

        // Update active reports
        const activeReports = this.state.reports.filter(r => r.status !== 'resolved').length;
        document.getElementById('activeReports')?.textContent = activeReports;
        document.getElementById('reportChange')?.textContent = '+2%';

        // Update pending count in sidebar
        const pendingCount = document.getElementById('pendingCount');
        if (pendingCount) {
            pendingCount.textContent = pendingApps;
            pendingCount.style.display = pendingApps > 0 ? 'flex' : 'none';
        }
    }

    updateApplicationsTable() {
        const tableBody = document.getElementById('applicationsTable');
        if (!tableBody) return;

        // Clear existing rows except loading row
        const loadingRow = tableBody.querySelector('.loading-row');
        tableBody.innerHTML = '';
        if (loadingRow) tableBody.appendChild(loadingRow);

        // Add application rows
        this.state.applications.slice(0, this.config.maxApplications).forEach(app => {
            const row = document.createElement('tr');
            
            // Format experience badge
            const experienceClass = app.experience === 'advanced' ? 'success' : 
                                  app.experience === 'intermediate' ? 'warning' : 'info';
            
            // Format status badge
            const statusClass = app.status === 'approved' ? 'success' :
                               app.status === 'rejected' ? 'danger' : 'warning';
            
            row.innerHTML = `
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${app.discord.charAt(0)}</div>
                        <div>
                            <strong>${app.discord}</strong>
                            <small>${app.character.substring(0, 30)}...</small>
                        </div>
                    </div>
                </td>
                <td>${app.age}</td>
                <td><span class="badge ${experienceClass}">${app.experience}</span></td>
                <td>${app.date}</td>
                <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view" title="View" onclick="adminDashboard.viewApplication(${app.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon approve" title="Approve" onclick="adminDashboard.approveApplication(${app.id})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject" title="Reject" onclick="adminDashboard.rejectApplication(${app.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.insertBefore(row, loadingRow);
        });

        // Hide loading row if we have data
        if (loadingRow && this.state.applications.length > 0) {
            loadingRow.style.display = 'none';
        }
    }

    updateActivitiesList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = '';

        this.state.activities.slice(0, this.config.maxActivities).forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            // Determine icon and color based on activity type
            let icon = 'fa-info-circle';
            let color = 'info';
            
            switch(activity.type) {
                case 'application_approved':
                    icon = 'fa-user-check';
                    color = 'success';
                    break;
                case 'application_rejected':
                    icon = 'fa-user-times';
                    color = 'danger';
                    break;
                case 'member_joined':
                    icon = 'fa-user-plus';
                    color = 'primary';
                    break;
                case 'report_submitted':
                    icon = 'fa-flag';
                    color = 'warning';
                    break;
                case 'warning_issued':
                    icon = 'fa-exclamation-triangle';
                    color = 'danger';
                    break;
            }
            
            // Format time
            const timeAgo = this.formatTimeAgo(activity.timestamp);
            
            item.innerHTML = `
                <div class="activity-icon ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${this.getActivityDescription(activity)}</p>
                    <small>${timeAgo}</small>
                </div>
            `;
            
            activityList.appendChild(item);
        });
    }

    updateServerInfo() {
        if (!this.state.serverStats) return;

        const stats = this.state.serverStats;
        
        // Update player count
        document.getElementById('serverPlayers')?.textContent = stats.players;
        document.getElementById('serverMaxPlayers')?.textContent = stats.maxPlayers;
        
        // Update queue
        document.getElementById('serverQueue')?.textContent = stats.queue;
        
        // Update uptime
        const uptimeElement = document.getElementById('serverUptime');
        if (uptimeElement) {
            const hours = Math.floor(stats.uptime / 3600);
            const minutes = Math.floor((stats.uptime % 3600) / 60);
            uptimeElement.textContent = `${hours}h ${minutes}m`;
        }
        
        // Update ping
        document.getElementById('serverPing')?.textContent = `${stats.ping}ms`;
        
        // Update status indicator
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            const statusDot = statusIndicator.querySelector('.status-dot');
            const statusText = statusIndicator.querySelector('span:last-child');
            
            if (stats.online) {
                statusDot.className = 'status-dot online';
                statusText.textContent = 'Online';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.textContent = 'Offline';
            }
        }
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadDashboardData();
        });

        // Quick actions
        document.querySelectorAll('.action-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Server controls
        document.querySelector('[data-action="restart-server"]')?.addEventListener('click', () => {
            this.restartServer();
        });

        document.querySelector('[data-action="send-announcement"]')?.addEventListener('click', () => {
            this.sendAnnouncement();
        });

        // Search functionality
        const searchInput = document.querySelector('.topbar-search input');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch(searchInput.value);
            });
        }
    }

    handleQuickAction(action) {
        switch(action) {
            case 'approve-all':
                this.approveAllPending();
                break;
                
            case 'export-data':
                this.exportData();
                break;
                
            case 'send-notification':
                this.openNotificationModal();
                break;
                
            case 'backup':
                this.createBackup();
                break;
                
            case 'clear-cache':
                this.clearCache();
                break;
                
            case 'maintenance':
                this.toggleMaintenance();
                break;
        }
    }

    async approveAllPending() {
        if (!confirm('Are you sure you want to approve all pending applications?')) return;
        
        const pendingApps = this.state.applications.filter(app => app.status === 'pending');
        
        try {
            this.showLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update local state
            pendingApps.forEach(app => {
                app.status = 'approved';
            });
            
            this.updateUI();
            this.showNotification(`Approved ${pendingApps.length} applications`, 'success');
            
        } catch (error) {
            this.showNotification('Failed to approve applications', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async approveApplication(id) {
        const app = this.state.applications.find(a => a.id === id);
        if (!app) return;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            app.status = 'approved';
            this.updateUI();
            
            // Add to activities
            this.state.activities.unshift({
                id: Date.now(),
                type: 'application_approved',
                user: app.discord,
                timestamp: Date.now()
            });
            
            this.showNotification(`Application from ${app.discord} approved`, 'success');
            
        } catch (error) {
            this.showNotification('Failed to approve application', 'error');
        }
    }

    async rejectApplication(id) {
        const app = this.state.applications.find(a => a.id === id);
        if (!app) return;
        
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            app.status = 'rejected';
            app.rejectionReason = reason;
            this.updateUI();
            
            // Add to activities
            this.state.activities.unshift({
                id: Date.now(),
                type: 'application_rejected',
                user: app.discord,
                timestamp: Date.now()
            });
            
            this.showNotification(`Application from ${app.discord} rejected`, 'warning');
            
        } catch (error) {
            this.showNotification('Failed to reject application', 'error');
        }
    }

    viewApplication(id) {
        const app = this.state.applications.find(a => a.id === id);
        if (!app) return;
        
        // Show application details in modal
        const modal = document.getElementById('applicationModal');
        const details = document.getElementById('applicationDetails');
        
        if (modal && details) {
            details.innerHTML = this.createApplicationDetailsHTML(app);
            modal.classList.add('show');
            
            // Set up modal buttons
            const approveBtn = modal.querySelector('[data-action="approve"]');
            const rejectBtn = modal.querySelector('[data-action="reject"]');
            const closeBtn = modal.querySelector('.modal-close');
            
            if (approveBtn) {
                approveBtn.onclick = () => {
                    this.approveApplication(id);
                    modal.classList.remove('show');
                };
            }
            
            if (rejectBtn) {
                rejectBtn.onclick = () => {
                    this.rejectApplication(id);
                    modal.classList.remove('show');
                };
            }
            
            if (closeBtn) {
                closeBtn.onclick = () => {
                    modal.classList.remove('show');
                };
            }
        }
    }

    createApplicationDetailsHTML(app) {
        return `
            <div class="application-details">
                <div class="detail-section">
                    <h4>Personal Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Discord:</span>
                            <span class="detail-value">${app.discord}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Age:</span>
                            <span class="detail-value">${app.age}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Experience:</span>
                            <span class="detail-value badge ${app.experience}">${app.experience}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Application Date:</span>
                            <span class="detail-value">${app.date}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-badge ${app.status}">${app.status}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Character Concept</h4>
                    <div class="detail-content">
                        <p>${app.character || 'No character description provided'}</p>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Why Join SIMBA.RP</h4>
                    <div class="detail-content">
                        <p>${app.whyJoin || 'No reason provided'}</p>
                    </div>
                </div>
                
                ${app.rejectionReason ? `
                <div class="detail-section warning">
                    <h4>Rejection Reason</h4>
                    <div class="detail-content">
                        <p>${app.rejectionReason}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    async exportData() {
        try {
            // Create data object
            const exportData = {
                timestamp: new Date().toISOString(),
                applications: this.state.applications,
                members: this.state.members,
                reports: this.state.reports,
                activities: this.state.activities
            };
            
            // Convert to JSON
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const downloadUrl = URL.createObjectURL(dataBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `simbarp-export-${Date.now()}.json`;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
            
            this.showNotification('Data exported successfully', 'success');
            
        } catch (error) {
            this.showNotification('Failed to export data', 'error');
        }
    }

    openNotificationModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.classList.add('show');
            
            // Clear previous values
            document.getElementById('notificationTitle').value = '';
            document.getElementById('notificationMessage').value = '';
            document.getElementById('notificationType').value = 'info';
        }
    }

    async sendAnnouncement() {
        const title = prompt('Enter announcement title:');
        if (!title) return;
        
        const message = prompt('Enter announcement message:');
        if (!message) return;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.showNotification('Announcement sent to all players', 'success');
            
        } catch (error) {
            this.showNotification('Failed to send announcement', 'error');
        }
    }

    async restartServer() {
        if (!confirm('Are you sure you want to restart the server? This will disconnect all players.')) return;
        
        try {
            this.showLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification('Server restart initiated', 'success');
            
            // Update server stats
            this.state.serverStats = {
                ...this.state.serverStats,
                players: 0,
                queue: 0,
                online: false
            };
            
            this.updateServerInfo();
            
            // Simulate server coming back online
            setTimeout(() => {
                this.state.serverStats = {
                    players: 0,
                    maxPlayers: 200,
                    queue: 0,
                    uptime: 0,
                    ping: 0,
                    online: true
                };
                this.updateServerInfo();
                this.showNotification('Server is back online', 'success');
            }, 10000);
            
        } catch (error) {
            this.showNotification('Failed to restart server', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async createBackup() {
        try {
            this.showLoading(true);
            
            // Simulate backup process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Database backup created successfully', 'success');
            
        } catch (error) {
            this.showNotification('Failed to create backup', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async clearCache() {
        if (!confirm('Are you sure you want to clear all cache? This may temporarily slow down the system.')) return;
        
        try {
            this.showLoading(true);
            
            // Simulate cache clearing
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.showNotification('Cache cleared successfully', 'success');
            
        } catch (error) {
            this.showNotification('Failed to clear cache', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async toggleMaintenance() {
        const isMaintenance = confirm('Enable maintenance mode? This will prevent new players from joining.');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const message = isMaintenance ? 
                'Maintenance mode enabled' : 
                'Maintenance mode disabled';
            
            this.showNotification(message, 'info');
            
        } catch (error) {
            this.showNotification('Failed to toggle maintenance mode', 'error');
        }
    }

    handleSearch(query) {
        if (!query.trim()) return;
        
        // Search through applications, members, and reports
        const results = {
            applications: this.state.applications.filter(app => 
                app.discord.toLowerCase().includes(query.toLowerCase()) ||
                app.character.toLowerCase().includes(query.toLowerCase())
            ),
            members: this.state.members.filter(member => 
                member.name.toLowerCase().includes(query.toLowerCase())
            ),
            reports: this.state.reports.filter(report => 
                report.reporter.toLowerCase().includes(query.toLowerCase()) ||
                report.reported.toLowerCase().includes(query.toLowerCase())
            )
        };
        
        // Show search results
        const totalResults = results.applications.length + results.members.length + results.reports.length;
        
        if (totalResults > 0) {
            this.showNotification(`Found ${totalResults} results for "${query}"`, 'info');
            
            // In a real app, you would show these results in a modal or separate page
            console.log('Search results:', results);
        } else {
            this.showNotification(`No results found for "${query}"`, 'warning');
        }
    }

    // Utility Methods
    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        
        const days = Math.floor(seconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    getActivityDescription(activity) {
        switch(activity.type) {
            case 'application_approved':
                return `Application from ${activity.user} was approved`;
            case 'application_rejected':
                return `Application from ${activity.user} was rejected`;
            case 'member_joined':
                return `${activity.user} joined the community`;
            case 'report_submitted':
                return `New report submitted by ${activity.user}`;
            case 'warning_issued':
                return `Warning issued to ${activity.user}`;
            default:
                return 'Activity recorded';
        }
    }

    showLoading(show) {
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.classList.toggle('refreshing', show);
            refreshBtn.disabled = show;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'exclamation-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    initializeCharts() {
        // Initialize any charts if needed
        // This is a placeholder for chart.js or similar integration
        console.log('Charts initialized');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
    
    // Set up notification modal
    const notificationModal = document.getElementById('notificationModal');
    if (notificationModal) {
        notificationModal.querySelector('[data-action="cancel"]').addEventListener('click', function() {
            notificationModal.classList.remove('show');
        });
        
        notificationModal.querySelector('[data-action="send"]').addEventListener('click', function() {
            const title = document.getElementById('notificationTitle').value;
            const message = document.getElementById('notificationMessage').value;
            
            if (title && message) {
                // Send notification
                adminDashboard.showNotification('Notification sent successfully', 'success');
                notificationModal.classList.remove('show');
            } else {
                adminDashboard.showNotification('Please fill in all fields', 'warning');
            }
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}