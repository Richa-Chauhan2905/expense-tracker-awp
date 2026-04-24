app.controller("ProfileController", [
  "UserService",
  "AuthService",
  "CurrencyService",
  "$location",
  function (UserService, AuthService, CurrencyService, $location) {
    var vm = this;

    vm.currentPage = "profile";
    vm.sidebarOpen = false;
    vm.showCurrencyDialog = false;
    vm.updating = false;
    vm.successMessage = "";
    vm.errorMessage = "";
    vm.user = null;
    vm.userName = "User";
    vm.avatarLetter = "U";
    vm.memberSince = null;
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.editUser = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      currencyPreference: vm.currentCurrency.code,
    };

    function setUser(user) {
      vm.user = user || null;
      vm.userName = user && user.fullName ? user.fullName : "User";
      vm.avatarLetter = vm.userName.charAt(0).toUpperCase();
      vm.memberSince = user && user.createdAt ? new Date(user.createdAt) : null;
      vm.editUser = {
        fullName: user && user.fullName ? user.fullName : "",
        email: user && user.email ? user.email : "",
        phone: user && user.phone ? user.phone : "",
        address: user && user.address ? user.address : "",
        city: user && user.city ? user.city : "",
        state: user && user.state ? user.state : "",
        currencyPreference:
          user && user.currencyPreference
            ? user.currencyPreference
            : vm.currentCurrency.code,
      };

      if (user && user.currencyPreference) {
        vm.currentCurrency = CurrencyService.setCurrentCurrencyByCode(
          user.currencyPreference,
        );
      }
    }

    function loadUser() {
      var currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      return AuthService.fetchMe()
        .then(function (user) {
          setUser(user);
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
      vm.editUser.currencyPreference = currency.code;

      UserService.updateCurrency(currency.code).then(function () {
        if (vm.user) {
          vm.user.currencyPreference = currency.code;
        }
      });

      vm.closeCurrencyDialog();
    };

    vm.updateProfile = function () {
      vm.updating = true;
      vm.successMessage = "";
      vm.errorMessage = "";

      var profileData = {
        fullName: vm.editUser.fullName,
        email: vm.editUser.email,
        phone: vm.editUser.phone || "",
        address: vm.editUser.address || "",
        city: vm.editUser.city || "",
        state: vm.editUser.state || "",
      };

      UserService.updateProfile(profileData)
        .then(function (response) {
          setUser(response.data);
          if (
            vm.editUser.currencyPreference &&
            vm.editUser.currencyPreference !== vm.currentCurrency.code
          ) {
            vm.currentCurrency = CurrencyService.setCurrentCurrencyByCode(
              vm.editUser.currencyPreference,
            );
          }
          return UserService.updateCurrency(vm.editUser.currencyPreference);
        })
        .then(function () {
          vm.successMessage = "Profile updated successfully!";
        })
        .catch(function (error) {
          vm.errorMessage =
            (error.data && error.data.message) || "Update failed";
        })
        .finally(function () {
          vm.updating = false;
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
