// Create your AngularJS app
var app = angular.module("expenseApp", []);

app.controller("AuthController", function ($scope, $window) {
  var vm = this;

  // Login/Signup mode
  vm.isLogin = true;

  // Form data
  vm.loginData = {
    email: "",
    password: "",
  };

  vm.signupData = {
    fullName: "",
    email: "",
    phone: "",
    currencyPreference: "USD",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
  };

  // Currency options
  vm.currencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "INR",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "KRW",
  ];

  // Error/Success messages
  vm.error = "";
  vm.success = "";

  // Toggle between login and signup
  vm.toggleMode = function () {
    vm.isLogin = !vm.isLogin;
    vm.error = "";
    vm.success = "";
  };

  // Set specific mode
  vm.setMode = function (loginMode) {
    vm.isLogin = loginMode;
    vm.error = "";
    vm.success = "";
  };

  // LOGIN FUNCTION - WITH REDIRECT
  vm.login = function () {
    // Clear previous messages
    vm.error = "";
    vm.success = "";

    // For demo purposes - simulate successful login
    // In real app, you'd make an API call here

    if (vm.loginData.email && vm.loginData.password) {
      // Show success message
      vm.success = "Login successful! Redirecting...";

      // Store some user data in session/local storage (optional)
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userEmail", vm.loginData.email);

      // REDIRECT TO HOME PAGE AFTER 1 SECOND
      setTimeout(function () {
        $window.location.href = "home.html";
        // OR if using hash routing:
        // $window.location.href = '#/home';
      }, 1000);
    } else {
      vm.error = "Please fill in all fields";
    }
  };

  // SIGNUP FUNCTION
  vm.signup = function () {
    // Clear previous messages
    vm.error = "";
    vm.success = "";

    // Basic validation
    if (vm.signupData.password !== vm.signupData.confirmPassword) {
      vm.error = "Passwords do not match";
      return;
    }

    // For demo purposes - simulate successful signup
    if (
      vm.signupData.fullName &&
      vm.signupData.email &&
      vm.signupData.password
    ) {
      vm.success = "Account created successfully! Please login.";

      // Switch to login mode after 1.5 seconds
      setTimeout(function () {
        vm.setMode(true);
        $scope.$apply(); // Update AngularJS scope
      }, 1500);
    } else {
      vm.error = "Please fill in all required fields";
    }
  };
});

// Inside your existing app.js, add this controller

