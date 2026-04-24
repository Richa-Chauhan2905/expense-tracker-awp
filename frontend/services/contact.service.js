app.service("ContactService", [
  "$http",
  function ($http) {
    var API_BASE = "http://localhost:5000/api/contact/ticket";

    this.submitTicket = function (ticketData) {
      return $http.post(API_BASE, ticketData);
    };
  },
]);
