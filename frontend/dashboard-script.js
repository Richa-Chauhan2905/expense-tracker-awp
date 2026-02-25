// Global currency state
let currentCurrency = {
  code: 'USD',
  symbol: '$'
};

// Check authentication
if (!sessionStorage.getItem('isLoggedIn')) {
  window.location.href = 'auth.html';
}

// Set user info from session
document.addEventListener('DOMContentLoaded', function() {
  const userName = sessionStorage.getItem('userName') || 'User';
  document.getElementById('welcomeUser').textContent = `Welcome, ${userName}!`;
  
  // Load saved currency preference
  const savedCurrency = localStorage.getItem('preferredCurrency');
  if (savedCurrency) {
    currentCurrency = JSON.parse(savedCurrency);
    document.getElementById('currentCurrencyIcon').textContent = currentCurrency.symbol;
  }
  
  // Initialize page
  initializeSidebar();
  initializeCurrencySelector();
  loadDashboardData();
  loadRecentExpenses();
  
  // Set today's date for expense form
  const today = new Date().toISOString().split('T')[0];
  const expenseDate = document.getElementById('expenseDate');
  if (expenseDate) expenseDate.value = today;
  
  // Expense form submission
  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addExpense();
    });
  }
  
  // Budget button handlers
  setupBudgetHandlers();
});

// Sidebar functionality
function initializeSidebar() {
  const burgerMenu = document.getElementById('burgerMenu');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  const overlay = document.getElementById('overlay');
  
  if (burgerMenu) {
    burgerMenu.addEventListener('click', function() {
      sidebar.classList.add('open');
      overlay.classList.add('show');
    });
  }
  
  if (closeSidebar) {
    closeSidebar.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
  
  // Set active nav item based on current page
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage) {
      item.classList.add('active');
    }
  });
}

// Currency selector
function initializeCurrencySelector() {
  const currencyBtn = document.getElementById('currencyIconBtn');
  const currencyDialog = document.getElementById('currencyDialog');
  const closeCurrencyBtn = document.getElementById('closeCurrencyDialog');
  const overlay = document.getElementById('overlay');
  
  if (currencyBtn) {
    currencyBtn.addEventListener('click', function() {
      currencyDialog.classList.add('show');
      overlay.classList.add('show');
    });
  }
  
  if (closeCurrencyBtn) {
    closeCurrencyBtn.addEventListener('click', function() {
      currencyDialog.classList.remove('show');
      overlay.classList.remove('show');
    });
  }
  
  // Currency selection
  document.querySelectorAll('.currency-option').forEach(option => {
    option.addEventListener('click', function() {
      const currency = this.dataset.currency;
      const symbol = this.dataset.symbol;
      
      currentCurrency = { code: currency, symbol: symbol };
      
      // Update display
      document.getElementById('currentCurrencyIcon').textContent = symbol;
      
      // Save to localStorage
      localStorage.setItem('preferredCurrency', JSON.stringify(currentCurrency));
      
      // Update all currency displays
      updateAllCurrencyDisplays();
      
      // Close dialog
      currencyDialog.classList.remove('show');
      overlay.classList.remove('show');
      
      // Show selected state
      document.querySelectorAll('.currency-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
      
      showNotification(`Currency changed to ${currency}`, 'success');
    });
  });
}

// Update all currency displays
function updateAllCurrencyDisplays() {
  // Update summary cards
  const amounts = document.querySelectorAll('.amount');
  amounts.forEach(el => {
    const value = el.dataset.originalValue;
    if (value) {
      el.textContent = formatCurrency(parseFloat(value));
    }
  });
  
  // Dispatch event for other pages
  window.dispatchEvent(new CustomEvent('currencyChanged', { 
    detail: currentCurrency 
  }));
}

// Budget handlers
function setupBudgetHandlers() {
  const editBudgetBtn = document.getElementById('editBudgetBtn');
  const saveBudgetBtn = document.getElementById('saveBudgetBtn');
  const cancelBudgetBtn = document.getElementById('cancelBudgetBtn');
  
  if (editBudgetBtn) {
    editBudgetBtn.addEventListener('click', function() {
      document.getElementById('budgetDisplay').style.display = 'none';
      document.getElementById('budgetForm').style.display = 'block';
      const currentBudget = document.getElementById('monthlyBudget').textContent;
      document.getElementById('budgetInput').value = parseFloat(currentBudget.replace(/[^0-9.-]+/g, ''));
    });
  }
  
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', saveBudget);
  }
  
  if (cancelBudgetBtn) {
    cancelBudgetBtn.addEventListener('click', function() {
      document.getElementById('budgetDisplay').style.display = 'flex';
      document.getElementById('budgetForm').style.display = 'none';
    });
  }
}

