app.service("ReportService", [
  "$http",
  function ($http) {
    var API_BASE = "http://localhost:5000/api/reports";

    this.compareMonths = function (currentMonth, previousMonth) {
      return $http.get(API_BASE + "/compare", {
        params: { current: currentMonth, previous: previousMonth },
      });
    };
  },
]);
