'use strict';

App.scenes.settings = {
  show: function () {
      var cargoHTML;
      var lardiHTML;
      var authContext = App.scenes.auth;
      var settingsContext = App.scenes.settings;
      var authCargo = authContext.cargoSubmit.bind(authContext, settingsContext.showUnbind);
      var authLardi = authContext.lardiSubmit.bind(authContext, settingsContext.showUnbind);
      var addOrder = _.templates.addOrder({ buttonText: "Вернуться назад" });

      if (App.appData.cargo.token) {
        cargoHTML = _.templates.accountUnbinding(Templates.cargoUnbind);
      } else {
        cargoHTML = _.templates.auth(Templates.cargoLogin);
      }

      if (App.appData.lardi.token) {
        lardiHTML = _.templates.accountUnbinding(Templates.lardiUnbind);
      } else {
        lardiHTML = _.templates.auth(Templates.lardiLogin);
      }

      $('.ce__wrapper').empty().append(cargoHTML + lardiHTML + addOrder);

      if (App.appData.cargo.token) {
        $('#cargoUnbind').bind('click', this.cargoUnbind.bind(settingsContext));
      } else {
        $('#cargoSubmit').bind('click', authCargo);
        $('#cargo_password').bind('keyup', onEnter.bind(null, authCargo));
        authContext.initForm('cargo');
      }

      if (App.appData.lardi.token) {
        $('#lardiUnbind').bind('click', this.lardiUnbind.bind(settingsContext));
      } else {
        $('#lardiSubmit').bind('click', authLardi);
        $('#lardi_password').bind('keyup', onEnter.bind(null, authLardi));
        authContext.initForm('lardi');
      }

      $('#header-message').text('Настройки');
      $('#addOrder').bind('click', function () {
        App.showScene('cargos');
      });
    },

  hide: function () {
      if ($('#cargoSubmit')[0]) {
        $('#cargoSubmit').unbind('click');
        $('#cargo_password').unbind('keyup');
      }

      if ($('#lardiSubmit')[0]) {
        $('#lardiSubmit').unbind('click');
        $('#lardi_password').unbind('keyup');
      }

      if ($('#lardiUnbind')[0]) {
        $('#lardiUnbind').bind('click');
      }

      if ($('#cargoUnbind')[0]) {
        $('#cargoUnbind').bind('click');
      }

      $('#addOrder').unbind('click', function () {
        App.showScene('cargos');
      });

      $('.ce__wrapper').empty();
    },

  cargoUnbind: function () {
    App.removeToken('cargo');
    App.updateAppData();
    App.changeScene('auth');
  },

  lardiUnbind: function () {
    App.removeToken('lardi');
    App.updateAppData();
    this.showLogin('lardi');
  },

  showUnbind: function (key, result) {
    var context = App.scenes.settings;
    if (!key || !result) {
      return false;
    }

    if (result) {
      $('#' + key + 'Login').replaceWith(_.templates.accountUnbinding(Templates[key + 'Unbind']));
      $('#' + key + 'Unbind').bind('click', context[key + 'Unbind'].bind(context));
    } else {
      return false;
    }
  },

  showLogin: function (key) {
    var context = App.scenes.auth;

    $('#' + key + 'Bind').replaceWith(_.templates.auth(Templates[key + 'Login']));
    $('#' + key + 'Submit').bind('click', context[key + 'Submit'].bind(context, this.showUnbind));
    $('#' + key + '_password').bind('keyup', context[key + 'Submit'].bind(context, this.showUnbind));
    context.initForm(key);
  },
};
