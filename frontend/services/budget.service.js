app.service("BudgetService", [
  "$http",
  function ($http) {
    var API_BASE = "http://localhost:5000/api/budget";

    this.get = function (month) {
      return $http.get(API_BASE, { params: { month: month } });
    };

    this.set = function (month, amount) {
      return $http.put(API_BASE, { month: month, amount: amount });
    };
  },
]);