app.controller(
  "ManageExpensesController",
  function ($scope, $window, $timeout) {
    var vm = this;

    // User info
    vm.userName = sessionStorage.getItem("userName") || "User";

    // Sidebar state
    vm.sidebarOpen = false;
    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    // Currency data
    vm.currencies = [
      { code: "USD", symbol: "$", name: "USD - US Dollar" },
      { code: "EUR", symbol: "€", name: "EUR - Euro" },
      { code: "GBP", symbol: "£", name: "GBP - British Pound" },
      { code: "JPY", symbol: "¥", name: "JPY - Japanese Yen" },
      { code: "INR", symbol: "₹", name: "INR - Indian Rupee" },
      { code: "AUD", symbol: "A$", name: "AUD - Australian Dollar" },
      { code: "CAD", symbol: "C$", name: "CAD - Canadian Dollar" },
      { code: "SGD", symbol: "S$", name: "SGD - Singapore Dollar" },
    ];

    // Load saved currency or default
    var savedCurrency = localStorage.getItem("preferredCurrency");
    vm.currentCurrency = savedCurrency
      ? JSON.parse(savedCurrency)
      : vm.currencies[0];

    vm.showCurrencyDialog = false;
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      vm.currentCurrency = currency;
      localStorage.setItem("preferredCurrency", JSON.stringify(currency));
      vm.closeCurrencyDialog();
      // Trigger a $digest if needed (already in AngularJS context)
    };

    // Categories
    vm.categories = [
      { value: "food", label: "Food & Dining" },
      { value: "transport", label: "Transportation" },
      { value: "shopping", label: "Shopping" },
      { value: "entertainment", label: "Entertainment" },
      { value: "bills", label: "Bills & Utilities" },
      { value: "health", label: "Health & Medical" },
      { value: "education", label: "Education" },
      { value: "travel", label: "Travel" },
      { value: "groceries", label: "Groceries" },
      { value: "other", label: "Other" },
    ];

    // Mock expenses data
    vm.expenses = [
      {
        id: 1,
        date: "2024-02-25",
        category: "food",
        description: "Lunch with team",
        amount: 45.5,
        receipt: true,
      },
      {
        id: 2,
        date: "2024-02-24",
        category: "transport",
        description: "Uber ride",
        amount: 25.0,
        receipt: false,
      },
      {
        id: 3,
        date: "2024-02-24",
        category: "shopping",
        description: "New headphones",
        amount: 89.99,
        receipt: true,
      },
      {
        id: 4,
        date: "2024-02-23",
        category: "groceries",
        description: "Weekly groceries",
        amount: 120.35,
        receipt: true,
      },
      {
        id: 5,
        date: "2024-02-23",
        category: "entertainment",
        description: "Movie tickets",
        amount: 32.0,
        receipt: false,
      },
      {
        id: 6,
        date: "2024-02-22",
        category: "bills",
        description: "Electricity bill",
        amount: 85.2,
        receipt: true,
      },
      {
        id: 7,
        date: "2024-02-21",
        category: "health",
        description: "Pharmacy",
        amount: 45.8,
        receipt: true,
      },
      {
        id: 8,
        date: "2024-02-20",
        category: "education",
        description: "Online course",
        amount: 199.99,
        receipt: false,
      },
      {
        id: 9,
        date: "2024-02-19",
        category: "travel",
        description: "Gas",
        amount: 40.0,
        receipt: true,
      },
      {
        id: 10,
        date: "2024-02-18",
        category: "food",
        description: "Dinner",
        amount: 67.5,
        receipt: false,
      },
    ];

    // Filtering and pagination
    vm.filters = {
      category: "",
      month: "",
    };
    vm.filteredExpenses = [];
    vm.loading = false;
    vm.currentPage = 1;
    vm.itemsPerPage = 5;
    vm.totalPages = 1;
    vm.pages = [];

    // Initialize
    vm.filterExpenses = function () {
      vm.loading = true;
      // Simulate async
      $timeout(function () {
        var filtered = vm.expenses.filter(function (exp) {
          var matchCategory =
            !vm.filters.category || exp.category === vm.filters.category;
          var matchMonth =
            !vm.filters.month || exp.date.startsWith(vm.filters.month);
          return matchCategory && matchMonth;
        });
        // Sort by date descending
        filtered.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        vm.filteredExpenses = filtered;
        vm.totalPages =
          Math.ceil(vm.filteredExpenses.length / vm.itemsPerPage) || 1;
        vm.updatePagination();
        vm.goToPage(1);
        vm.loading = false;
      }, 300);
    };

    vm.updatePagination = function () {
      var pages = [];
      for (var i = 1; i <= vm.totalPages; i++) {
        pages.push(i);
      }
      vm.pages = pages;
    };

    vm.goToPage = function (page) {
      vm.currentPage = page;
    };

    vm.clearFilters = function () {
      vm.filters.category = "";
      vm.filters.month = "";
      vm.filterExpenses();
    };

    // Paginated expenses for display
    Object.defineProperty(vm, "paginatedExpenses", {
      get: function () {
        var start = (vm.currentPage - 1) * vm.itemsPerPage;
        var end = start + vm.itemsPerPage;
        return vm.filteredExpenses.slice(start, end);
      },
    });

    // Edit modal
    vm.showEditModal = false;
    vm.editExpense = {};

    vm.openEditModal = function (id) {
      var expense = vm.expenses.find(function (e) {
        return e.id === id;
      });
      if (expense) {
        vm.editExpense = angular.copy(expense);
        vm.showEditModal = true;
      }
    };

    vm.closeEditModal = function () {
      vm.showEditModal = false;
      vm.editExpense = {};
    };

    vm.saveEdit = function () {
      var index = vm.expenses.findIndex(function (e) {
        return e.id === vm.editExpense.id;
      });
      if (index !== -1) {
        vm.expenses[index] = angular.copy(vm.editExpense);
        vm.filterExpenses(); // Refresh list
        vm.showNotification("Expense updated successfully!", "success");
        vm.closeEditModal();
      }
    };

    // Delete modal
    vm.showDeleteModal = false;
    vm.deleteId = null;

    vm.openDeleteModal = function (id) {
      vm.deleteId = id;
      vm.showDeleteModal = true;
    };

    vm.closeDeleteModal = function () {
      vm.showDeleteModal = false;
      vm.deleteId = null;
    };

    vm.confirmDelete = function () {
      vm.expenses = vm.expenses.filter(function (e) {
        return e.id !== vm.deleteId;
      });
      vm.filterExpenses();
      vm.showNotification("Expense deleted successfully!", "success");
      vm.closeDeleteModal();
    };

    // View receipt
    vm.viewReceipt = function (id) {
      var expense = vm.expenses.find(function (e) {
        return e.id === id;
      });
      if (expense) {
        alert(
          "Viewing receipt for: " +
            expense.description +
            "\n(This would open the receipt in a real app.)",
        );
      }
    };

    // Format currency
    vm.formatCurrency = function (amount) {
      return vm.currentCurrency.symbol + parseFloat(amount).toFixed(2);
    };

    // Notification (simple)
    vm.showNotification = function (message, type) {
      // You can implement a proper notification service; for now, alert
      alert(message);
    };

    // Logout
    vm.logout = function () {
      if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        $window.location.href = "auth.html";
      }
    };

    // Close all modals when overlay clicked
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
      vm.closeEditModal();
      vm.closeDeleteModal();
    };

    // Initial load
    vm.filterExpenses();

    // Check authentication
    if (!sessionStorage.getItem("isLoggedIn")) {
      $window.location.href = "auth.html";
    }
  },
);

