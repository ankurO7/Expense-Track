// app.js - Main application logic

class ExpenseTracker {
    constructor() {
        this.expenses = this.loadExpenses();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderExpensesList();
        this.generateInsights();
        this.setCurrentDate();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Expense form
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Description input for AI suggestion
        document.getElementById('description').addEventListener('input', (e) => {
            this.showAISuggestion(e.target.value);
        });

        // File upload preview
        document.getElementById('receipt').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Search and filter
        document.getElementById('search').addEventListener('input', (e) => {
            this.filterExpenses();
        });

        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.filterExpenses();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update dashboard when switching to it
        if (tabName === 'dashboard') {
            setTimeout(() => this.updateDashboard(), 100);
        }
        
        // Generate insights when switching to insights tab
        if (tabName === 'insights') {
            this.generateInsights();
        }
    }

    showAISuggestion(description) {
        const suggestionDiv = document.getElementById('ai-suggestion');
        
        if (description.length > 3) {
            const suggestedCategory = categorizeExpense(description);
            const suggestionText = generateAISuggestion(description, suggestedCategory);
            
            suggestionDiv.textContent = suggestionText;
            suggestionDiv.classList.add('show');
            
            // Auto-select the suggested category
            document.getElementById('category').value = suggestedCategory;
        } else {
            suggestionDiv.classList.remove('show');
        }
    }

    handleFileUpload(file) {
        if (!file) return;
        
        const preview = document.getElementById('file-preview');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Receipt preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = `<p>File uploaded: ${file.name}</p>`;
        }
    }

    addExpense() {
        const form = document.getElementById('expense-form');
        const formData = new FormData(form);
        
        const expense = {
            id: Date.now().toString(),
            description: formData.get('description') || document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value,
            category: document.getElementById('category').value,
            receipt: document.getElementById('receipt').files[0] ? 'uploaded' : null,
            timestamp: new Date().toISOString()
        };

        // Validate expense
        if (!expense.description || !validateAmount(expense.amount) || !expense.date) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Add expense to array
        this.expenses.unshift(expense);
        this.saveExpenses();
        
        // Update UI
        this.updateDashboard();
        this.renderExpensesList();
        this.generateInsights();
        
        // Reset form and show success
        form.reset();
        document.getElementById('ai-suggestion').classList.remove('show');
        document.getElementById('file-preview').innerHTML = '';
        this.setCurrentDate();
        this.showNotification('Expense added successfully!', 'success');
        
        // Switch to dashboard
        this.switchTab('dashboard');
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
            this.updateDashboard();
            this.renderExpensesList();
            this.generateInsights();
            this.showNotification('Expense deleted', 'success');
        }
    }

    updateDashboard() {
        this.updateSummaryCards();
        this.updateCharts();
    }

    updateSummaryCards() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });

        const totalSpent = thisMonthExpenses.reduce((sum, expense) => 
            sum + parseFloat(expense.amount), 0);
        
        const totalTransactions = thisMonthExpenses.length;
        
        const categoryTotals = {};
        thisMonthExpenses.forEach(expense => {
            categoryTotals[expense.category] = 
                (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
        });
        
        const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b, 'other');

        // Update DOM
        document.getElementById('total-spent').textContent = formatCurrency(totalSpent);
        document.getElementById('total-transactions').textContent = totalTransactions;
        document.getElementById('top-category').textContent = 
            CATEGORY_NAMES[topCategory] || 'None';
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateTrendChart();
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }

        const categoryData = this.getCategoryData();
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.amounts,
                    backgroundColor: categoryData.colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    updateTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        const trendData = this.getTrendData();
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Daily Spending',
                    data: trendData.amounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    getCategoryData() {
        const categoryTotals = {};
        
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = 
                (categoryTotals[expense.category] || 0) + parseFloat(expense.amount);
        });

        const labels = [];
        const amounts = [];
        const colors = [];

        Object.entries(categoryTotals).forEach(([category, amount]) => {
            labels.push(CATEGORY_NAMES[category] || category);
            amounts.push(amount);
            colors.push(getCategoryColor(category));
        });

        return { labels, amounts, colors };
    }

    getTrendData() {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailyTotals = last7Days.map(date => {
            const dayExpenses = this.expenses.filter(expense => expense.date === date);
            return dayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        });

        const labels = last7Days.map(date => {
            return new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        });

        return { labels, amounts: dailyTotals };
    }

    renderExpensesList() {
        const container = document.getElementById('expenses-list');
        
        if (this.expenses.length === 0) {
            container.innerHTML = `
                <div class="no-expenses">
                    <i class="fas fa-receipt fa-3x"></i>
                    <h3>No expenses yet</h3>
                    <p>Start by adding your first expense!</p>
                </div>
            `;
            return;
        }

        const expensesHtml = this.expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-details">
                        <h4>${expense.description}</h4>
                        <div class="expense-meta">
                            ${formatDate(expense.date)}
                            <span class="expense-category">${CATEGORY_ICONS[expense.category]} ${CATEGORY_NAMES[expense.category]}</span>
                        </div>
                    </div>
                </div>
                <div class="expense-actions">
                    <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                    <button class="delete-btn" onclick="app.deleteExpense('${expense.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = expensesHtml;
    }

    filterExpenses() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        
        const filteredExpenses = this.expenses.filter(expense => {
            const matchesSearch = expense.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || expense.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Temporarily replace expenses for rendering
        const originalExpenses = this.expenses;
        this.expenses = filteredExpenses;
        this.renderExpensesList();
        this.expenses = originalExpenses;
    }

    generateInsights() {
        const insightsGenerator = new SmartInsights(this.expenses);
        const insights = insightsGenerator.generateInsights();
        
        const container = document.getElementById('insights-grid');
        
        const insightsHtml = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.content}</p>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = insightsHtml;
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Local Storage methods
    saveExpenses() {
        try {
            localStorage.setItem('expenseiq_expenses', JSON.stringify(this.expenses));
        } catch (error) {
            console.error('Failed to save expenses:', error);
            this.showNotification('Failed to save data', 'error');
        }
    }

    loadExpenses() {
        try {
            const saved = localStorage.getItem('expenseiq_expenses');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load expenses:', error);
            return [];
        }
    }

    // Export data
    exportData() {
        const data = {
            expenses: this.expenses,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenseiq_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.expenses && Array.isArray(data.expenses)) {
                    this.expenses = data.expenses;
                    this.saveExpenses();
                    this.updateDashboard();
                    this.renderExpensesList();
                    this.generateInsights();
                    this.showNotification('Data imported successfully!', 'success');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this.showNotification('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Add notification styles
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #667eea;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    z-index: 1000;
    max-width: 300px;
}

.notification.show {
    opacity: 1;
    transform: translateX(0);
}

.notification.success {
    border-left-color: #4CAF50;
}

.notification.error {
    border-left-color: #f44336;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification.success .notification-content i {
    color: #4CAF50;
}

.notification.error .notification-content i {
    color: #f44336;
}
</style>
`;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add notification styles
    document.head.insertAdjacentHTML('beforeend', notificationStyles);
    
    // Initialize app
    window.app = new ExpenseTracker();
    
    console.log('ExpenseIQ initialized successfully!');
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to add new expense
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        app.switchTab('add-expense');
        document.getElementById('description').focus();
    }
    
    // Ctrl/Cmd + D to go to dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        app.switchTab('dashboard');
    }
    
    // Escape to close any modal or clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('search');
        if (searchInput.value) {
            searchInput.value = '';
            app.filterExpenses();
        }
    }
});