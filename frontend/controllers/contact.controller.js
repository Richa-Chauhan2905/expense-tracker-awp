app.controller("ContactController", [
  "ContactService",
  "AuthService",
  "CurrencyService",
  "$location",
  function (ContactService, AuthService, CurrencyService, $location) {
    var vm = this;

    vm.user = AuthService.getCurrentUser();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.showCurrencyDialog = false;

    // Form data
    vm.ticket = {
      name: vm.user ? vm.user.fullName : "",
      email: vm.user ? vm.user.email : "",
      issueType: "general",
      urgency: "medium",
      message: "",
    };
    vm.sending = false;
    vm.successMessage = "";
    vm.errorMessage = "";

    // Currency dialog methods
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.closeCurrencyDialog();
    };

    // Submit contact ticket
    vm.sendMessage = function () {
      vm.sending = true;
      vm.errorMessage = "";
      vm.successMessage = "";

      var ticketData = {
        name: vm.ticket.name,
        email: vm.ticket.email,
        issueType: vm.ticket.issueType,
        urgency: vm.ticket.urgency,
        message: vm.ticket.message,
      };

      ContactService.submitTicket(ticketData)
        .then(function (response) {
          vm.successMessage =
            response.data.message || "Ticket submitted successfully!";
          // Reset form
          vm.ticket = {
            name: vm.user ? vm.user.fullName : "",
            email: vm.user ? vm.user.email : "",
            issueType: "general",
            urgency: "medium",
            message: "",
          };
        })
        .catch(function (error) {
          vm.errorMessage =
            error.data?.message || "Failed to submit ticket. Please try again.";
        })
        .finally(function () {
          vm.sending = false;
        });
    };

    // Logout
    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };
  },
]);