// Optional filter for capitalizing category names
app.filter("capitalize", function () {
  return function (input) {
    if (!input) return "";
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});

// Inside your existing app.js, add this controller and any necessary services/directives

app.controller(
  "HomeController",
  function ($scope, $window, $timeout, CurrencyService) {
    var vm = this;

    // User info
    vm.userName = sessionStorage.getItem("userName") || "User";

    // Sidebar
    vm.sidebarOpen = false;
    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    // Current page (for active nav)
    vm.currentPage = "home";

    // Currency (using service)
    vm.currencies = CurrencyService.getCurrencies();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.showCurrencyDialog = false;

    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.closeCurrencyDialog();
    };

    // Categories
    vm.categories = [
      { value: "food", label: "Food & Dining" },
      { value: "transport", label: "Transportation" },
      { value: "shopping", label: "Shopping" },
      { value: "entertainment", label: "Entertainment" },
      { value: "bills", label: "Bills & Utilities" },
      { value: "health", label: "Health & Medical" },
      { value: "education", label: "Education" },
      { value: "travel", label: "Travel" },
      { value: "groceries", label: "Groceries" },
      { value: "other", label: "Other" },
    ];

    // Dashboard data
    vm.thisMonthTotal = 1250.75;
    vm.lastMonthTotal = 980.5;
    vm.monthlyBudget = 2000;
    vm.budgetProgress = 0;
    vm.budgetStatus = "Set your budget";
    vm.showBudgetForm = false;
    vm.newBudget = null;

    // Update budget display
    vm.updateBudgetDisplay = function () {
      var spent = vm.thisMonthTotal;
      var budget = vm.monthlyBudget;
      if (budget > 0) {
        vm.budgetProgress = Math.min((spent / budget) * 100, 100);
        if (spent > budget) {
          vm.budgetStatus = "Exceeded by " + vm.formatCurrency(spent - budget);
        } else {
          vm.budgetStatus = vm.formatCurrency(budget - spent) + " remaining";
        }
      } else {
        vm.budgetProgress = 0;
        vm.budgetStatus = "Set your budget";
      }
    };

    vm.editBudget = function () {
      vm.newBudget = vm.monthlyBudget;
      vm.showBudgetForm = true;
    };

    vm.saveBudget = function () {
      if (vm.newBudget && vm.newBudget > 0) {
        vm.monthlyBudget = vm.newBudget;
        vm.showBudgetForm = false;
        vm.updateBudgetDisplay();
        // In a real app, save to server
        vm.showNotification("Budget saved!", "success");
      }
    };

    vm.cancelBudget = function () {
      vm.showBudgetForm = false;
      vm.newBudget = null;
    };

    // New expense form
    vm.newExpense = {
      date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
      amount: null,
      receipt: null,
    };
    vm.addingExpense = false;

    vm.addExpense = function () {
      vm.addingExpense = true;
      // Simulate API call
      $timeout(function () {
        var expense = {
          id: Date.now(),
          date: vm.newExpense.date,
          category: vm.newExpense.category,
          description: vm.newExpense.description,
          amount: vm.newExpense.amount,
          receipt: !!vm.newExpense.receipt,
        };
        // Add to recent expenses list (in a real app, would be saved to server)
        vm.recentExpenses.unshift(expense);
        vm.recentExpenses = vm.recentExpenses.slice(0, 5); // keep only 5

        // Update totals (simplified)
        vm.thisMonthTotal += expense.amount;
        vm.updateBudgetDisplay();

        // Reset form
        vm.newExpense = {
          date: new Date().toISOString().split("T")[0],
          category: "",
          description: "",
          amount: null,
          receipt: null,
        };
        vm.addingExpense = false;
        vm.showNotification("Expense added!", "success");
      }, 500);
    };

    // Recent expenses (mock)
    vm.recentExpenses = [
      {
        id: 1,
        date: "2024-02-25",
        category: "food",
        description: "Lunch with team",
        amount: 45.5,
        receipt: true,
      },
      {
        id: 2,
        date: "2024-02-24",
        category: "transport",
        description: "Uber ride",
        amount: 25.0,
        receipt: false,
      },
      {
        id: 3,
        date: "2024-02-24",
        category: "shopping",
        description: "New headphones",
        amount: 89.99,
        receipt: true,
      },
      {
        id: 4,
        date: "2024-02-23",
        category: "groceries",
        description: "Weekly groceries",
        amount: 120.35,
        receipt: true,
      },
      {
        id: 5,
        date: "2024-02-23",
        category: "entertainment",
        description: "Movie tickets",
        amount: 32.0,
        receipt: false,
      },
    ];
    vm.loadingRecent = false;

    // Format currency
    vm.formatCurrency = function (amount) {
      return vm.currentCurrency.symbol + parseFloat(amount || 0).toFixed(2);
    };

    // Notification (simple)
    vm.showNotification = function (message, type) {
      // In a real app, you'd show a toast; for now alert
      alert(message);
    };

    // Logout
    vm.logout = function () {
      if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        $window.location.href = "auth.html";
      }
    };

    // Close all modals when overlay clicked
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    // Initial update
    vm.updateBudgetDisplay();

    // Check authentication
    if (!sessionStorage.getItem("isLoggedIn")) {
      $window.location.href = "auth.html";
    }

    // Inside HomeController

    vm.showLogoutModal = false;

    vm.openLogoutModal = function () {
      vm.showLogoutModal = true;
    };

    vm.cancelLogout = function () {
      vm.showLogoutModal = false;
    };

    vm.confirmLogout = function () {
      // Perform logout
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userEmail");
      $window.location.href = "auth.html";
    };

    // Also ensure overlay can close the modal
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
      vm.showLogoutModal = false; // add this line
    };
  },
);

