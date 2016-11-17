'use strict';

var SM = (function () {
  var sm = {};

  sm.get = function (key) {
    return localStorage.getItem(key);
  };

  sm.put = function (key, data) {
    return localStorage.setItem(key, data);
  };

  sm.delete = function (key) {
    return localStorage.removeItem(key);
  };

  return sm;
}());

var App = (function () {
  var app = {};

  app.scenes = [];

  app.exchanges = {};

  app.saveToken = function (key, data) {
    return SM.put(key + 'Token', data);
  };

  app.getToken = function (key) {
    return SM.get(key + 'Token');
  };

  app.removeToken = function (key) {
    SM.delete(key + 'Token');
  };

  app.saveUserData = function (key, data) {
    SM.put(key + 'Login', data.login);
    SM.put(key + 'Password', data.password);
    SM.put(key + 'Name', data.name);
    SM.put(key + 'ID', data.id);
    SM.put(key + 'CompanyID', data.cid);
    SM.put(key + 'Contact', data.contact);
  };

  app.updateUserData = function (key, variable, data) {
    return SM.put(key + variable, data);
  };

  app.removeUserData = function (key) {
    SM.delete(key + 'Login');
    SM.delete(key + 'Password');
    SM.delete(key + 'Name');
    SM.delete(key + 'ID');
    SM.delete(key + 'CompanyID');
    SM.delete(key + 'Contact');
  };

  app.getUserData = function (key) {
    return {
      login: SM.get(key + 'Login'),
      password: SM.get(key + 'Password'),
      name: SM.get(key + 'Name'),
      id: SM.get(key + 'ID'),
      cid: SM.get(key + 'CompanyID'),
      contact: SM.get(key + 'Contact'),
    };
  };

  app.getWatchedCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'CargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  app.saveWatchedCargos = function (key, array) {
    return SM.put(key + 'CargoIDs', array);
  };

  app.removeWatchedCargos = function (key) {
    SM.delete(key + 'CargoIDs');
  };

  app.getExportedCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'exportedCargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  app.saveExportedCargos = function (key, array) {
    return SM.put(key + 'exportedCargoIDs', array);
  };

  app.removeExportedCargos = function (key) {
    SM.delete(key + 'exportedCargoIDs');
  };

  app.checkRouteButtons = function () {
    $('.current-scene').removeClass('current-scene');

    if (this.checkToken('cargo')) {
      $('#intro').addClass('hidden');
      $('#goCargos').removeClass('hidden');

      if (this.checkToken('lardi')) {
        $('#goCargosList').removeClass('hidden');
      }
    } else {
      $('#intro').removeClass('hidden');
      $('#goCargos').addClass('hidden');
      $('#goCargosList').addClass('hidden');
    }
  };

  app.changeScene = function (scene) {
    if (scene !== 'auth' && !this.checkToken('cargo')) {
      return false;
    }

    this.checkRouteButtons();
    this.loading('Загрузка страницы');
    return this.showScene(scene);
  };

  app.showScene = function (scene) {
    var cur = this.currentScene;
    var newScene = this.scenes[scene];

    if (cur !== newScene) {
      if (!newScene) {
        return console.log('Scene ' + scene + ' doesn\'t exist');
      }

      if (cur) {
        cur.hide;
      }

      newScene.show();
      this.currentScene = newScene;
      this.stopLoading();
    };
  };

  app.tryToRelogin = function (result) {
    function callback(def) {
      return function (key, result) {
        if (!def) {
          return console.error('Relogin deferred not set!');
        }

        if (result) {
          return def.resolve(key + ' authorization success.');
        };

        return def.reject(key + ' authorization failed.');
      };
    }

    var cargoRelogin = $.Deferred();
    var lardiRelogin = $.Deferred();
    var cargoData = this.appData.cargo;
    var lardiData = this.appData.lardi;

    this.removeToken('cargo');
    this.scenes.auth.signIn('cargo', cargoData.login, cargoData.password, callback(cargoRelogin));

    this.removeToken('lardi');
    this.scenes.auth.signIn('lardi', lardiData.login, lardiData.password, callback(lardiRelogin));

    $.when(cargoRelogin.promise(), lardiRelogin.promise()).then(function () {
      result.resolve();
    }, function (err1, err2) {

      result.reject(err1 + ' ' + err2);
    });
  };

  app.doAuth = function () {
    function cargoCB(response) {
      var err = response.error;
      if (err && err.responseJSON) {
        err = err.responseJSON;
        if (err.error && err.error.code) {
          if (err.error.code == '2') {
            return cargoDef.reject('cargo error');
          } else {
            return cargoDef.resolve('ok');
          }
        }
      }

      if (err) {
        return cargoDef.reject(err);
      }

      return cargoDef.resolve();
    }

    function lardiCB(response) {
      var err = response.error;
      if (err) {
        return lardiDef.reject(err);
      }

      var res = XMLtoJson(response.success).response;
      if (res.error && res.error === 'SIG идентификатор устарел или указан не верно') {
        return lardiDef.reject('lardi error');
      }

      return lardiDef.resolve('ok');
    }

    var _this = this;
    var cargoDef = $.Deferred();
    var lardiDef = $.Deferred();
    var checkResult = $.Deferred();
    var random = Math.floor(Math.random() * (999999)) + 99999;
    var cargoTest = {
      to: 'cargo',
      url: 'cargos/' + random,
      type: 'GET',
      headers: {
        'Access-Token': this.appData.cargo.token,
      },
    };
    var lardiTest = {
      to: 'lardi',
      url: '',
      type: 'GET',
      data: {
        method: 'test.sig',
        sig: this.appData.lardi.token,
      },
    };

    if (this.appData.lardi.token) {
      this.sendRequest(lardiTest, lardiCB.bind(this));
    } else {
      lardiDef.resolve('ok');
    }

    this.sendRequest(cargoTest, cargoCB.bind(this));

    $.when(cargoDef, lardiDef).then(
      function (cargoRes, lardiRes) {
        checkResult.resolve();
      },

      function (cargoErr, lardiErr) {
        console.log(cargoErr);
        _this.tryToRelogin(checkResult, [cargoErr, lardiErr]);
      });

    return checkResult.promise();
  };

  app.checkToken = function (key) {
    if (this.appData[key] && this.appData[key].token) {
      return true;
    }

    return false;
  };

  /** Function wrapper to send and get data from server. Used to not
      Cross-Domain requests error.
      @param  {Object}   data      Request object.
      @param  {Function} callback  Callback function.
      @return {object}   response  Response object. Has error and success keys
  */
  app.sendRequest = function (data, callback) {
    if (navigator.userAgent.search(/Gecko/) > -1) {
      chrome.runtime.sendMessage(data, callback);
    }
  };

  app.openTab = function (url) {
    if (navigator.userAgent.search(/Gecko/) > -1) {
      chrome.tabs.create({ url: url });
    }
  };

  app.loading = function (text) {
    if ($('.ce__loading')[0] === undefined) {
      return $('.scene').prepend(_.templates.loading({ text: text }));
    } else {
      $('.ce__loading-text').text(text);
    }

    return $('.ce__loading').show();
  };

  app.stopLoading = function () {
    return $('.ce__loading').hide();
  };

  app.init = function () {
    var _this = this;
    var $cargoDef = $.Deferred();

    setSweetAlertDefaults();

    if (navigator.userAgent.search(/Firefox/) == -1) {
      $(document.body).height('auto');
    }

    this.loading('Проверка авторизации');
    this.updateAppData();
    $('.header-icons .cog-icon').bind('click', function () {
      if (_this.currentScene === _this.scenes.settings) {
        return _this.changeScene('cargos');
      }

      return _this.changeScene('settings');
    });

    $('#goCargos').bind('click', function () {
      _this.changeScene('cargos');
    });

    $('#goCargosList').bind('click', function () {
      _this.changeScene('cargosList');
    });

    $('.header-icons .message-icon').bind('click', App.changeScene.bind(App, 'cargos'));

    if (this.checkToken('cargo')) {
      this.doAuth().then(
        function () {
          var lardi = _this.appData.lardi;
          var $contactSet = $.Deferred();
          var $lardiCountries = $.Deferred();
          var $cargoTypes = App.exchanges.saveCargoTypes();

          if (_this.checkToken('lardi')) {
            if (!lardi.contact) {
              _this.scenes.auth.checkLardiContact(lardi.login, lardi.cid, lardi.token, function (name, id) {
                _this.updateUserData('lardi', 'Name', name);
                _this.updateUserData('lardi', 'ID', id);
                _this.updateAppData();
                $contactSet.resolve();
              });
            } else {
              $contactSet.resolve();
            }

            $lardiCountries = App.exchanges.saveLardiCountries();
          } else {
            $contactSet.resolve('User did not authorize on lardi');
            $lardiCountries.resolve('User did not authorize on lardi');
          }

          $.when($cargoTypes, $contactSet, $lardiCountries).then(
            function () {
              $cargoDef.resolve();
            },
            function (err) {
              $cargoDef.reject(err);
            }
          );
        },
        function (err) {
          _this.updateAppData();
          $cargoDef.reject(err);
        });
    } else {
      $cargoDef.reject('Not authorized');
    }

    $cargoDef.then(function (cargo) {
      _this.changeScene('cargos');
    },
    function (error) {
      console.log(error);
      _this.changeScene('auth');
    }
  );
  };

  app.updateAppData = function () {
    var cargo = app.getUserData('cargo');
    var lardi = app.getUserData('lardi');
    cargo.token = app.getToken('cargo');
    lardi.token = app.getToken('lardi');

    return this.appData = {
      cargo: cargo,
      lardi: lardi,
    };

  };

  return app;
}());

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

var regions = {};
var lardiCountries;
var cargoTypes = [];

$.get('regions.json').then(function (regionsFile) {
  regions = JSON.parse(regionsFile);
});
