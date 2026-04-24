app.service("AuthService", [
  "$http",
  "$q",
  function ($http, $q) {
    var API_BASE = "http://localhost:5000/api/users";
    var currentUser = null;

    this.login = function (credentials) {
      return $http
        .post(API_BASE + "/login", credentials)
        .then(function (res) {
          currentUser = res.data;
          return res.data;
        });
    };

    this.signup = function (userData) {
      return $http.post(API_BASE + "/signup", userData);
    };

    this.logout = function () {
      return $http.post(API_BASE + "/logout").finally(function () {
        currentUser = null;
      });
    };

    this.getCurrentUser = function () {
      return currentUser;
    };

    this.isAuthenticated = function () {
      return !!currentUser;
    };

    this.fetchMe = function () {
      return $http
        .get(API_BASE + "/me")
        .then(function (res) {
          currentUser = res.data;
          return currentUser;
        })
        .catch(function () {
          currentUser = null;
          return $q.reject();
        });
    };
  },
]);
