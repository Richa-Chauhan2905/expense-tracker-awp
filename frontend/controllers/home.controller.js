app.controller("HomeController", [
  "$scope",
  "AuthService",
  "ExpenseService",
  "BudgetService",
  "CurrencyService",
  function (
    $scope,
    AuthService,
    ExpenseService,
    BudgetService,
    CurrencyService,
  ) {
    var vm = this;
    vm.user = AuthService.getCurrentUser();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();

    vm.thisMonthTotal = 0;
    vm.monthlyBudget = 0;
    vm.recentExpenses = [];
    vm.showBudgetForm = false;
    vm.newBudget = null;

    function getCurrentMonth() {
      return new Date().toISOString().slice(0, 7);
    }

    function loadData() {
      var month = getCurrentMonth();
      ExpenseService.getByMonth(month).then(function (res) {
        vm.recentExpenses = res.data.slice(0, 5);
        vm.thisMonthTotal = res.data.reduce((sum, e) => sum + e.amount, 0);
      });
      BudgetService.get(month).then(function (res) {
        vm.monthlyBudget = res.data ? res.data.amount : 0;
      });
    }

    vm.addExpense = function (expense) {
      var data = {
        expenseDate: expense.date,
        amount: expense.amount,
        title: expense.description,
        category: expense.category,
      };
      ExpenseService.create(data).then(function () {
        loadData();
        vm.newExpense = {
          date: new Date().toISOString().slice(0, 10),
          category: "",
          description: "",
          amount: null,
        };
      });
    };

    vm.saveBudget = function () {
      if (vm.newBudget > 0) {
        BudgetService.set(getCurrentMonth(), vm.newBudget).then(function () {
          vm.monthlyBudget = vm.newBudget;
          vm.showBudgetForm = false;
        });
      }
    };

    loadData();
  },
]);
