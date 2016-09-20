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
  };

  app.removeUserData = function (key) {
    SM.delete(key + 'Login');
    SM.delete(key + 'Password');
    SM.delete(key + 'Name');
    SM.delete(key + 'ID');
  };

  app.getUserData = function (key) {
    return {
      login: SM.get(key + 'Login'),
      password: SM.get(key + 'Password'),
      name: SM.get(key + 'Name'),
      id: SM.put(key + 'ID'),
    };
  };

  app.changeScene = function (scene) {
    if (scene !== 'auth' && !this.checkToken()) {
      return false;
    }

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

    $.when(cargoRelogin.promise(), lardiRelogin.promise()).then(
      function () {
        result.resolve();
      },

      function (err1, err2) {
        result.reject(err1 + ' ' + err2);
      }
    );
  };

  app.checkAuth = function () {
    function cargoCB(err, res) {
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

    function lardiCB(err, res) {
      if (err) {
        return lardiDef.reject(err);
      }

      res = XMLtoJson(res);
      if (res.response.error &&
        res.response.error._text === 'SIG идентификатор устарел или указан не верно') {
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
      headers: { 'Access-Token': this.appData.cargo.token },
    };
    var lardiTest = {
      to: 'lardi',
      url: '',
      type: 'GET',
      data: { method: 'my.gruz.list', sig: this.appData.lardi.token },
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
        console.warn('relogin called');
        _this.tryToRelogin(checkResult, [cargoErr, lardiErr]);
      });

    return checkResult.promise();
  };

  app.checkToken = function () {
    if (!this.appData.cargo.token) {
      return false;
    }

    return true;
  };

  app.sendRequest = function (data, callback) {
    var reqParams = {
      url: '',
      type: '',
      data: '',
      crossDomain: true,
      dataType: '',
      contentType: '',
      headers: {},
      success: function (response) {
        callback(null, response);
      },

      error: function (error) {
        if (error.status === 200) {
          return callback(null, error.responseText);
        }

        callback(error);
      },
    };

    if (!data || !data.to || (data.to === 'cargo' && !data.url)) {
      return callback('Invalid data to send');
    }

    switch (data.to){
      case 'lardi':
        reqParams.dataType = 'x-www-form-urlencoded';
        reqParams.contentType = 'xml';
        reqParams.url = 'https://io-dev.cargo.lt/lardi';
        reqParams.data = data.data;
        break;
      case 'cargo':
        reqParams.dataType = 'json';
        reqParams.contentType = 'application/json';
        reqParams.url = 'https://io-dev.cargo.lt/' + data.url;
        reqParams.data = JSON.stringify(data.data);
        break;
      default:
        return callback('Unknown request target');
    }
    reqParams.type = data.type;
    reqParams.headers = data.headers ? data.headers : {};

    $.ajax(reqParams);

    // if (navigator.userAgent.search(/Chrome/) > -1) {
    //   chrome.runtime.sendMessage(data, callback);
    // }

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
    this.loading('Проверка авторизации');
    this.updateAppData();
    $('.header-icons .glyphicon-cog').bind('click', App.changeScene.bind(App, 'settings'));

    if (this.checkToken()) {
      this.checkAuth().then(
        function () {
          _this.changeScene('settings');
        },

        function (err) {
          console.warn(err);
          _this.updateAppData();
          _this.changeScene('auth');
        });
    } else {
      this.changeScene('auth');
    }
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

function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

var x2js = new X2JS();
