var app = angular.module("expenseApp", ["ngRoute"]);
var API_ROOT =
  window.location.protocol + "//" + window.location.hostname + ":5000/api";

app.service("CurrencyService", [
  function () {
    var STORAGE_KEY = "expense-tracker-currency";
    var currencies = [
      { code: "INR", symbol: "Rs", name: "Indian Rupee" },
      { code: "USD", symbol: "$", name: "US Dollar" },
      { code: "EUR", symbol: "EUR", name: "Euro" },
      { code: "GBP", symbol: "GBP", name: "British Pound" },
      { code: "JPY", symbol: "JPY", name: "Japanese Yen" },
      { code: "AUD", symbol: "AUD", name: "Australian Dollar" },
      { code: "CAD", symbol: "CAD", name: "Canadian Dollar" },
      { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
      { code: "CNY", symbol: "CNY", name: "Chinese Yuan" },
      { code: "KRW", symbol: "KRW", name: "South Korean Won" },
    ];

    function findCurrency(code) {
      var match = currencies.find(function (currency) {
        return currency.code === code;
      });

      return match || currencies[0];
    }

    function saveCurrency(currency) {
      localStorage.setItem(STORAGE_KEY, currency.code);
      return currency;
    }

    this.getCurrencies = function () {
      return currencies;
    };

    this.getCurrentCurrency = function () {
      return findCurrency(localStorage.getItem(STORAGE_KEY));
    };

    this.setCurrentCurrency = function (currency) {
      return saveCurrency(findCurrency(currency && currency.code));
    };

    this.setCurrentCurrencyByCode = function (code) {
      return saveCurrency(findCurrency(code));
    };

    this.formatAmount = function (amount, code) {
      var numericAmount = Number(amount) || 0;
      return findCurrency(code).symbol + numericAmount.toFixed(2);
    };
  },
]);

// Always send cookies (JWT) with every request
app.config([
  "$httpProvider",
  function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
  },
]);

// Interceptor to handle 401 Unauthorized -> redirect to login
app.config([
  "$httpProvider",
  function ($httpProvider) {
    $httpProvider.interceptors.push([
      "$q",
      "$location",
      function ($q, $location) {
        return {
          responseError: function (rejection) {
            if (rejection.status === 401) {
              $location.path("/login");
            }
            return $q.reject(rejection);
          },
        };
      },
    ]);
  },
]);

// Routes (using ngRoute)
app.config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/login", {
        templateUrl: "partials/auth.html",
        controller: "AuthController",
        controllerAs: "auth",
      })
      .when("/home", {
        templateUrl: "partials/home.html",
        controller: "HomeController",
        controllerAs: "vm",
      })
      .when("/manage-expenses", {
        templateUrl: "partials/manage-expenses.html",
        controller: "ManageExpensesController",
        controllerAs: "vm",
      })
      .when("/expenses", {
        templateUrl: "partials/manage-expenses.html",
        controller: "ManageExpensesController",
        controllerAs: "vm",
      })
      .when("/expense-report", {
        templateUrl: "partials/reports.html",
        controller: "ExpenseReportController",
        controllerAs: "vm",
      })
      .when("/reports", {
        templateUrl: "partials/reports.html",
        controller: "ExpenseReportController",
        controllerAs: "vm",
      })
      .when("/profile", {
        templateUrl: "partials/profile.html",
        controller: "ProfileController",
        controllerAs: "vm",
      })
      .when("/contact", {
        templateUrl: "partials/contact.html",
        controller: "ContactController",
        controllerAs: "vm",
      })
      .when("/admin-tickets", {
        templateUrl: "partials/admin-tickets.html",
        controller: "AdminTicketsController",
        controllerAs: "vm",
      })
      .when("/admin-users", {
        templateUrl: "partials/admin-users.html",
        controller: "AdminUsersController",
        controllerAs: "vm",
      })
      .otherwise({ redirectTo: "/login" });
  },
]);

// Run block to check authentication on app start
app.run([
  "$rootScope",
  "$location",
  "AuthService",
  function ($rootScope, $location, AuthService) {
    var adminRoutes = {
      "/admin-tickets": true,
      "/admin-users": true,
    };

    function isAdminRoute(path) {
      return !!adminRoutes[path];
    }

    $rootScope.goTo = function (path) {
      $location.path(path);
    };

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
      if (!next || next.originalPath === "/login") {
        return;
      }

      if (!AuthService.isAuthenticated()) {
        event.preventDefault();
        AuthService.fetchMe()
          .then(function (user) {
            if (user && user.isAdmin && !isAdminRoute(next.originalPath)) {
              $location.path("/admin-tickets");
              return;
            }

            if (user && !user.isAdmin && isAdminRoute(next.originalPath)) {
              $location.path("/home");
              return;
            }

            $location.path(next.originalPath);
          })
          .catch(function () {
            $location.path("/login");
          });
      } else {
        var currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.isAdmin && !isAdminRoute(next.originalPath)) {
          event.preventDefault();
          $location.path("/admin-tickets");
        } else if (currentUser && !currentUser.isAdmin && isAdminRoute(next.originalPath)) {
          event.preventDefault();
          $location.path("/home");
        }
      }
    });
  },
]);
