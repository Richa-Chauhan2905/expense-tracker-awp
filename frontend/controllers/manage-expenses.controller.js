app.controller("ManageExpensesController", [
  "ExpenseService",
  "BudgetService",
  "CurrencyService",
  "AuthService",
  "$location",
  "$timeout",
  function (
    ExpenseService,
    BudgetService,
    CurrencyService,
    AuthService,
    $location,
    $timeout,
  ) {
    var vm = this;

    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.expenses = [];
    vm.filteredExpenses = [];
    vm.filters = { category: "", month: "" };
    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.totalPages = 1;
    vm.loading = false;

    // Categories (matching backend)
    vm.categories = [
      "food",
      "transport",
      "shopping",
      "entertainment",
      "bills",
      "health",
      "education",
      "travel",
      "groceries",
      "other",
    ];

    // Load expenses for a given month (default current month)
    function loadExpenses() {
      vm.loading = true;
      var month = vm.filters.month || new Date().toISOString().slice(0, 7);
      ExpenseService.getByMonth(month)
        .then(function (response) {
          vm.expenses = response.data;
          vm.applyFilters();
        })
        .catch(function (error) {
          if (error.status === 401) $location.path("/login");
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    // Filter and paginate
    vm.applyFilters = function () {
      var filtered = vm.expenses.filter(function (exp) {
        var matchCategory =
          !vm.filters.category || exp.category === vm.filters.category;
        var matchMonth =
          !vm.filters.month ||
          (exp.expenseDate && exp.expenseDate.slice(0, 7) === vm.filters.month);
        return matchCategory && matchMonth;
      });
      // Sort by date descending
      filtered.sort(function (a, b) {
        return new Date(b.expenseDate) - new Date(a.expenseDate);
      });
      vm.filteredExpenses = filtered;
      vm.totalPages =
        Math.ceil(vm.filteredExpenses.length / vm.itemsPerPage) || 1;
      vm.goToPage(1);
    };

    vm.goToPage = function (page) {
      vm.currentPage = page;
    };

    vm.clearFilters = function () {
      vm.filters = { category: "", month: "" };
      loadExpenses();
    };

    // Paginated slice
    vm.paginatedExpenses = function () {
      var start = (vm.currentPage - 1) * vm.itemsPerPage;
      return vm.filteredExpenses.slice(start, start + vm.itemsPerPage);
    };

    // Delete expense
    vm.deleteExpense = function (id) {
      if (confirm("Are you sure you want to delete this expense?")) {
        ExpenseService.delete(id)
          .then(function () {
            loadExpenses();
          })
          .catch(function (error) {
            alert(error.data?.message || "Delete failed");
          });
      }
    };

    // Edit modal
    vm.editExpense = { show: false, data: null };
    vm.openEditModal = function (expense) {
      vm.editExpense.data = angular.copy(expense);
      vm.editExpense.show = true;
    };
    vm.closeEditModal = function () {
      vm.editExpense.show = false;
      vm.editExpense.data = null;
    };
    vm.saveEdit = function () {
      var updatedData = {
        expenseDate: vm.editExpense.data.expenseDate,
        amount: vm.editExpense.data.amount,
        title: vm.editExpense.data.title,
        category: vm.editExpense.data.category,
      };
      ExpenseService.update(vm.editExpense.data._id, updatedData)
        .then(function () {
          vm.closeEditModal();
          loadExpenses();
        })
        .catch(function (error) {
          alert(error.data?.message || "Update failed");
        });
    };

    // Currency handling
    vm.currencies = CurrencyService.getCurrencies();
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

    // Logout
    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };

    // Initial load
    loadExpenses();
  },
]);