// Currency Service (shared across controllers)
app.factory("CurrencyService", function () {
  var currencies = [
    { code: "USD", symbol: "$", name: "USD - US Dollar" },
    { code: "EUR", symbol: "€", name: "EUR - Euro" },
    { code: "GBP", symbol: "£", name: "GBP - British Pound" },
    { code: "JPY", symbol: "¥", name: "JPY - Japanese Yen" },
    { code: "INR", symbol: "₹", name: "INR - Indian Rupee" },
    { code: "AUD", symbol: "A$", name: "AUD - Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "CAD - Canadian Dollar" },
    { code: "SGD", symbol: "S$", name: "SGD - Singapore Dollar" },
  ];

  var savedCurrency = localStorage.getItem("preferredCurrency");
  var currentCurrency = savedCurrency
    ? JSON.parse(savedCurrency)
    : currencies[0];

  return {
    getCurrencies: function () {
      return currencies;
    },
    getCurrentCurrency: function () {
      return currentCurrency;
    },
    setCurrentCurrency: function (currency) {
      currentCurrency = currency;
      localStorage.setItem("preferredCurrency", JSON.stringify(currency));
    },
  };
});

// Capitalize filter
app.filter("capitalize", function () {
  return function (input) {
    if (!input) return "";
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});

// File model directive (for handling file input)
app.directive("fileModel", function () {
  return {
    restrict: "A",
    scope: {
      fileModel: "=",
    },
    link: function (scope, element, attrs) {
      element.bind("change", function () {
        scope.$apply(function () {
          scope.fileModel = element[0].files[0];
        });
      });
    },
  };
});

app.controller(
  "ExpenseReportController",
  function ($scope, $window, $timeout, CurrencyService) {
    var vm = this;

    // User info
    vm.userName = sessionStorage.getItem("userName") || "User";

    // Sidebar
    vm.sidebarOpen = false;
    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    // Currency
    vm.currencies = CurrencyService.getCurrencies();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.showCurrencyDialog = false;
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.closeCurrencyDialog();
      // Redraw charts with new currency
      vm.renderCharts();
    };

    // Format currency
    vm.formatCurrency = function (amount) {
      return vm.currentCurrency.symbol + (amount || 0).toFixed(2);
    };

    // Mock data for current and previous month
    vm.currentMonthTotal = 1250.75;
    vm.previousMonthTotal = 980.5;
    vm.monthOverMonthChange = (
      ((vm.currentMonthTotal - vm.previousMonthTotal) / vm.previousMonthTotal) *
      100
    ).toFixed(1);
    vm.averageDaily = vm.currentMonthTotal / 28;

    // Category data for pie charts
    vm.currentMonthCategories = [
      { category: "food", amount: 450.25, color: "#ef4444" },
      { category: "transport", amount: 120.5, color: "#3b82f6" },
      { category: "shopping", amount: 300.0, color: "#a855f7" },
      { category: "entertainment", amount: 180.0, color: "#ec4899" },
      { category: "bills", amount: 200.0, color: "#f97316" },
    ];

    vm.previousMonthCategories = [
      { category: "food", amount: 380.0, color: "#ef4444" },
      { category: "transport", amount: 95.0, color: "#3b82f6" },
      { category: "shopping", amount: 250.5, color: "#a855f7" },
      { category: "entertainment", amount: 150.0, color: "#ec4899" },
      { category: "bills", amount: 105.0, color: "#f97316" },
    ];

    // Prepare comparison data for table
    vm.categoryComparison = vm.currentMonthCategories.map(function (curr) {
      var prev = vm.previousMonthCategories.find(
        (p) => p.category === curr.category,
      ) || { amount: 0 };
      var change = prev.amount
        ? (((curr.amount - prev.amount) / prev.amount) * 100).toFixed(1)
        : 100;
      return {
        category: curr.category,
        current: curr.amount,
        previous: prev.amount,
        change: change,
      };
    });

    // Chart instances
    var currentChart = null;
    var previousChart = null;

    // Render charts (called after data ready or currency change)
    vm.renderCharts = function () {
      // Destroy existing charts if any
      if (currentChart) currentChart.destroy();
      if (previousChart) previousChart.destroy();

      var ctxCurrent = document.getElementById("currentMonthChart");
      var ctxPrevious = document.getElementById("previousMonthChart");

      if (!ctxCurrent || !ctxPrevious) return;

      // Prepare data labels and values
      var currentLabels = vm.currentMonthCategories.map(
        (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1),
      );
      var currentData = vm.currentMonthCategories.map((c) => c.amount);
      var currentColors = vm.currentMonthCategories.map((c) => c.color);

      var previousLabels = vm.previousMonthCategories.map(
        (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1),
      );
      var previousData = vm.previousMonthCategories.map((c) => c.amount);
      var previousColors = vm.previousMonthCategories.map((c) => c.color);

      // Create charts
      currentChart = new Chart(ctxCurrent, {
        type: "pie",
        data: {
          labels: currentLabels,
          datasets: [
            {
              data: currentData,
              backgroundColor: currentColors,
              borderColor: "#0f172a",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
                font: { size: 12 },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || "";
                  var value = context.raw || 0;
                  var total = context.dataset.data.reduce((a, b) => a + b, 0);
                  var percentage = ((value / total) * 100).toFixed(1);
                  return (
                    label +
                    ": " +
                    vm.formatCurrency(value) +
                    " (" +
                    percentage +
                    "%)"
                  );
                },
              },
            },
          },
        },
      });

      previousChart = new Chart(ctxPrevious, {
        type: "pie",
        data: {
          labels: previousLabels,
          datasets: [
            {
              data: previousData,
              backgroundColor: previousColors,
              borderColor: "#0f172a",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
                font: { size: 12 },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || "";
                  var value = context.raw || 0;
                  var total = context.dataset.data.reduce((a, b) => a + b, 0);
                  var percentage = ((value / total) * 100).toFixed(1);
                  return (
                    label +
                    ": " +
                    vm.formatCurrency(value) +
                    " (" +
                    percentage +
                    "%)"
                  );
                },
              },
            },
          },
        },
      });
    };

    // Logout
    vm.logout = function () {
      if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        $window.location.href = "auth.html";
      }
    };

    // Close modals
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    // Wait for DOM to be ready before rendering charts
    $timeout(function () {
      vm.renderCharts();
    }, 100);

    // Watch for currency changes to update charts (though we already call render in selectCurrency)
    $scope.$watch(
      function () {
        return vm.currentCurrency;
      },
      function (newVal, oldVal) {
        if (newVal !== oldVal) {
          vm.renderCharts();
        }
      },
      true,
    );

    // Authentication check
    if (!sessionStorage.getItem("isLoggedIn")) {
      $window.location.href = "auth.html";
    }
  },
);

