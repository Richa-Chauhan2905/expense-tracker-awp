app.controller("AdminTicketsController", [
  "ContactService",
  "AuthService",
  "CurrencyService",
  "$location",
  function (ContactService, AuthService, CurrencyService, $location) {
    var vm = this;

    vm.currentPage = "admin-tickets";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.loading = false;
    vm.errorMessage = "";
    vm.userName = "Admin";
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.tickets = [];

    function applyUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "Admin";

      if (user && user.currencyPreference) {
        vm.currentCurrency = CurrencyService.setCurrentCurrencyByCode(
          user.currencyPreference,
        );
      }
    }

    function formatDate(value) {
      if (!value) {
        return "";
      }

      return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }

    function normalizeTicket(ticket) {
      return {
        id: ticket._id,
        name: ticket.name,
        email: ticket.email,
        issueType: ticket.issueType || "general",
        urgency: ticket.urgency || "medium",
        message: ticket.message || "",
        status: ticket.status || "open",
        submittedAt: formatDate(ticket.createdAt),
        submittedBy:
          (ticket.user && ticket.user.fullName) || ticket.name || "Unknown user",
      };
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

    function loadTickets() {
      vm.loading = true;
      vm.errorMessage = "";

      ContactService.getTickets()
        .then(function (response) {
          vm.tickets = (response.data || []).map(normalizeTicket);
        })
        .catch(function (error) {
          vm.errorMessage =
            (error.data && error.data.message) ||
            "Could not load submitted queries.";
        })
        .finally(function () {
          vm.loading = false;
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

    vm.refreshTickets = function () {
      loadTickets();
    };

    vm.prettyLabel = function (value) {
      if (!value) {
        return "";
      }

      return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (letter) {
          return letter.toUpperCase();
        });
    };

    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };

    loadUser();
    loadTickets();
  },
]);
