app.controller("ProfileController", [
  "UserService",
  "AuthService",
  "CurrencyService",
  "$location",
  function (UserService, AuthService, CurrencyService, $location) {
    var vm = this;

    vm.user = AuthService.getCurrentUser();
    vm.currentCurrency = CurrencyService.getCurrentCurrency();
    vm.currencies = CurrencyService.getCurrencies();
    vm.showCurrencyDialog = false;
    vm.updating = false;
    vm.successMessage = "";
    vm.errorMessage = "";

    // Editable copy
    vm.editUser = angular.copy(vm.user);

    // Sync currency preference with edit form
    vm.editUser.currencyPreference = vm.currentCurrency.code;

    // Currency dialog
    vm.openCurrencyDialog = function () {
      vm.showCurrencyDialog = true;
    };
    vm.closeCurrencyDialog = function () {
      vm.showCurrencyDialog = false;
    };
    vm.selectCurrency = function (currency) {
      CurrencyService.setCurrentCurrency(currency);
      vm.currentCurrency = currency;
      vm.editUser.currencyPreference = currency.code;
      // Also update currency on backend
      UserService.updateCurrency(currency.code).catch(function (err) {
        console.error("Currency update failed", err);
      });
      vm.closeCurrencyDialog();
    };

    // Update profile
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
          vm.user = response.data;
          vm.editUser = angular.copy(vm.user);
          vm.editUser.currencyPreference = vm.currentCurrency.code;
          vm.successMessage = "Profile updated successfully!";
        })
        .catch(function (error) {
          vm.errorMessage = error.data?.message || "Update failed";
        })
        .finally(function () {
          vm.updating = false;
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
