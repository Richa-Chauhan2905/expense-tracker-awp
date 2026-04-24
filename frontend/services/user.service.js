app.service("UserService", [
  "$http",
  function ($http) {
    var API_BASE = "http://localhost:5000/api/users";

    this.updateProfile = function (profileData) {
      return $http.put(API_BASE + "/profile", profileData);
    };

    this.updateCurrency = function (currencyCode) {
      return $http.put(API_BASE + "/currency", {
        currencyPreference: currencyCode,
      });
    };
  },
]);