// User Service (mock) – could be extended later with real API
app.factory("UserService", function ($q, $timeout) {
  // Mock user data (would come from server/session)
  var currentUser = {
    id: 1,
    name: sessionStorage.getItem("userName") || "John Doe",
    email: sessionStorage.getItem("userEmail") || "john@example.com",
    phone: sessionStorage.getItem("userPhone") || "+1 234 567 8900",
    currency: "USD",
    memberSince: new Date(2024, 0, 15), // Jan 15, 2024
  };

  // Mock stats (would be calculated from expenses)
  var stats = {
    totalExpenses: 3245.8,
    transactionCount: 47,
    averageTransaction: 69.06,
    largestExpense: 450.25,
    topCategory: "food",
    monthlyBudget: 2000,
  };

  // Recent activity mock
  var recentActivity = [
    {
      icon: "💰",
      text: 'Added expense "Lunch with team"',
      time: new Date(2024, 1, 25, 14, 30),
    },
    {
      icon: "✏️",
      text: "Updated monthly budget",
      time: new Date(2024, 1, 24, 10, 15),
    },
    {
      icon: "📊",
      text: "Viewed expense report",
      time: new Date(2024, 1, 23, 9, 45),
    },
    {
      icon: "⚙️",
      text: "Changed currency to EUR",
      time: new Date(2024, 1, 22, 16, 20),
    },
  ];

  return {
    getUser: function () {
      return angular.copy(currentUser);
    },
    updateUser: function (userData) {
      var deferred = $q.defer();
      $timeout(function () {
        // Simulate successful update
        currentUser.name = userData.name;
        currentUser.email = userData.email;
        currentUser.phone = userData.phone;
        currentUser.currency = userData.currency;

        // Update session storage (optional)
        sessionStorage.setItem("userName", userData.name);
        sessionStorage.setItem("userEmail", userData.email);
        sessionStorage.setItem("userPhone", userData.phone);

        deferred.resolve({ success: true, user: angular.copy(currentUser) });
      }, 800); // simulate network delay
      return deferred.promise;
    },
    getStats: function () {
      return angular.copy(stats);
    },
    getRecentActivity: function () {
      return angular.copy(recentActivity);
    },
  };
});

