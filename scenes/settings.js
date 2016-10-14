'use strict';

App.scenes.settings = {
  show: function () {
      var _this = this;
      var cargoHTML;
      var lardiHTML;
      var authContext = App.scenes.auth;
      var settingsContext = App.scenes.settings;
      var cargoData = App.appData.cargo;
      var lardiData = App.appData.lardi;
      var authCargo = authContext.cargoSubmit.bind(authContext, settingsContext.showUnbind);
      var authLardi = authContext.lardiSubmit.bind(authContext, settingsContext.showUnbind);
      var addOrder = _.templates.addOrder({ buttonText: "Вернуться назад" });
      var cargoBinds = cloneObj(Templates.cargoUnbind);
      var lardiBinds = cloneObj(Templates.lardiUnbind);
      var cargoDef = $.Deferred();
      var lardiDef = $.Deferred();

      if (cargoData.token) {
        cargoBinds.fields[0].value = cargoData.login;
        cargoBinds.fields[1].value = cargoData.name;
        cargoHTML = _.templates.accountUnbinding(cargoBinds);
        cargoDef.resolve();
      } else {
        cargoHTML = _.templates.auth(Templates.cargoBinds);
        cargoDef.resolve();
      }

      if (lardiData.token) {
        lardiBinds.fields[0].value = lardiData.login;
        lardiBinds.fields[1].default = lardiData.id;
        App.scenes.auth.getLardiUsersData(lardiData.cid, lardiData.token, function(array) {
          lardiBinds.fields[1].users = array;
          lardiHTML = _.templates.accountUnbinding(lardiBinds);
          lardiDef.resolve();
        });
      } else {
        lardiHTML = _.templates.auth(Templates.lardiLogin);
        lardiDef.resolve();
      }

      $.when(cargoDef, lardiDef).always(function(){
        $('.ce__wrapper').empty().append(cargoHTML + lardiHTML + addOrder);

        if (cargoData.token) {
          $('#cargoUnbind').bind('click', _this.cargoUnbind.bind(settingsContext));
        } else {
          $('#cargoSubmit').bind('click', authCargo);
          $('#cargo_password').bind('keyup', onEnter.bind(null, authCargo));
          authContext.initForm('cargo');
        }

        if (lardiData.token) {
          $('#lardiUnbind').bind('click', _this.lardiUnbind.bind(_this));
          $('#lardi_contact_name').bind('change', _this.resetLardiContact.bind(_this));
        } else {
          $('#lardiSubmit').bind('click', authLardi);
          $('#lardi_password').bind('keyup', onEnter.bind(null, authLardi));
          authContext.initForm('lardi');
        }

        $('#header-message').text('Настройки');
        $('#addOrder').bind('click', function () {
          App.showScene('cargos');
        });

        $('#addOrder').addClass('white');
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
        $('#lardiUnbind').unbind('click');
      }

      if ($('#cargoUnbind')[0]) {
        $('#cargoUnbind').unbind('click');
      }

      if ($('#lardi_contact_name')[0]) {
        $('#lardi_contact_name').unbind('change');
      }

      $('#addOrder').unbind('click', function () {
        App.showScene('cargos');
      });

      $('.ce__wrapper').empty();
    },

  cargoUnbind: function () {
    App.removeToken('cargo');
    App.removeUserData('cargo');
    App.updateAppData();
    App.changeScene('auth');
  },

  lardiUnbind: function () {
    App.removeToken('lardi');
    App.removeUserData('lardi');
    App.updateAppData();
    this.showLogin('lardi');
  },

  showUnbind: function (key, result) {
    var context = App.scenes.settings;
    var binds = cloneObj(Templates[key + 'Unbind']);
    var data = App.appData[key];
    var def = $.Deferred();
    if (!key || !result) {
      return false;
    }

    if (result) {
      if (key === 'cargo') {
        binds.fields[0].value = data.login;
        binds.fields[1].value = data.name;
        def.resolve();
      } else if (key === 'lardi') {
        binds.fields[0].value = data.login;
        binds.fields[1].default = data.id;
        App.scenes.auth.getLardiUsersData(data.cid, data.token, function(array) {
          binds.fields[1].users = array;
          def.resolve();
        });
      }

      def.always(function(){
        $('#' + key + 'Login').replaceWith(_.templates.accountUnbinding(binds));
        $('#' + key + 'Unbind').bind('click', context[key + 'Unbind'].bind(context));
        if (key === 'lardi') {
          $('#lardi_contact_name').bind('change', context.resetLardiContact.bind(context));
        }
      });
    } else {
      return false;
    }
  },

  resetLardiContact: function () {
    App.updateUserData('lardi', 'ID', $('#lardi_contact_name').val());
    App.updateUserData('lardi', 'Name', $('#lardi_contact_name').find(':selected').text().trim());
    App.updateAppData();
  },

  showLogin: function (key) {
    var context = App.scenes.auth;

    $('#' + key + 'Bind').replaceWith(_.templates.auth(Templates[key + 'Login']));
    $('#' + key + 'Submit').bind('click', context[key + 'Submit'].bind(context, this.showUnbind));
    $('#' + key + '_password').bind('keyup', onEnter.bind(context, context[key + 'Submit'].bind(context, this.showUnbind)));
    context.initForm(key);
  },
};
