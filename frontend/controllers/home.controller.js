app.controller("HomeController", [
  "AuthService",
  "ExpenseService",
  "BudgetService",
  "CurrencyService",
  "$location",
  function (
    AuthService,
    ExpenseService,
    BudgetService,
    CurrencyService,
    $location,
  ) {
    var vm = this;

    vm.currentPage = "home";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.showLogoutModal = false;
    vm.showBudgetForm = false;
    vm.loadingRecent = false;
    vm.addingExpense = false;
    vm.user = null;
    vm.userName = "User";
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.thisMonthTotal = 0;
    vm.lastMonthTotal = 0;
    vm.monthlyBudget = 0;
    vm.budgetProgress = 0;
    vm.budgetStatus = "No budget set";
    vm.recentExpenses = [];
    vm.newBudget = null;
    vm.categories = [
      { value: "food", label: "Food" },
      { value: "transport", label: "Transport" },
      { value: "shopping", label: "Shopping" },
      { value: "entertainment", label: "Entertainment" },
      { value: "bills", label: "Bills" },
      { value: "health", label: "Health" },
      { value: "education", label: "Education" },
      { value: "travel", label: "Travel" },
      { value: "groceries", label: "Groceries" },
      { value: "other", label: "Other" },
    ];
    vm.newExpense = getDefaultExpense();

    function getDefaultExpense() {
      return {
        date: new Date(),
        category: "",
        description: "",
        amount: null,
        receipt: null,
      };
    }

    function getMonthKey(date) {
      return date.toISOString().slice(0, 7);
    }

    function getPreviousMonthKey() {
      var date = new Date();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() - 1);
      return getMonthKey(date);
    }

    function setUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "User";

      if (user && user.currencyPreference) {
        vm.currentCurrency = CurrencyService.setCurrentCurrencyByCode(
          user.currencyPreference,
        );
      }
    }

    function normalizeExpense(expense) {
      return {
        id: expense._id || expense.id,
        date: expense.expenseDate || expense.date,
        category: expense.category || "other",
        description: expense.title || expense.description || "Untitled expense",
        amount: Number(expense.amount) || 0,
      };
    }

    function updateBudgetState() {
      if (!vm.monthlyBudget) {
        vm.budgetProgress = 0;
        vm.budgetStatus = "No budget set";
        return;
      }

      vm.budgetProgress = Math.round(
        (vm.thisMonthTotal / vm.monthlyBudget) * 100,
      );

      if (vm.thisMonthTotal > vm.monthlyBudget) {
        vm.budgetStatus = "Budget exceeded";
      } else {
        var remaining = vm.monthlyBudget - vm.thisMonthTotal;
        vm.budgetStatus =
          vm.formatCurrency(remaining) + " remaining this month";
      }
    }

    function loadUser() {
      var currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      return AuthService.fetchMe()
        .then(function (user) {
          setUser(user);
        })
        .catch(function () {
          if (!currentUser) {
            $location.path("/login");
          }
        });
    }

    function loadCurrentMonthExpenses() {
      vm.loadingRecent = true;

      return ExpenseService.getByMonth(getMonthKey(new Date()))
        .then(function (res) {
          var expenses = (res.data || []).map(normalizeExpense);
          vm.recentExpenses = expenses.slice(0, 5);
          vm.thisMonthTotal = expenses.reduce(function (sum, expense) {
            return sum + expense.amount;
          }, 0);
          updateBudgetState();
        })
        .catch(function () {
          vm.recentExpenses = [];
          vm.thisMonthTotal = 0;
          updateBudgetState();
        })
        .finally(function () {
          vm.loadingRecent = false;
        });
    }

    function loadLastMonthExpenses() {
      return ExpenseService.getByMonth(getPreviousMonthKey())
        .then(function (res) {
          vm.lastMonthTotal = (res.data || []).reduce(function (sum, expense) {
            return sum + (Number(expense.amount) || 0);
          }, 0);
        })
        .catch(function () {
          vm.lastMonthTotal = 0;
        });
    }

    function loadBudget() {
      return BudgetService.get(getMonthKey(new Date()))
        .then(function (res) {
          vm.monthlyBudget = res.data ? Number(res.data.amount) || 0 : 0;
          vm.newBudget = vm.monthlyBudget || null;
          updateBudgetState();
        })
        .catch(function () {
          vm.monthlyBudget = 0;
          vm.newBudget = null;
          updateBudgetState();
        });
    }

    function loadData() {
      loadCurrentMonthExpenses();
      loadLastMonthExpenses();
      loadBudget();
    }

    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };

    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };

    vm.selectCurrency = function (currency) {
      vm.currentCurrency = CurrencyService.setCurrentCurrency(currency);
      vm.closeCurrencyDialog();
      updateBudgetState();
    };

    vm.openLogoutModal = function () {
      vm.showLogoutModal = true;
    };

    vm.cancelLogout = function () {
      vm.showLogoutModal = false;
    };

    vm.confirmLogout = function () {
      AuthService.logout().finally(function () {
        vm.showLogoutModal = false;
        $location.path("/login");
      });
    };

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
      vm.showLogoutModal = false;
    };

    vm.editBudget = function () {
      vm.newBudget = vm.monthlyBudget || null;
      vm.showBudgetForm = true;
    };

    vm.cancelBudget = function () {
      vm.newBudget = vm.monthlyBudget || null;
      vm.showBudgetForm = false;
    };

    vm.saveBudget = function () {
      if (!(vm.newBudget > 0)) {
        return;
      }

      BudgetService.set(getMonthKey(new Date()), vm.newBudget).then(function () {
        vm.monthlyBudget = Number(vm.newBudget);
        vm.showBudgetForm = false;
        updateBudgetState();
      });
    };

    vm.addExpense = function () {
      vm.addingExpense = true;

      var data = {
        expenseDate: vm.newExpense.date.toISOString().slice(0, 10),
        amount: vm.newExpense.amount,
        title: vm.newExpense.description,
        category: vm.newExpense.category,
      };

      ExpenseService.create(data)
        .then(function () {
          vm.newExpense = getDefaultExpense();
          loadData();
        })
        .finally(function () {
          vm.addingExpense = false;
        });
    };

    vm.formatCurrency = function (amount) {
      return CurrencyService.formatAmount(amount, vm.currentCurrency.code);
    };

    vm.formatCategory = function (category) {
      if (!category) {
        return "Other";
      }

      return category.charAt(0).toUpperCase() + category.slice(1);
    };

    loadUser();
    loadData();
  },
]);
