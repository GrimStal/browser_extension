'use strict';

App.exchanges = {
  getDataFromServer: function (req) {
    var result = $.Deferred();

    App.sendRequest(req, function (response) {
      if (response.error) {
        return result.reject(response.error);
      }

      return result.resolve(response.success);
    });

    return result.promise();
  },

  getCargoTypes: function () {
    var req = new Request('cargo', 'GET', 'cargoTypes');
    return this.getDataFromServer(req);
  },

  getTrailerTypes: function () {
    var req = new Request('cargo', 'GET', 'trailerTypes');
    return this.getDataFromServer(req);
  },

  getCurrencies: function () {
    var req = new Request('cargo', 'GET', 'currencies');
    return this.getDataFromServer(req);
  },

  getLocations: function (name) {
    var req = new Request('cargo', 'GET', 'locations');
    req.headers = {
      'Access-Token': App.appData.cargo.token,
    };
    req.data = {
      name: name,
    };
    return this.getDataFromServer(req);
  },

  getLardiPaymentMoments: function () {
    var def = $.Deferred();
    var req = new Request('lardi', 'POST');

    if (!App.appData.lardi.token) {
      def.reject('Lardi not authorized');
      return def.promise();
    } else {
      req.data = {
        method: 'get.payment.moment.ref',
        sig: App.appData.lardi.token,
      };
      return this.getDataFromServer(req);
    }
  },

  getLardiLoadTypes: function () {
    var def = $.Deferred();
    var req = new Request('lardi', 'POST');

    if (!App.appData.lardi.token) {
      def.reject('Lardi not authorized');
      return def.promise();
    } else {
      req.data = {
        method: 'base.zagruz',
        sig: App.appData.lardi.token,
      };
      return this.getDataFromServer(req);
    }
  },

  getLardiBodyTypes: function () {
    var def = $.Deferred();
    var req = new Request('lardi', 'POST');

    if (!App.appData.lardi.token) {
      def.reject('Lardi not authorized');
      return def.promise();
    } else {
      req.data = {
        method: 'body.type.group',
        sig: App.appData.lardi.token,
      };
      return this.getDataFromServer(req);
    }
  },

  getLardiCountries: function () {
    var def = $.Deferred();
    var req = new Request('lardi', 'POST');

    if (!App.appData.lardi.token) {
      def.reject('Lardi not authorized');
      return def.promise();
    } else {
      req.data = {
        method: 'base.country',
        sig: App.appData.lardi.token,
      };
      return this.getDataFromServer(req);
    }
  },

  getCountryCode: function (name) {
    var req = new Request('countries', 'GET');
    req.url = encodeURIComponent(name);
    return this.getDataFromServer(req);
  },

  saveLardiCountries: function () {
    var def = $.Deferred();
    App.exchanges.getLardiCountries().then(
      function (countries) {
        lardiCountries = XMLtoJson(countries).response.item || [];
        def.resolve();
      },
      function (err) {
        def.reject(err);
      }
    );
    return def.promise();
  }
};
