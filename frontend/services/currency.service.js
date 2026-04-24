app.service("CurrencyService", [
  function () {
    var STORAGE_KEY = "expense-tracker-currency";
    var currencies = [
      { code: "INR", symbol: "Rs", name: "Indian Rupee" },
      { code: "USD", symbol: "$", name: "US Dollar" },
      { code: "EUR", symbol: "EUR", name: "Euro" },
      { code: "GBP", symbol: "GBP", name: "British Pound" },
      { code: "JPY", symbol: "JPY", name: "Japanese Yen" },
      { code: "AUD", symbol: "AUD", name: "Australian Dollar" },
      { code: "CAD", symbol: "CAD", name: "Canadian Dollar" },
      { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
      { code: "CNY", symbol: "CNY", name: "Chinese Yuan" },
      { code: "KRW", symbol: "KRW", name: "South Korean Won" },
    ];

    function findCurrency(code) {
      return (
        currencies.find(function (currency) {
          return currency.code === code;
        }) || currencies[0]
      );
    }

    function saveCurrency(currency) {
      localStorage.setItem(STORAGE_KEY, currency.code);
      return currency;
    }

    this.getCurrencies = function () {
      return currencies;
    };

    this.getCurrentCurrency = function () {
      var storedCode = localStorage.getItem(STORAGE_KEY);
      return findCurrency(storedCode);
    };

    this.setCurrentCurrency = function (currency) {
      return saveCurrency(findCurrency(currency && currency.code));
    };

    this.setCurrentCurrencyByCode = function (code) {
      return saveCurrency(findCurrency(code));
    };

    this.formatAmount = function (amount, code) {
      var currency = findCurrency(code);
      var numericAmount = Number(amount) || 0;
      return currency.symbol + numericAmount.toFixed(2);
    };
  },
]);
