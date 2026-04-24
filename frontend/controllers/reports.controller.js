app.controller("ExpenseReportController", [
  "ReportService",
  "ExpenseService",
  "CurrencyService",
  "AuthService",
  "$location",
  "$q",
  "$timeout",
  function (
    ReportService,
    ExpenseService,
    CurrencyService,
    AuthService,
    $location,
    $q,
    $timeout,
  ) {
    var vm = this;
    var currentChart = null;
    var previousChart = null;

    vm.currentPage = "reports";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.loading = false;
    vm.userName = "User";
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.reportData = null;
    vm.categoryComparison = [];
    vm.currentMonthExpenses = [];
    vm.previousMonthExpenses = [];

    var now = new Date();
    vm.currentMonth = now.toISOString().slice(0, 7);
    var previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    vm.previousMonth = previous.toISOString().slice(0, 7);
    vm.currentMonthTotal = 0;
    vm.previousMonthTotal = 0;
    vm.monthOverMonthChange = 0;
    vm.averageDaily = 0;

    function normalizeExpense(expense) {
      return {
        id: expense._id || expense.id,
        expenseDate: expense.expenseDate || expense.date,
        category: expense.category || "other",
        title: expense.title || expense.description || "Untitled expense",
        amount: Number(expense.amount) || 0,
      };
    }

    function formatMonthLabel(monthKey) {
      if (!monthKey) {
        return "";
      }

      var parts = monthKey.split("-");
      var date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
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

    function daysInMonth(monthKey) {
      var parts = monthKey.split("-");
      return new Date(parts[0], parts[1], 0).getDate();
    }

    function buildCategoryComparison(currentCategories, previousCategories) {
      var lookup = {};

      currentCategories.forEach(function (item) {
        lookup[item.category] = {
          category: item.category,
          current: item.total,
          previous: 0,
          change: 100,
        };
      });

      previousCategories.forEach(function (item) {
        if (!lookup[item.category]) {
          lookup[item.category] = {
            category: item.category,
            current: 0,
            previous: item.total,
            change: -100,
          };
        } else {
          lookup[item.category].previous = item.total;
        }
      });

      vm.categoryComparison = Object.keys(lookup)
        .map(function (key) {
          var row = lookup[key];
          if (row.previous === 0) {
            row.change = row.current > 0 ? 100 : 0;
          } else {
            row.change = ((row.current - row.previous) / row.previous) * 100;
          }
          return row;
        })
        .sort(function (a, b) {
          return b.current - a.current;
        });
    }

    vm.loadReport = function () {
      vm.loading = true;

      $q
        .all({
          report: ReportService.compareMonths(vm.currentMonth, vm.previousMonth),
          currentExpenses: ExpenseService.getByMonth(vm.currentMonth),
          previousExpenses: ExpenseService.getByMonth(vm.previousMonth),
        })
        .then(function (responses) {
          vm.reportData = responses.report.data;
          vm.currentMonthTotal = responses.report.data.totals.currentTotal || 0;
          vm.previousMonthTotal =
            responses.report.data.totals.previousTotal || 0;
          vm.monthOverMonthChange = vm.previousMonthTotal
            ? ((vm.currentMonthTotal - vm.previousMonthTotal) /
                vm.previousMonthTotal) *
              100
            : 0;
          vm.averageDaily =
            vm.currentMonthTotal / Math.max(daysInMonth(vm.currentMonth), 1);
          vm.currentMonthExpenses = (responses.currentExpenses.data || []).map(
            normalizeExpense,
          );
          vm.previousMonthExpenses = (
            responses.previousExpenses.data || []
          ).map(normalizeExpense);

          buildCategoryComparison(
            responses.report.data.currentMonth.categories || [],
            responses.report.data.previousMonth.categories || [],
          );

          $timeout(vm.renderCharts, 50);
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.renderCharts = function () {
      if (!vm.reportData) {
        return;
      }

      if (currentChart) {
        currentChart.destroy();
      }
      if (previousChart) {
        previousChart.destroy();
      }

      var ctxCurrent = document.getElementById("currentMonthChart");
      var ctxPrevious = document.getElementById("previousMonthChart");

      if (!ctxCurrent || !ctxPrevious) {
        return;
      }

      function buildChart(canvas, categories) {
        return new Chart(canvas, {
          type: "pie",
          data: {
            labels: categories.map(function (item) {
              return item.category.charAt(0).toUpperCase() + item.category.slice(1);
            }),
            datasets: [
              {
                data: categories.map(function (item) {
                  return item.total;
                }),
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
          },
        });
      }

      currentChart = buildChart(
        ctxCurrent,
        vm.reportData.currentMonth.categories || [],
      );
      previousChart = buildChart(
        ctxPrevious,
        vm.reportData.previousMonth.categories || [],
      );
    };

    vm.downloadPdfReport = function () {
      var jsPDFConstructor = window.jspdf && window.jspdf.jsPDF;

      if (!jsPDFConstructor || !vm.reportData) {
        return;
      }

      var doc = new jsPDFConstructor();
      if (typeof doc.autoTable !== "function") {
        window.alert("PDF export is currently unavailable. Please refresh and try again.");
        return;
      }

      var currentLabel = formatMonthLabel(vm.currentMonth);
      var previousLabel = formatMonthLabel(vm.previousMonth);
      var generatedOn = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      var currentRows = vm.currentMonthExpenses.length
        ? vm.currentMonthExpenses.map(function (expense) {
            return [
              expense.expenseDate
                ? new Date(expense.expenseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-",
              vm.formatCategory(expense.category),
              expense.title,
              vm.formatCurrency(expense.amount),
            ];
          })
        : [["-", "-", "No expenses recorded", vm.formatCurrency(0)]];
      var previousRows = vm.previousMonthExpenses.length
        ? vm.previousMonthExpenses.map(function (expense) {
            return [
              expense.expenseDate
                ? new Date(expense.expenseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-",
              vm.formatCategory(expense.category),
              expense.title,
              vm.formatCurrency(expense.amount),
            ];
          })
        : [["-", "-", "No expenses recorded", vm.formatCurrency(0)]];

      doc.setFontSize(18);
      doc.text("Expense Report", 14, 18);
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text("User: " + vm.userName, 14, 26);
      doc.text("Compared months: " + currentLabel + " vs " + previousLabel, 14, 32);
      doc.text("Generated: " + generatedOn, 14, 38);

      doc.autoTable({
        startY: 46,
        head: [["Metric", "Value"]],
        body: [
          [currentLabel + " total", vm.formatCurrency(vm.currentMonthTotal)],
          [previousLabel + " total", vm.formatCurrency(vm.previousMonthTotal)],
          ["Month-over-month change", vm.monthOverMonthChange.toFixed(1) + "%"],
          ["Average daily spend", vm.formatCurrency(vm.averageDaily)],
        ],
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 10 },
      });

      var currentExpensesTitleY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(currentLabel + " Expenses", 14, currentExpensesTitleY);
      doc.autoTable({
        startY: currentExpensesTitleY + 4,
        head: [["Date", "Category", "Description", "Amount"]],
        body: currentRows,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });

      var previousExpensesTitleY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(previousLabel + " Expenses", 14, previousExpensesTitleY);
      doc.autoTable({
        startY: previousExpensesTitleY + 4,
        head: [["Date", "Category", "Description", "Amount"]],
        body: previousRows,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });

      doc.save(
        "expense-report-" + vm.currentMonth + "-vs-" + vm.previousMonth + ".pdf",
      );
    };

    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };

    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    vm.selectCurrency = function (currency) {
      vm.currentCurrency = CurrencyService.setCurrentCurrency(currency);
      vm.closeCurrencyDialog();
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
      return category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : "Other";
    };

    loadUser();
    vm.loadReport();
  },
]);
