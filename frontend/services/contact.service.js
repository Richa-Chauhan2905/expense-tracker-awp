app.service("ContactService", [
  "$http",
  function ($http) {
    var API_BASE = API_ROOT + "/contact/ticket";
    var ADMIN_BASE = API_ROOT + "/contact/tickets";

    this.submitTicket = function (ticketData) {
      return $http.post(API_BASE, ticketData);
    };

    this.getTickets = function () {
      return $http.get(ADMIN_BASE);
    };
  },
]);