// Load dashboard data
function loadDashboardData() {
  // Simulate API call with mock data
  setTimeout(() => {
    const mockData = {
      thisMonthTotal: 1250.75,
      lastMonthTotal: 980.50,
      monthlyBudget: 2000
    };
    
    // Store original values
    document.getElementById('thisMonthTotal').dataset.originalValue = mockData.thisMonthTotal;
    document.getElementById('lastMonthTotal').dataset.originalValue = mockData.lastMonthTotal;
    document.getElementById('monthlyBudget').dataset.originalValue = mockData.monthlyBudget;
    
    // Display with currency
    document.getElementById('thisMonthTotal').textContent = formatCurrency(mockData.thisMonthTotal);
    document.getElementById('lastMonthTotal').textContent = formatCurrency(mockData.lastMonthTotal);
    document.getElementById('monthlyBudget').textContent = formatCurrency(mockData.monthlyBudget);
    
    if (mockData.monthlyBudget > 0) {
      updateBudgetProgress(mockData.thisMonthTotal, mockData.monthlyBudget);
    }
  }, 500);
}

// Load recent expenses
function loadRecentExpenses() {
  // Simulate API call with mock data
  setTimeout(() => {
    const mockExpenses = [
      { date: '2024-02-25', category: 'food', description: 'Lunch with team', amount: 45.50 },
      { date: '2024-02-24', category: 'transport', description: 'Uber ride', amount: 25.00 },
      { date: '2024-02-24', category: 'shopping', description: 'New headphones', amount: 89.99 },
      { date: '2024-02-23', category: 'groceries', description: 'Weekly groceries', amount: 120.35 },
      { date: '2024-02-23', category: 'entertainment', description: 'Movie tickets', amount: 32.00 }
    ];
    
    displayRecentExpenses(mockExpenses);
  }, 500);
}

// Display recent expenses
function displayRecentExpenses(expenses) {
  const container = document.getElementById('recentExpensesList');
  
  if (!container) return;
  
  if (expenses.length === 0) {
    container.innerHTML = '<div class="no-expenses">No recent expenses found</div>';
    return;
  }
  
  let html = '';
  expenses.forEach(expense => {
    html += `
      <div class="recent-expense-item">
        <div class="expense-date">${formatDate(expense.date)}</div>
        <div class="expense-category">
          <span class="category-badge category-${expense.category}">
            ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
          </span>
        </div>
        <div class="expense-description">${expense.description}</div>
        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Add expense
function addExpense() {
  const expenseData = {
    date: document.getElementById('expenseDate').value,
    category: document.getElementById('expenseCategory').value,
    description: document.getElementById('expenseItem').value,
    amount: parseFloat(document.getElementById('expenseAmount').value)
  };
  
  // Validate
  if (!expenseData.date || !expenseData.category || !expenseData.description || !expenseData.amount) {
    showNotification('Please fill all fields', 'error');
    return;
  }
  
  // Simulate API call
  setTimeout(() => {
    showNotification('Expense added successfully!', 'success');
    
    // Reset form
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // Reload data
    loadDashboardData();
    loadRecentExpenses();
  }, 500);
}

// Save budget
function saveBudget() {
  const budget = parseFloat(document.getElementById('budgetInput').value);
  
  if (!budget || budget <= 0) {
    showNotification('Please enter a valid budget', 'error');
    return;
  }
  
  // Simulate API call
  setTimeout(() => {
    document.getElementById('monthlyBudget').dataset.originalValue = budget;
    document.getElementById('monthlyBudget').textContent = formatCurrency(budget);
    document.getElementById('budgetDisplay').style.display = 'flex';
    document.getElementById('budgetForm').style.display = 'none';
    
    const thisMonthTotal = parseFloat(document.getElementById('thisMonthTotal').dataset.originalValue || 0);
    updateBudgetProgress(thisMonthTotal, budget);
    
    showNotification('Budget saved successfully!', 'success');
  }, 500);
}

// Update budget progress
function updateBudgetProgress(spent, budget) {
  if (budget > 0) {
    const percentage = (spent / budget) * 100;
    const progressBar = document.getElementById('budgetProgress');
    const status = document.getElementById('budgetStatus');
    
    progressBar.style.width = Math.min(percentage, 100) + '%';
    
    if (percentage > 100) {
      progressBar.style.background = '#ef4444';
      status.textContent = `Exceeded by ${formatCurrency(spent - budget)}`;
    } else {
      progressBar.style.background = '#10b981';
      status.textContent = `${formatCurrency(budget - spent)} remaining`;
    }
  }
}

// Format currency
function formatCurrency(amount) {
  return currentCurrency.symbol + parseFloat(amount).toFixed(2);
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
    window.location.href = 'auth.html';
  }
}

// Export functions for use in other pages
window.ExpenseTracker = {
  formatCurrency,
  updateBudgetProgress,
  showNotification,
  logout
};