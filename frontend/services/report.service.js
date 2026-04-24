app.service("ReportService", [
  "$http",
  function ($http) {
    var API_BASE = API_ROOT + "/reports";

    this.compareMonths = function (currentMonth, previousMonth) {
      return $http.get(API_BASE + "/compare", {
        params: { current: currentMonth, previous: previousMonth },
      });
    };
  },
]);
