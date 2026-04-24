app.controller("AdminTicketsController", [
  "ContactService",
  "AuthService",
  "$location",
  function (ContactService, AuthService, $location) {
    var vm = this;

    vm.currentPage = "admin-tickets";
    vm.sidebarOpen = false;
    vm.loading = false;
    vm.errorMessage = "";
    vm.successMessage = "";
    vm.userName = "Admin";
    vm.accessDenied = false;
    vm.tickets = [];
    vm.replyDrafts = {};
    vm.replyingTicketId = null;

    function applyUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "Admin";
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
        adminReply: ticket.adminReply || "",
        repliedAt: formatDate(ticket.repliedAt),
        repliedBy:
          (ticket.repliedBy && ticket.repliedBy.fullName) || "Admin",
      };
    }

    function loadTickets() {
      if (!vm.user || !vm.user.isAdmin) {
        vm.loading = false;
        vm.accessDenied = true;
        vm.errorMessage = "Admin access required.";
        return;
      }

      vm.loading = true;
      vm.errorMessage = "";
      vm.successMessage = "";
      vm.accessDenied = false;

      ContactService.getTickets()
        .then(function (response) {
          vm.tickets = (response.data || []).map(normalizeTicket);
          vm.tickets.forEach(function (ticket) {
            vm.replyDrafts[ticket.id] = ticket.adminReply || "";
          });
        })
        .catch(function (error) {
          if (error.status === 403) {
            vm.accessDenied = true;
          }
          vm.errorMessage =
            (error.data && error.data.message) ||
            "Could not load submitted queries.";
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function loadUser() {
      var currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        applyUser(currentUser);
        if (currentUser.isAdmin) {
          loadTickets();
          return;
        }
      }

      return AuthService.fetchMe()
        .then(function (user) {
          applyUser(user);
          if (!user.isAdmin) {
            vm.accessDenied = true;
            vm.errorMessage = "Admin access required.";
            $location.path("/login");
            return;
          }
          loadTickets();
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

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
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

    vm.replyToTicket = function (ticket) {
      var reply = vm.replyDrafts[ticket.id];
      if (!reply || !reply.trim()) {
        vm.errorMessage = "Reply message is required.";
        vm.successMessage = "";
        return;
      }

      vm.replyingTicketId = ticket.id;
      vm.errorMessage = "";
      vm.successMessage = "";

      ContactService.replyToTicket(ticket.id, {
        adminReply: reply,
        status: "resolved",
      })
        .then(function () {
          vm.successMessage = "Reply saved successfully.";
          loadTickets();
        })
        .catch(function (error) {
          vm.errorMessage =
            (error.data && error.data.message) || "Could not save reply.";
        })
        .finally(function () {
          vm.replyingTicketId = null;
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
