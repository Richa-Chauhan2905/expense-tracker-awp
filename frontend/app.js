var app = angular.module("expenseApp", ["ngRoute"]);

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
        controllerAs: "home",
      })
      .when("/expenses", {
        templateUrl: "partials/manage-expenses.html",
        controller: "ManageExpensesController",
        controllerAs: "vm",
      })
      .when("/reports", {
        templateUrl: "partials/reports.html",
        controller: "ExpenseReportController",
        controllerAs: "report",
      })
      .when("/profile", {
        templateUrl: "partials/profile.html",
        controller: "ProfileController",
        controllerAs: "profile",
      })
      .when("/contact", {
        templateUrl: "partials/contact.html",
        controller: "ContactController",
        controllerAs: "contact",
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
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
      if (!AuthService.isAuthenticated() && next.originalPath !== "/login") {
        $location.path("/login");
      }
    });
  },
]);
