app.controller("AuthController", [
  "AuthService",
  "$location",
  function (AuthService, $location) {
    var vm = this;
    vm.isLogin = true;
    vm.isLoading = false;
    vm.currencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "INR",
      "AUD",
      "CAD",
      "CHF",
      "CNY",
      "KRW",
    ];
    vm.loginData = { email: "", password: "" };
    vm.signupData = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      state: "",
      currencyPreference: "INR",
    };
    vm.error = "";
    vm.success = "";

    vm.toggleMode = function () {
      vm.isLogin = !vm.isLogin;
      vm.error = "";
      vm.success = "";
    };

    vm.setMode = function (isLogin) {
      vm.isLogin = isLogin;
      vm.error = "";
      vm.success = "";
    };

    vm.login = function () {
      vm.isLoading = true;
      vm.error = "";

      AuthService.login(vm.loginData)
        .then(function (user) {
          $location.path(user && user.isAdmin ? "/admin-tickets" : "/home");
        })
        .catch(function (err) {
          vm.error =
            err && err.data && err.data.message
              ? err.data.message
              : "Login failed";
        })
        .finally(function () {
          vm.isLoading = false;
        });
    };

    vm.signup = function () {
      vm.isLoading = true;
      vm.error = "";
      vm.success = "";

      if (vm.signupData.password !== vm.signupData.confirmPassword) {
        vm.error = "Passwords do not match";
        vm.isLoading = false;
        return;
      }

      var data = {
        fullName: vm.signupData.fullName,
        email: vm.signupData.email,
        password: vm.signupData.password,
        phone: vm.signupData.phone,
        city: vm.signupData.city,
        state: vm.signupData.state,
        currencyPreference: vm.signupData.currencyPreference,
      };

      AuthService.signup(data)
        .then(function () {
          vm.success = "Account created! Please login.";
          setTimeout(function () {
            vm.setMode(true);
          }, 1500);
        })
        .catch(function (err) {
          vm.error =
            err && err.data && err.data.message
              ? err.data.message
              : "Signup failed";
        })
        .finally(function () {
          vm.isLoading = false;
        });
    };
  },
]);
