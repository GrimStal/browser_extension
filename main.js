'use strict';

var App = (function () {
  var app = {};

  app.scenes = [];

  app.exchanges = {};

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
      this.checkRouteButtons();
    };
    this.stopLoading();
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

    SMData.removeToken('cargo');
    this.scenes.auth.signIn('cargo', cargoData.login, cargoData.password, callback(cargoRelogin));

    SMData.removeToken('lardi');
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
      if (err && 'responseJSON' in err) {
        err = err.responseJSON;
        if (err.error && 'code' in err.error) {
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

    var self = this;
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
        self.tryToRelogin(checkResult, [cargoErr, lardiErr]);
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
      @return {object}   response  Response object. Has "error" and "success" keys
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
    var self = this;
    var $cargoDef = $.Deferred();

    setSweetAlertDefaults();

    if (navigator.userAgent.search(/Firefox/) == -1) {
      $(document.body).height('auto');
    }

    this.loading('Проверка авторизации');
    this.updateAppData();
    $('.header-icons .cog-icon').bind('click', function () {
      if (self.currentScene === self.scenes.settings) {
        return self.changeScene('cargos');
      }

      return self.changeScene('settings');
    });

    $('#goCargos').bind('click', function () {
      self.changeScene('cargos');
    });

    $('#goCargosList').bind('click', function () {
      self.changeScene('cargosList');
    });

    $('.header-icons .message-icon').bind('click', App.changeScene.bind(App, 'cargos'));

    if (this.checkToken('cargo')) {
      this.doAuth().then(
        function () {
          var lardi = self.appData.lardi;
          var $contactSet = $.Deferred();
          var $lardiCountries = $.Deferred();
          var $cargoTypes = App.exchanges.saveCargoTypes();

          if (self.checkToken('lardi')) {
            if (!lardi.contact) {
              self.scenes.auth.checkLardiContact(lardi.login, lardi.cid, lardi.token, function (name, id) {
                SMData.updateUserData('lardi', 'Name', name);
                SMData.updateUserData('lardi', 'ID', id);
                self.updateAppData();
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
          self.updateAppData();
          $cargoDef.reject(err);
        });
    } else {
      $cargoDef.reject('Not authorized');
    }

    $cargoDef.then(function (cargo) {
        self.changeScene('cargos');
      },
      function (error) {
        console.log(error);
        self.changeScene('auth');
      }
    );
  };

  app.updateAppData = function () {
    var cargo = SMData.getUserData('cargo');
    var lardi = SMData.getUserData('lardi');
    cargo.token = SMData.getToken('cargo');
    lardi.token = SMData.getToken('lardi');

    return this.appData = {
      cargo: cargo,
      lardi: lardi,
    };

  };

  app.exportPort = chrome.runtime.connect({ name: 'export' });
  app.addPort = chrome.runtime.connect({ name: 'add' });

  app.exportPort.onMessage.addListener(function (msg) {
    if (!msg || typeof msg !== 'object') {
      console.log('Object not set: msg');
      return false;
    }

    if ('sended' in msg && typeof msg.sended === 'object') {
      if ('ids' in msg.sended && msg.sended.ids.length > 0) {
        if (app.currentScene === app.scenes.cargosList) {
          app.currentScene.markCargos.apply(app.currentScene, msg.sended.ids);
        }
        $('#status').text('Экспорт: ' + (msg.sended.of - msg.sended.left) + ' из ' + msg.sended.of);
        $('#status').parent().find('.loading-gif').show();
      }
    } else if ('done' in msg) {
      if (app.currentScene === app.scenes.cargosList) {
        app.currentScene.enableExport.call(app.currentScene, !msg.done);
      }
      if ('show' in msg && msg.show) {
        $('#status').parent().find('.loading-gif').hide();
        if ('errored' in msg && 'of' in msg && msg.errored) {
          $('#status').text('Экспортировано ' + (msg.of - msg.errored) + ' из ' + msg.of + ' грузов');
        } else {
          $('#status').text('Грузы экспортированы');
        }
      }
    } else if ('error' in msg && msg.error) {
      swal('Ошибка', msg.error);
    }
  });

  app.addPort.onMessage.addListener(function (msg) {
    var message;
    var title;
    var success = false;

    if (!msg || typeof msg !== 'object') {
      console.log('Object not set: msg');
      return false;
    }

    if ('sended' in msg && typeof msg.sended === 'object') {
      if (!('cargo' in msg.sended) || !('lardi' in msg.sended)) {
        console.log('Invalid data in message');
        return false;
      }
      if (!msg.sended.cargo.success && !msg.sended.lardi.success) {
        title = 'Ошибка';
        message = 'Данные не отправлены';
        success = false;
        if (msg.sended.cargo.error) {
          message +=  '\nCargo.lt: ' + msg.sended.cargo.error;
        }
        if (msg.sended.lardi.error) {
          message +=  '\nLardi-Trans: ' + msg.sended.lardi.error;
        }
      } else {
        title = 'Данные отправлены';
        message = 'Данные успешно отправлены на ';
        success = true;
        if (msg.sended.cargo.success && msg.sended.lardi.success) {
          message += ' Cargo.lt и Lardi-Trans';
        } else if (msg.sended.cargo.success) {
          message += ' Cargo.lt' + (msg.sended.lardi.error ? '\nLardi-Trans: ' + msg.sended.lardi.error : '');
        } else if (msg.sended.lardi.success) {
          message += ' Lardi-Trans' + (msg.sended.cargo.error ? '\nCargo: ' + msg.sended.cargo.error : '');
        }
      }

      swal({
        title: title,
        text: message,
        imageUrl: (success ? '/css/images/success.png' : '/css/images/error.png'),
        confirmButtonText: 'Добавить новый груз'
      });

      if (App.currentScene === App.scenes.cargos) {
        App.scenes.cargos.clearForm.call(App.scenes.cargos);
        App.stopLoading();
      }
    } else if ('error' in msg && msg.error) {
      swal('Ошибка', msg.error);
    }
  });

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

window.onunload = function () {
  if (App) {
    App.exportPort.disconnect();
    App.addPort.disconnect();
  }
};
