// Wallet JavaScript
class WalletManager {
    constructor() {
        this.currentTab = 'overview';
        this.balance = 0;
        this.transactions = [];
        this.paymentMethods = [];
        this.earnings = [];
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

        // Button event listeners
        this.initializeButtonHandlers();
        
        // Form submissions
        this.initializeFormHandlers();
        
        // Amount suggestions
        this.initializeAmountSuggestions();
    }

    initializeButtonHandlers() {
        const addMoneyBtn = document.getElementById('addMoneyBtn');
        const withdrawBtn = document.getElementById('withdrawBtn');
        const addPaymentMethodBtn = document.getElementById('addPaymentMethodBtn');
        const addNewPaymentBtn = document.getElementById('addNewPaymentBtn');
        const filterBtn = document.getElementById('filterBtn');

        if (addMoneyBtn) {
            addMoneyBtn.addEventListener('click', () => {
                this.showModal('addMoneyModal');
            });
        }

        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => {
                this.showModal('withdrawModal');
                this.updateAvailableBalance();
            });
        }

        if (addPaymentMethodBtn) {
            addPaymentMethodBtn.addEventListener('click', () => {
                this.showModal('addPaymentMethodModal');
            });
        }

        if (addNewPaymentBtn) {
            addNewPaymentBtn.addEventListener('click', () => {
                this.showModal('addPaymentMethodModal');
            });
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.filterTransactions();
            });
        }

        // Cancel buttons
        const cancelButtons = document.querySelectorAll('[id*="cancel"]');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    initializeFormHandlers() {
        // Add money form
        const addMoneyForm = document.getElementById('addMoneyForm');
        if (addMoneyForm) {
            addMoneyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMoney();
            });
        }

        // Withdraw form
        const withdrawForm = document.getElementById('withdrawForm');
        if (withdrawForm) {
            withdrawForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.withdrawMoney();
            });
        }

        // Add payment method form
        const addPaymentMethodForm = document.getElementById('addPaymentMethodForm');
        if (addPaymentMethodForm) {
            addPaymentMethodForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPaymentMethod();
            });
        }

        // Payment method type change
        const methodType = document.getElementById('methodType');
        if (methodType) {
            methodType.addEventListener('change', (e) => {
                this.togglePaymentMethodFields(e.target.value);
            });
        }
    }

    initializeAmountSuggestions() {
        const amountBtns = document.querySelectorAll('.amount-btn');
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.dataset.amount;
                document.getElementById('amount').value = amount;
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
            await this.loadBalance();
            await this.loadTransactions();
            await this.loadPaymentMethods();
            await this.loadEarnings();
            await this.loadStats();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading wallet data', 'error');
        }
    }

    async loadBalance() {
        try {
            const response = await fetch('/api/wallet/balance', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.balance = data.balance;
                this.updateBalanceDisplay();
            }
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    }

    updateBalanceDisplay() {
        const balanceElements = document.querySelectorAll('#mainBalance, #availableBalance');
        balanceElements.forEach(element => {
            if (element) {
                element.textContent = `₹${this.balance.toFixed(2)}`;
            }
        });

        const walletBalanceNav = document.getElementById('walletBalance');
        if (walletBalanceNav) {
            walletBalanceNav.textContent = `₹${this.balance.toFixed(2)}`;
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/wallet/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            totalDeposits: document.getElementById('totalDeposits'),
            totalEarnings: document.getElementById('totalEarnings'),
            totalWithdrawn: document.getElementById('totalWithdrawn'),
            monthlyEarnings: document.getElementById('monthlyEarnings')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key] && stats[key] !== undefined) {
                elements[key].textContent = `₹${stats[key].toFixed(2)}`;
            }
        });
    }

    async loadTransactions() {
        try {
            const response = await fetch('/api/wallet/transactions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.transactions = await response.json();
                this.renderTransactions();
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    renderTransactions(filteredTransactions = null) {
        const transactionsList = document.getElementById('transactionsList');
        if (!transactionsList) return;

        const transactionsToShow = filteredTransactions || this.transactions;

        if (transactionsToShow.length === 0) {
            transactionsList.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No transactions found.</p>';
            return;
        }

        transactionsList.innerHTML = transactionsToShow.map(transaction => {
            const isPositive = transaction.amount > 0;
            const amountClass = isPositive ? 'positive' : 'negative';
            const amountSign = isPositive ? '+' : '-';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type">${transaction.type}</div>
                        <div class="transaction-date">${new Date(transaction.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign}₹${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadPaymentMethods() {
        try {
            const response = await fetch('/api/wallet/payment-methods', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.paymentMethods = await response.json();
                this.renderPaymentMethods();
                this.updateBankAccountSelect();
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    }

    renderPaymentMethods() {
        const paymentMethodsGrid = document.getElementById('paymentMethodsGrid');
        const paymentMethodsOverview = document.getElementById('paymentMethods');
        
        if (!paymentMethodsGrid && !paymentMethodsOverview) return;

        const methodsHTML = this.paymentMethods.map(method => `
            <div class="payment-method-card">
                <div class="payment-method-header">
                    <div class="payment-method-type">${method.type}</div>
                    <div class="payment-method-actions">
                        <button class="action-btn edit" onclick="walletManager.editPaymentMethod(${method.id})">Edit</button>
                        <button class="action-btn delete" onclick="walletManager.deletePaymentMethod(${method.id})">Delete</button>
                    </div>
                </div>
                <div class="payment-method-info">
                    ${this.getPaymentMethodInfo(method)}
                </div>
            </div>
        `).join('');

        if (paymentMethodsGrid) {
            paymentMethodsGrid.innerHTML = methodsHTML;
        }

        if (paymentMethodsOverview) {
            paymentMethodsOverview.innerHTML = methodsHTML;
        }
    }

    getPaymentMethodInfo(method) {
        switch (method.type) {
            case 'bank':
                return `
                    <div>Bank: ${method.bank_name}</div>
                    <div>Account: ****${method.account_number.slice(-4)}</div>
                    <div>IFSC: ${method.ifsc_code}</div>
                `;
            case 'upi':
                return `<div>UPI ID: ${method.upi_id}</div>`;
            case 'card':
                return `
                    <div>Card: ****${method.card_number.slice(-4)}</div>
                    <div>Expires: ${method.expiry_date}</div>
                `;
            default:
                return '<div>Payment method details</div>';
        }
    }

    updateBankAccountSelect() {
        const bankAccountSelect = document.getElementById('bankAccount');
        if (!bankAccountSelect) return;

        const bankAccounts = this.paymentMethods.filter(method => method.type === 'bank');
        
        bankAccountSelect.innerHTML = '<option value="">Select Bank Account</option>' + 
            bankAccounts.map(account => `
                <option value="${account.id}">${account.bank_name} - ****${account.account_number.slice(-4)}</option>
            `).join('');
    }

    async loadEarnings() {
        try {
            const response = await fetch('/api/wallet/earnings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.earnings = await response.json();
                this.renderEarnings();
            }
        } catch (error) {
            console.error('Error loading earnings:', error);
        }
    }

    renderEarnings() {
        const earningsList = document.getElementById('earningsList');
        if (!earningsList) return;

        if (this.earnings.length === 0) {
            earningsList.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No earnings found.</p>';
            return;
        }

        earningsList.innerHTML = this.earnings.map(earning => `
            <div class="earning-item">
                <div class="earning-info">
                    <div class="earning-tournament">${earning.tournament_name}</div>
                    <div class="earning-game">${earning.game}</div>
                    <div class="earning-date">${new Date(earning.created_at).toLocaleDateString()}</div>
                </div>
                <div class="earning-amount">
                    +₹${earning.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadStats();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'payments':
                this.loadPaymentMethods();
                break;
            case 'earnings':
                this.loadEarnings();
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

    updateAvailableBalance() {
        const availableBalance = document.getElementById('availableBalance');
        if (availableBalance) {
            availableBalance.textContent = `₹${this.balance.toFixed(2)}`;
        }
    }

    togglePaymentMethodFields(methodType) {
        const bankFields = document.getElementById('bankFields');
        const upiFields = document.getElementById('upiFields');
        const cardFields = document.getElementById('cardFields');

        // Hide all fields
        [bankFields, upiFields, cardFields].forEach(field => {
            if (field) field.style.display = 'none';
        });

        // Show relevant fields
        switch (methodType) {
            case 'bank':
                if (bankFields) bankFields.style.display = 'block';
                break;
            case 'upi':
                if (upiFields) upiFields.style.display = 'block';
                break;
            case 'card':
                if (cardFields) cardFields.style.display = 'block';
                break;
        }
    }

    // Transaction functions
    async addMoney() {
        const form = document.getElementById('addMoneyForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/wallet/add-money', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('Money added successfully', 'success');
                this.closeModal('addMoneyModal');
                this.loadBalance();
                this.loadTransactions();
                form.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.detail || 'Failed to add money', 'error');
            }
        } catch (error) {
            console.error('Error adding money:', error);
            this.showNotification('Error adding money', 'error');
        }
    }

    async withdrawMoney() {
        const form = document.getElementById('withdrawForm');
        const formData = new FormData(form);
        const amount = parseFloat(formData.get('withdrawAmount'));
        
        if (amount > this.balance) {
            this.showNotification('Insufficient balance', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('Withdrawal request submitted', 'success');
                this.closeModal('withdrawModal');
                this.loadBalance();
                this.loadTransactions();
                form.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.detail || 'Failed to process withdrawal', 'error');
            }
        } catch (error) {
            console.error('Error withdrawing money:', error);
            this.showNotification('Error processing withdrawal', 'error');
        }
    }

    async addPaymentMethod() {
        const form = document.getElementById('addPaymentMethodForm');
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/wallet/payment-methods', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showNotification('Payment method added successfully', 'success');
                this.closeModal('addPaymentMethodModal');
                this.loadPaymentMethods();
                form.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.detail || 'Failed to add payment method', 'error');
            }
        } catch (error) {
            console.error('Error adding payment method:', error);
            this.showNotification('Error adding payment method', 'error');
        }
    }

    async deletePaymentMethod(methodId) {
        if (!confirm('Are you sure you want to delete this payment method?')) return;
        
        try {
            const response = await fetch(`/api/wallet/payment-methods/${methodId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Payment method deleted successfully', 'success');
                this.loadPaymentMethods();
            } else {
                this.showNotification('Failed to delete payment method', 'error');
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            this.showNotification('Error deleting payment method', 'error');
        }
    }

    filterTransactions() {
        const filter = document.getElementById('transactionFilter').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        let filteredTransactions = this.transactions;

        if (filter !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => 
                transaction.type.toLowerCase().includes(filter.toLowerCase())
            );
        }

        if (fromDate) {
            filteredTransactions = filteredTransactions.filter(transaction => 
                new Date(transaction.created_at) >= new Date(fromDate)
            );
        }

        if (toDate) {
            filteredTransactions = filteredTransactions.filter(transaction => 
                new Date(transaction.created_at) <= new Date(toDate)
            );
        }

        this.renderTransactions(filteredTransactions);
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
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
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
