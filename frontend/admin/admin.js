// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.users = [];
        this.tournaments = [];
        this.matches = [];
        this.initializeEventListeners();
        this.loadData();
    }

    initializeEventListeners() {
        // Tab navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Modal handling
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modal.id);
                });
            }
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Form submissions
        this.initializeFormHandlers();
        
        // Search functionality
        this.initializeSearchHandlers();
        
        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    initializeFormHandlers() {
        // User creation form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createUser();
            });
        }

        // Tournament creation form
        const createTournamentForm = document.getElementById('createTournamentForm');
        if (createTournamentForm) {
            createTournamentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTournament();
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    initializeSearchHandlers() {
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, e.target.dataset.type);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    async loadData() {
        try {
            await this.loadDashboardStats();
            await this.loadUsers();
            await this.loadTournaments();
            await this.loadMatches();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading data', 'error');
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.updateDashboardStats(stats);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalTournaments').textContent = stats.totalTournaments || 0;
        document.getElementById('activeTournaments').textContent = stats.activeTournaments || 0;
        document.getElementById('totalMatches').textContent = stats.totalMatches || 0;
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.users = await response.json();
                this.renderUsersTable();
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="status ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="adminPanel.viewUser(${user.id})">View</button>
                    <button class="action-btn edit" onclick="adminPanel.editUser(${user.id})">Edit</button>
                    <button class="action-btn delete" onclick="adminPanel.deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async loadTournaments() {
        try {
            const response = await fetch('/api/admin/tournaments', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.tournaments = await response.json();
                this.renderTournamentsTable();
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        }
    }

    renderTournamentsTable() {
        const tbody = document.getElementById('tournamentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.tournaments.map(tournament => `
            <tr>
                <td>${tournament.id}</td>
                <td>${tournament.name}</td>
                <td>${tournament.game}</td>
                <td><span class="status ${tournament.status}">${tournament.status}</span></td>
                <td>${tournament.participants_count || 0}</td>
                <td>${new Date(tournament.start_date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="adminPanel.viewTournament(${tournament.id})">View</button>
                    <button class="action-btn edit" onclick="adminPanel.editTournament(${tournament.id})">Edit</button>
                    <button class="action-btn delete" onclick="adminPanel.deleteTournament(${tournament.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async loadMatches() {
        try {
            const response = await fetch('/api/admin/matches', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.matches = await response.json();
                this.renderMatchesTable();
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        }
    }

    renderMatchesTable() {
        const tbody = document.getElementById('matchesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.matches.map(match => `
            <tr>
                <td>${match.id}</td>
                <td>${match.tournament_name}</td>
                <td>${match.team1_name} vs ${match.team2_name}</td>
                <td><span class="status ${match.status}">${match.status}</span></td>
                <td>${new Date(match.scheduled_time).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="adminPanel.viewMatch(${match.id})">View</button>
                    <button class="action-btn edit" onclick="adminPanel.editMatch(${match.id})">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'tournaments':
                this.loadTournaments();
                break;
            case 'matches':
                this.loadMatches();
                break;
        }
    }

    // Modal functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // User management
    async createUser() {
        const form = document.getElementById('createUserForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('User created successfully', 'success');
                this.closeModal('createUserModal');
                this.loadUsers();
                form.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.detail || 'Failed to create user', 'error');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showNotification('Error creating user', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.showNotification('User deleted successfully', 'success');
                this.loadUsers();
            } else {
                this.showNotification('Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Error deleting user', 'error');
        }
    }

    // Tournament management
    async createTournament() {
        const form = document.getElementById('createTournamentForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/admin/tournaments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('Tournament created successfully', 'success');
                this.closeModal('createTournamentModal');
                this.loadTournaments();
                form.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.detail || 'Failed to create tournament', 'error');
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            this.showNotification('Error creating tournament', 'error');
        }
    }

    async deleteTournament(tournamentId) {
        if (!confirm('Are you sure you want to delete this tournament?')) return;
        
        try {
            const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Tournament deleted successfully', 'success');
                this.loadTournaments();
            } else {
                this.showNotification('Failed to delete tournament', 'error');
            }
        } catch (error) {
            console.error('Error deleting tournament:', error);
            this.showNotification('Error deleting tournament', 'error');
        }
    }

    // Search functionality
    handleSearch(query, type) {
        const normalizedQuery = query.toLowerCase();
        
        switch (type) {
            case 'users':
                const filteredUsers = this.users.filter(user => 
                    user.username.toLowerCase().includes(normalizedQuery) ||
                    user.email.toLowerCase().includes(normalizedQuery)
                );
                this.renderFilteredUsers(filteredUsers);
                break;
            case 'tournaments':
                const filteredTournaments = this.tournaments.filter(tournament => 
                    tournament.name.toLowerCase().includes(normalizedQuery) ||
                    tournament.game.toLowerCase().includes(normalizedQuery)
                );
                this.renderFilteredTournaments(filteredTournaments);
                break;
        }
    }

    renderFilteredUsers(filteredUsers) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="status ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="adminPanel.viewUser(${user.id})">View</button>
                    <button class="action-btn edit" onclick="adminPanel.editUser(${user.id})">Edit</button>
                    <button class="action-btn delete" onclick="adminPanel.deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderFilteredTournaments(filteredTournaments) {
        const tbody = document.getElementById('tournamentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = filteredTournaments.map(tournament => `
            <tr>
                <td>${tournament.id}</td>
                <td>${tournament.name}</td>
                <td>${tournament.game}</td>
                <td><span class="status ${tournament.status}">${tournament.status}</span></td>
                <td>${tournament.participants_count || 0}</td>
                <td>${new Date(tournament.start_date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="adminPanel.viewTournament(${tournament.id})">View</button>
                    <button class="action-btn edit" onclick="adminPanel.editTournament(${tournament.id})">Edit</button>
                    <button class="action-btn delete" onclick="adminPanel.deleteTournament(${tournament.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Settings
    async saveSettings() {
        const form = document.getElementById('settingsForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('Settings saved successfully', 'success');
            } else {
                this.showNotification('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    // Utility functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/frontend/login/login.html';
        } catch (error) {
            console.error('Error logging out:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/frontend/login/login.html';
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification.success {
        background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
    }
    
    .notification.error {
        background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    }
    
    .notification.info {
        background: linear-gradient(135deg, #00ffff 0%, #0099cc 100%);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