app.controller(
  "ProfileController",
  function ($scope, $window, $timeout, CurrencyService, UserService) {
    var vm = this;

    // User info from service
    vm.user = UserService.getUser();
    vm.editUser = angular.copy(vm.user); // for form editing
    vm.stats = UserService.getStats();

    // Currency (reuse service)
    vm.currencies = CurrencyService.getCurrencies();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    // Sync editUser.currency with currentCurrency.code
    vm.editUser.currency = vm.currentCurrency.code;

    vm.showCurrencyDialog = false;
    vm.sidebarOpen = false;
    vm.updating = false;

    // Toggle sidebar
    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    // Currency dialog
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.editUser.currency = currency.code; // also update profile currency field
      vm.closeCurrencyDialog();
    };

    // Format currency (using current currency from service)
    vm.formatCurrency = function (amount) {
      return vm.currentCurrency.symbol + (amount || 0).toFixed(2);
    };

    // Update profile
    vm.updateProfile = function () {
      vm.updating = true;
      UserService.updateUser(vm.editUser)
        .then(function (response) {
          vm.user = response.user;
          // Update session storage if needed
          sessionStorage.setItem("userName", response.user.name);
          sessionStorage.setItem("userEmail", response.user.email);
          sessionStorage.setItem("userPhone", response.user.phone);

          // Show success message
          alert("Profile updated successfully!"); // replace with proper notification
        })
        .catch(function (error) {
          alert("Update failed: " + error);
        })
        .finally(function () {
          vm.updating = false;
        });
    };

    // Logout
    vm.logout = function () {
      if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        $window.location.href = "auth.html";
      }
    };

    // Close modals
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    // Authentication check
    if (!sessionStorage.getItem("isLoggedIn")) {
      $window.location.href = "auth.html";
    }
  },
);

