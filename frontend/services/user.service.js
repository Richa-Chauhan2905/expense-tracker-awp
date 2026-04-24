app.service("UserService", [
  "$http",
  function ($http) {
    var API_BASE = API_ROOT + "/users";

    this.updateProfile = function (profileData) {
      return $http.put(API_BASE + "/profile", profileData);
    };

    this.updateCurrency = function (currencyCode) {
      return $http.put(API_BASE + "/currency", {
        currencyPreference: currencyCode,
      });
    };

    this.getAllUsers = function () {
      return $http.get(API_BASE + "/admin/all");
    };
  },
]);
