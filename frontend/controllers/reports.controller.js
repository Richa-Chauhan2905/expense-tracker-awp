app.controller("ExpenseReportController", [
  "ReportService",
  "CurrencyService",
  "AuthService",
  "$location",
  "$timeout",
  function (ReportService, CurrencyService, AuthService, $location, $timeout) {
    var vm = this;

    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.showCurrencyDialog = false;

    // Date selection
    var now = new Date();
    vm.currentMonth = now.toISOString().slice(0, 7);
    var prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    vm.previousMonth = prevDate.toISOString().slice(0, 7);

    vm.reportData = null;
    vm.loading = false;

    // Chart instances
    var currentChart = null;
    var previousChart = null;

    // Load report from backend
    vm.loadReport = function () {
      vm.loading = true;
      ReportService.compareMonths(vm.currentMonth, vm.previousMonth)
        .then(function (response) {
          vm.reportData = response.data;
          vm.loading = false;
          $timeout(vm.renderCharts, 100);
        })
        .catch(function (error) {
          vm.loading = false;
          if (error.status === 401) $location.path("/login");
          else alert("Failed to load report");
        });
    };

    // Render pie charts using Chart.js (assuming Chart is available globally)
    vm.renderCharts = function () {
      if (!vm.reportData) return;

      // Destroy old charts if they exist
      if (currentChart) currentChart.destroy();
      if (previousChart) previousChart.destroy();

      var ctxCurrent = document.getElementById("currentMonthChart");
      var ctxPrevious = document.getElementById("previousMonthChart");
      if (!ctxCurrent || !ctxPrevious) return;

      var currentCategories = vm.reportData.currentMonth.categories || [];
      var previousCategories = vm.reportData.previousMonth.categories || [];

      // Current month chart
      currentChart = new Chart(ctxCurrent, {
        type: "pie",
        data: {
          labels: currentCategories.map(
            (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1),
          ),
          datasets: [
            {
              data: currentCategories.map((c) => c.total),
              backgroundColor: [
                "#ef4444",
                "#3b82f6",
                "#a855f7",
                "#ec4899",
                "#f97316",
                "#10b981",
                "#f59e0b",
                "#6366f1",
                "#14b8a6",
                "#8b5cf6",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || "";
                  var value = context.raw || 0;
                  var total = context.dataset.data.reduce((a, b) => a + b, 0);
                  var percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${vm.currentCurrency.symbol}${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });

      // Previous month chart
      previousChart = new Chart(ctxPrevious, {
        type: "pie",
        data: {
          labels: previousCategories.map(
            (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1),
          ),
          datasets: [
            {
              data: previousCategories.map((c) => c.total),
              backgroundColor: [
                "#ef4444",
                "#3b82f6",
                "#a855f7",
                "#ec4899",
                "#f97316",
                "#10b981",
                "#f59e0b",
                "#6366f1",
                "#14b8a6",
                "#8b5cf6",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    };

    // Format currency helper for view
    vm.formatCurrency = function (amount) {
      return vm.currentCurrency.symbol + (amount || 0).toFixed(2);
    };

    // Currency handling
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
      // Re-render charts with new currency symbol (tooltips will update automatically via binding)
      if (vm.reportData) vm.renderCharts();
    };

    // Logout
    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };

    // Initial load
    vm.loadReport();
  },
]);
