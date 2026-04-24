app.service("ContactService", [
  "$http",
  function ($http) {
    var API_BASE = API_ROOT + "/contact/ticket";

    this.submitTicket = function (ticketData) {
      return $http.post(API_BASE, ticketData);
    };
  },
]);
