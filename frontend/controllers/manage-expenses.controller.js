app.controller("ManageExpensesController", [
  "ExpenseService",
  "CurrencyService",
  "AuthService",
  "$location",
  "$window",
  function (
    ExpenseService,
    CurrencyService,
    AuthService,
    $location,
    $window,
  ) {
    var vm = this;

    vm.currentPage = "expenses";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.showEditModal = false;
    vm.showDeleteModal = false;
    vm.loading = false;
    vm.userName = "User";
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.expenses = [];
    vm.filteredExpenses = [];
    vm.pages = [];
    vm.currentPageNumber = 1;
    vm.itemsPerPage = 10;
    vm.totalPages = 1;
    vm.expenseToDelete = null;
    vm.filters = {
      category: "",
      month: new Date().toISOString().slice(0, 7),
    };
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
    vm.editExpense = {};
    vm.originalEditExpenseDate = "";

    function toInputDate(value) {
      if (!value) {
        return "";
      }

      if (typeof value === "string") {
        return value.slice(0, 10);
      }

      var date = new Date(value);
      if (isNaN(date.getTime())) {
        return "";
      }

      return date.toISOString().slice(0, 10);
    }

    function toDateObject(value) {
      var normalized = toInputDate(value);
      if (!normalized) {
        return null;
      }

      var parts = normalized.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function normalizeExpense(expense) {
      return {
        id: expense._id,
        _id: expense._id,
        date: expense.expenseDate,
        expenseDate: expense.expenseDate
          ? expense.expenseDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        category: expense.category || "other",
        description: expense.title || "",
        title: expense.title || "",
        amount: Number(expense.amount) || 0,
        receipt:
          expense.receipt && expense.receipt.url ? expense.receipt : null,
      };
    }

    function buildPages() {
      vm.pages = [];
      for (var page = 1; page <= vm.totalPages; page += 1) {
        vm.pages.push(page);
      }
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

    function loadExpenses() {
      vm.loading = true;

      return ExpenseService.getByMonth(vm.filters.month)
        .then(function (response) {
          vm.expenses = (response.data || []).map(normalizeExpense);
          vm.applyFilters();
        })
        .finally(function () {
          vm.loading = false;
        });
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
    };

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
      vm.showEditModal = false;
      vm.showDeleteModal = false;
    };

    vm.applyFilters = function () {
      var filtered = vm.expenses.filter(function (expense) {
        var matchCategory =
          !vm.filters.category || expense.category === vm.filters.category;
        var matchMonth =
          !vm.filters.month ||
          (expense.expenseDate &&
            expense.expenseDate.slice(0, 7) === vm.filters.month);

        return matchCategory && matchMonth;
      });

      vm.filteredExpenses = filtered;
      vm.totalPages = Math.max(
        1,
        Math.ceil(vm.filteredExpenses.length / vm.itemsPerPage),
      );
      vm.goToPage(1);
      buildPages();
    };

    vm.filterExpenses = function () {
      if (!vm.filters.month) {
        vm.filters.month = new Date().toISOString().slice(0, 7);
      }
      loadExpenses();
    };

    vm.goToPage = function (page) {
      vm.currentPageNumber = page;
    };

    vm.paginatedExpenses = function () {
      var start = (vm.currentPageNumber - 1) * vm.itemsPerPage;
      return vm.filteredExpenses.slice(start, start + vm.itemsPerPage);
    };

    vm.clearFilters = function () {
      vm.filters = {
        category: "",
        month: new Date().toISOString().slice(0, 7),
      };
      loadExpenses();
    };

    vm.openEditModal = function (expense) {
      vm.editExpense = angular.copy(expense);
      vm.originalEditExpenseDate = toInputDate(
        expense && (expense.expenseDate || expense.date),
      );
      vm.editExpense.expenseDate = toDateObject(
        vm.editExpense.expenseDate || vm.editExpense.date || vm.originalEditExpenseDate,
      );
      vm.showEditModal = true;
    };

    vm.closeEditModal = function () {
      vm.editExpense = {};
      vm.originalEditExpenseDate = "";
      vm.showEditModal = false;
    };

    vm.saveEdit = function () {
      var expenseDate =
        toInputDate(vm.editExpense.expenseDate) || vm.originalEditExpenseDate;

      var updatedData = {
        expenseDate: expenseDate,
        amount: vm.editExpense.amount,
        title: vm.editExpense.description,
        category: vm.editExpense.category,
      };

      ExpenseService.update(vm.editExpense.id, updatedData).then(function () {
        vm.closeEditModal();
        loadExpenses();
      });
    };

    vm.openDeleteModal = function (expense) {
      vm.expenseToDelete = expense;
      vm.showDeleteModal = true;
    };

    vm.closeDeleteModal = function () {
      vm.expenseToDelete = null;
      vm.showDeleteModal = false;
    };

    vm.confirmDelete = function () {
      if (!vm.expenseToDelete) {
        return;
      }

      ExpenseService.delete(vm.expenseToDelete.id).then(function () {
        vm.closeDeleteModal();
        loadExpenses();
      });
    };

    vm.viewReceipt = function (expense) {
      if (expense && expense.receipt && expense.receipt.url) {
        $window.open(
          window.location.protocol +
            "//" +
            window.location.hostname +
            ":5000" +
            expense.receipt.url,
          "_blank",
        );
      }
    };

    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
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
    loadExpenses();
  },
]);