app.factory("UserService", function ($q, $timeout) {
  // Mock user data (would come from server/session)
  var currentUser = {
    id: 1,
    name: sessionStorage.getItem("userName") || "John Doe",
    email: sessionStorage.getItem("userEmail") || "john@example.com",
    phone: sessionStorage.getItem("userPhone") || "+1 234 567 8900",
    currency: "USD",
    memberSince: new Date(2024, 0, 15), // Jan 15, 2024
  };

  // Mock stats (would be calculated from expenses)
  var stats = {
    totalExpenses: 3245.8,
    transactionCount: 47,
    averageTransaction: 69.06,
    largestExpense: 450.25,
    topCategory: "food",
    monthlyBudget: 2000,
  };

  return {
    getUser: function () {
      return angular.copy(currentUser);
    },
    updateUser: function (userData) {
      var deferred = $q.defer();
      $timeout(function () {
        // Simulate successful update
        currentUser.name = userData.name;
        currentUser.email = userData.email;
        currentUser.phone = userData.phone;
        currentUser.currency = userData.currency;

        // Update session storage (optional)
        sessionStorage.setItem("userName", userData.name);
        sessionStorage.setItem("userEmail", userData.email);
        sessionStorage.setItem("userPhone", userData.phone);

        deferred.resolve({ success: true, user: angular.copy(currentUser) });
      }, 800); // simulate network delay
      return deferred.promise;
    },
    getStats: function () {
      return angular.copy(stats);
    },
  };
});

// Contact Service (mock)
app.factory("ContactService", function ($q, $timeout) {
  return {
    sendMessage: function (messageData) {
      var deferred = $q.defer();
      $timeout(function () {
        // Simulate successful API call
        console.log("Message sent:", messageData);
        deferred.resolve({
          success: true,
          message: "Your message has been sent. We'll get back to you soon.",
        });
      }, 1000); // simulate network delay
      return deferred.promise;
    },
  };
});

app.controller(
  "ContactController",
  function ($scope, $window, $timeout, CurrencyService, ContactService) {
    var vm = this;

    // User info from session
    vm.userName = sessionStorage.getItem("userName") || "User";

    // Sidebar
    vm.sidebarOpen = false;
    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    // Currency (reuse service)
    vm.currencies = CurrencyService.getCurrencies();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.showCurrencyDialog = false;
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.closeCurrencyDialog();
    };

    // Message object
    vm.message = {
      name: sessionStorage.getItem("userName") || "",
      email: sessionStorage.getItem("userEmail") || "",
      subject: "",
      priority: "",
      text: "",
      attachment: null,
    };

    vm.sending = false;

    // Send message
    vm.sendMessage = function () {
      vm.sending = true;
      ContactService.sendMessage(vm.message)
        .then(function (response) {
          alert(response.message); // Show success message
          // Reset form
          vm.message = {
            name: sessionStorage.getItem("userName") || "",
            email: sessionStorage.getItem("userEmail") || "",
            subject: "",
            priority: "",
            text: "",
            attachment: null,
          };
          // Reset form validation state
          $scope.contactForm.$setPristine();
          $scope.contactForm.$setUntouched();
        })
        .catch(function (error) {
          alert("Failed to send message: " + error);
        })
        .finally(function () {
          vm.sending = false;
        });
    };

    // Logout
    vm.logout = function () {
      if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("userEmail");
        $window.location.href = "auth.html";
      }
    };

    // Close modals
    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    // Authentication check
    if (!sessionStorage.getItem("isLoggedIn")) {
      $window.location.href = "auth.html";
    }
  },
);

vm.logout = function () {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    $window.location.href = "auth.html";
  }
};
