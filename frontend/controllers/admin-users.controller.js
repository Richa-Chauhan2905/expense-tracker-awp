app.controller("AdminUsersController", [
  "UserService",
  "AuthService",
  "$location",
  function (UserService, AuthService, $location) {
    var vm = this;

    vm.currentPage = "admin-users";
    vm.sidebarOpen = false;
    vm.loading = false;
    vm.errorMessage = "";
    vm.userName = "Admin";
    vm.users = [];

    function formatDate(value) {
      if (!value) {
        return "";
      }

      return new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    function applyUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "Admin";
    }

    function normalizeUser(user) {
      return {
        id: user._id,
        fullName: user.fullName || "Unknown User",
        email: user.email || "",
        phone: user.phone || "-",
        city: user.city || "-",
        state: user.state || "-",
        currencyPreference: user.currencyPreference || "INR",
        createdAt: formatDate(user.createdAt),
        isAdmin: !!user.isAdmin,
      };
    }

    function loadUsers() {
      if (!vm.user || !vm.user.isAdmin) {
        vm.errorMessage = "Admin access required.";
        return;
      }

      vm.loading = true;
      vm.errorMessage = "";

      UserService.getAllUsers()
        .then(function (response) {
          vm.users = (response.data || []).map(normalizeUser);
        })
        .catch(function (error) {
          vm.errorMessage =
            (error.data && error.data.message) || "Could not load users.";
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
          loadUsers();
          return;
        }
      }

      AuthService.fetchMe()
        .then(function (user) {
          applyUser(user);
          if (!user.isAdmin) {
            $location.path("/login");
            return;
          }
          loadUsers();
        })
        .catch(function () {
          $location.path("/login");
        });
    }

    vm.toggleSidebar = function () {
      vm.sidebarOpen = !vm.sidebarOpen;
    };

    vm.closeAllModals = function () {
      vm.sidebarOpen = false;
    };

    vm.refreshUsers = function () {
      loadUsers();
    };

    vm.logout = function () {
      AuthService.logout().finally(function () {
        $location.path("/login");
      });
    };

    loadUser();
  },
]);
