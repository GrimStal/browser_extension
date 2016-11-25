'use strict';

App.scenes.settings = {
  show: function () {
      var self = this;
      var cargoHTML;
      var lardiHTML;
      var authContext = App.scenes.auth;
      var settingsContext = App.scenes.settings;
      var cargoData = App.appData.cargo;
      var lardiData = App.appData.lardi;
      var authCargo = authContext.cargoSubmit.bind(authContext, settingsContext.showUnbind);
      var authLardi = authContext.lardiSubmit.bind(authContext, settingsContext.showUnbind);
      var addOrder = _.templates.addOrder({ buttonText: 'Вернуться назад' });
      var cargoBinds = cloneObj(Templates.cargoUnbind);
      var lardiBinds = cloneObj(Templates.lardiUnbind);

      if (cargoData.token) {
        cargoBinds.fields[0].value = cargoData.login;
        cargoBinds.fields[1].value = cargoData.name;
        cargoHTML = _.templates.accountUnbinding(cargoBinds);
      } else {
        cargoHTML = _.templates.auth(Templates.cargoBinds);
      }

      if (lardiData.token) {
        lardiBinds.fields[0].value = lardiData.login;
        lardiBinds.fields[1].value = lardiData.name.replace(/[\"]/g, '&quot;');
        lardiHTML = _.templates.accountUnbinding(lardiBinds);
      } else {
        lardiHTML = _.templates.auth(Templates.lardiLogin);
      }

      $('.ce__wrapper').empty().append(cargoHTML + lardiHTML + addOrder);

      if (cargoData.token) {
        $('#cargoUnbind').bind('click', self.cargoUnbind.bind(settingsContext));
      } else {
        $('#cargoSubmit').bind('click', authCargo);
        $('#cargo_password').bind('keyup', onEnter.bind(null, authCargo));
        authContext.initForm('cargo');
      }

      if (lardiData.token) {
        $('#lardiUnbind').bind('click', self.lardiUnbind.bind(self));
        $('#lardi_change_contact').bind('click', self.getLardiContacts.bind(self));
      } else {
        $('#lardiSubmit').bind('click', authLardi);
        $('#lardi_password').bind('keyup', onEnter.bind(null, authLardi));
        authContext.initForm('lardi');
      }

      $('#addOrder').bind('click', function () {
          App.showScene('cargos');
        });

      $('#addOrder').addClass('white');
      App.stopLoading();
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
    SMData.removeToken('cargo');
    // SMData.removeUserData('cargo');
    App.updateAppData();
    App.changeScene('auth');
  },

  lardiUnbind: function () {
    SMData.removeToken('lardi');
    // SMData.removeUserData('lardi');
    App.updateAppData();
    $('#goCargosList').addClass('hidden');
    this.showLogin('lardi');
  },

  showUnbind: function (key, result) {
    var context = App.scenes.settings;
    var binds = cloneObj(Templates[key + 'Unbind']);
    var data = App.appData[key];
    if (!key) {
      return false;
    }

    if (result) {
      if (key === 'cargo') {
        binds.fields[0].value = data.login;
        binds.fields[1].value = data.name;
        App.exchanges.saveCargoTypes();
      } else if (key === 'lardi') {
        binds.fields[0].value = data.login;
        binds.fields[1].value = data.name.replace(/[\"\']/g, '');
        App.exchanges.saveLardiCountries();
      }

      $('#' + key + 'Login').replaceWith(_.templates.accountUnbinding(binds));
      $('#' + key + 'Unbind').bind('click', context[key + 'Unbind'].bind(context));
      if (key === 'lardi') {
        $('#lardi_change_contact').bind('click', context.getLardiContacts.bind(context));
        $('#goCargosList').removeClass('hidden');
      }

    } else {
      App.scenes.auth.updateFormStatus(key, result);
    }
  },

  resetLardiContact: function () {
    SMData.updateUserData('lardi', 'ID', $('#lardi_contact_select').val());
    SMData.updateUserData('lardi', 'Name', $('#lardi_contact_select').find(':selected').text().trim());
    App.updateAppData();
  },

  getLardiContacts: function () {
    var self = this;
    var lardiHTML;
    var lardiData = App.appData.lardi;
    var data = {};

    data.id = 'lardi_contact_select';
    data.defaultID = lardiData.id;
    App.scenes.auth.getLardiUsersData(lardiData.cid, lardiData.token, function (array) {
      data.users = array;
      lardiHTML = _.templates.contacts(data);
      $('#lardi_contact_name').replaceWith(lardiHTML);
      $('#lardi_change_contact').unbind('click');
      $('#lardi_change_contact').remove();
      $('#lardi_contact_select').bind('change', self.resetLardiContact.bind(self));
    });
  },

  showLogin: function (key) {
    var context = App.scenes.auth;

    $('#' + key + 'Bind').replaceWith(_.templates.auth(Templates[key + 'Login']));
    $('#' + key + 'Submit').bind('click', context[key + 'Submit'].bind(context, this.showUnbind));
    $('#' + key + '_password').bind('keyup', onEnter.bind(context, context[key + 'Submit'].bind(context, this.showUnbind)));
    context.initForm(key);
  },
};
