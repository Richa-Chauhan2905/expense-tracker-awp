app.controller("ContactController", [
  "ContactService",
  "AuthService",
  "CurrencyService",
  "$location",
  function (ContactService, AuthService, CurrencyService, $location) {
    var vm = this;

    vm.currentPage = "contact";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.sending = false;
    vm.successMessage = "";
    vm.errorMessage = "";
    vm.userName = "User";
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.ticket = {
      name: "",
      email: "",
      issueType: "general",
      urgency: "medium",
      message: "",
    };

    function applyUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "User";
      vm.ticket.name = user && user.fullName ? user.fullName : "";
      vm.ticket.email = user && user.email ? user.email : "";

      if (user && user.currencyPreference) {
        vm.currentCurrency = CurrencyService.setCurrentCurrencyByCode(
          user.currencyPreference,
        );
      }
    }

    function loadUser() {
      var currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        applyUser(currentUser);
      }

      return AuthService.fetchMe()
        .then(function (user) {
          applyUser(user);
        })
        .catch(function () {
          if (!currentUser) {
            $location.path("/login");
          }
        });
    }

    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };

    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
      vm.showCurrencyDialog = false;
    };

    vm.selectCurrency = function (currency) {
      vm.currentCurrency = CurrencyService.setCurrentCurrency(currency);
      vm.closeCurrencyDialog();
    };

    vm.sendMessage = function () {
      vm.sending = true;
      vm.errorMessage = "";
      vm.successMessage = "";

      ContactService.submitTicket({
        name: vm.ticket.name,
        email: vm.ticket.email,
        issueType: vm.ticket.issueType,
        urgency: vm.ticket.urgency,
        message: vm.ticket.message,
      })
        .then(function (response) {
          vm.successMessage =
            response.data.message || "Ticket submitted successfully!";
          vm.ticket.issueType = "general";
          vm.ticket.urgency = "medium";
          vm.ticket.message = "";
        })
        .catch(function (error) {
          vm.errorMessage =
            (error.data && error.data.message) ||
            "Failed to submit ticket. Please try again.";
        })
        .finally(function () {
          vm.sending = false;
        });
    };

    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };

    loadUser();
  },
]);
