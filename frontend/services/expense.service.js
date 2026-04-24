app.service("ExpenseService", [
  "$http",
  function ($http) {
    var API_BASE = "http://localhost:5000/api/expenses";

    this.getByMonth = function (month) {
      return $http.get(API_BASE, { params: { month: month } });
    };

    this.create = function (expenseData) {
      return $http.post(API_BASE, expenseData);
    };

    this.update = function (id, expenseData) {
      return $http.put(API_BASE + "/" + id, expenseData);
    };

    this.delete = function (id) {
      return $http.delete(API_BASE + "/" + id);
    };
  },
]);
