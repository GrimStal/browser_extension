'use strict';

App.scenes.auth = {
  show: function() {
    var introHTML = _.templates.intro();
    var cargoHTML = _.templates.auth(Templates.cargoLogin);
    var lardiHTML = _.templates.auth(Templates.lardiLogin);
    var addOrder = _.templates.addOrder({buttonText: 'Добавить предложение'});
    var cargoSubmit = this.cargoSubmit.bind(this);
    var lardiSubmit = this.lardiSubmit.bind(this);

    $('.ce__wrapper').empty().append(introHTML + cargoHTML + lardiHTML + addOrder);

    $('#cargoSubmit').bind('click', cargoSubmit);
    $('#cargo_password').bind('keyup', onEnter.bind(null, cargoSubmit));
    $('#lardiSubmit').bind('click', lardiSubmit);
    $('#lardi_password').bind('keyup', onEnter.bind(null, lardiSubmit));
    $('#addOrder').bind('click', this.showOrderForm.bind(this));
    $('.auth-input').bind('input', this.onChange.bind(this));
    $('.cargo-site').bind('click', App.openTab.bind(null, 'https://www.cargo.lt/'));
    $('.lardi-site').bind('click', App.openTab.bind(null, 'http://lardi-trans.com/'));
    $('.icon.cog-icon').addClass('hidden');
    $('#cargo_password + .eye').bind('click', this.togglePasswordVisability.bind(this, 'cargo'));
    $('#lardi_password + .eye').bind('click', this.togglePasswordVisability.bind(this, 'lardi'));

    this.initForm(['cargo', 'lardi'], this.checkAccess);
    App.stopLoading();
  },

  hide: function() {
    $('#cargoSubmit').unbind('click', this.cargoSubmit);
    $('#lardiSubmit').unbind('click', this.lardiSubmit);
    $('#cargo_password').unbind('keyup', onEnter.bind(null, cargoSubmit));
    $('#lardi_password').unbind('keyup', onEnter.bind(null, lardiSubmit));
    $('#addOrder').unbind('click', this.showOrderForm);
    $('.auth-input').unbind('input', this.onChange);
    $('.cargo-site').unbind('click');
    $('.lardi-site').unbind('click');
    $('#cargo_password > .eye, #lardi_password > .eye').unbind('click');

    $$('.ce__wrapper').empty();
  },

  checkAccess: function() {
    var $orderButton = $('#addOrder');

    if (App.checkToken('cargo')) {
      $orderButton.prop('disabled', false);
      $orderButton.addClass('btn-accept');
      $orderButton.removeClass('btn-default');
    } else {
      $orderButton.prop('disabled', true);
      $orderButton.removeClass('btn-accept');
      $orderButton.addClass('btn-default');
    }
  },

  clearFormStatus: function(key) {
    var $submitButton = $('#' + key + 'Submit');
    var $parents = $('#' + key + '_login, #' + key + '_password').parent();

    $parents.find('span.glyphicon').remove();
    $parents.removeClass('has-success has-error');
    $submitButton.removeClass('binded');
    $submitButton.text('Привязать аккаунт');

    this.checkAccess();
  },

  updateFormStatus: function(key, result) {
    var elClass = result
        ? 'has-success'
        : 'has-error';
    var icon = result
        ? '<span class="glyphicon glyphicon-ok form-control-feedback"></span>'
        : '<span class="glyphicon glyphicon-remove form-control-feedback"></span>';
    var $parentElements = $('#' + key + '_login, #' + key + '_password').parent();
    var $fieldset = $parentElements.closest('fieldset');
    var $submitButton = $('#' + key + 'Submit');

    $parentElements.append(icon);
    $parentElements.addClass(elClass);

    // $fieldset.prop('disabled', result);

    if (result) {
      $submitButton.addClass('binded');
      $submitButton.text('Аккаунт привязан');
    }

    this.checkAccess();
  },

  getLardiCompanyData: function(uid, token, callback) {
    var req = new Request('lardi', 'GET', '');

    if (!token || !uid || !callback) {
      console.log('Invalid arguments');
      return callback(false);
    }

    req.data = {
      method: 'users.firm.info',
      uid: uid,
      sig: token,
    };

    App.sendRequest(req, function(response) {
      if (!response.success && response.error) {
        console.log(response.error);
        return callback(false);
      }

      response = XMLtoJson(response.success).response;

      if (response.error) {
        return callback(false);
      }

      callback(response);
    });
  },

  getLardiUsersData: function(uid, token, callback) {
    if (!token || !uid) {
      console.log('Invalid arguments');
      return callback(false);
    }

    return this.getLardiCompanyData(uid, token, function(data) {
      var companyUsers;
      var recievedContacts;
      var contacts = [];

      if (!data || !data.data) {
        return callback(false);
      }

      companyUsers = data.data;
      recievedContacts = companyUsers.contacts;
      contacts.push({
        id: 0,
        name: companyUsers.name,
        email: companyUsers.email,
        icq: companyUsers.icq,
        skype: companyUsers.skype,
        phone1: companyUsers.phone1,
      });

      if (typeof recievedContacts === 'object') {
        if (Array.isArray(recievedContacts)) {
          contacts = contacts.concat(recievedContacts);
        } else if (recievedContacts.contact) {
          contacts = contacts.concat(recievedContacts.contact);
        }
      }

      callback(contacts);
    });
  },

  getLardiUserName: function(id, usersArray) {
    var name;
    if (!usersArray) {
      return false;
    }

    usersArray.some(function(user) {
      user.id = String(user.id);
      if (user.id === id) {
        name = user.name;
      }
    });
    return name.replace(/[&amp\;,&quote;]/g, '');
  },

  checkLardiContact: function(login, companyID, token, callback) {
    var self = this;
    var uid = App.appData.lardi.id;

    this.getLardiUsersData(companyID, token, function(array) {
      var name = self.getLardiUserName(uid, array);
      if (!name) {
        uid = '0';
        name = self.getLardiUserName(uid, array);
      }

      callback(name, uid);
    });
  },

  signIn: function(key, login, password, callback) {
    var self = this;
    var link = (key === 'cargo') ? 'accounts/signin' : '';
    var req = new Request(key, 'POST', link);
    var data = {
      login: login,
      password: (key !== 'lardi') ? password : md5(password),
    };

    if (key === 'lardi') {
      data.method = 'auth';
    }

    req.data = data;

    $('#' + key + 'Submit').text('Авторизация');

    App.sendRequest(req, function(response) {
      var result = false;
      var token;
      var res;
      var cid;
      var contact = false;
      var processing = $.Deferred();
      var userData = {
        id: '',
        name: '',
        login: '',
        password: '',
        cid: '',
        contact: '',
      };

      processing.then(function(name, id) {
            userData.id = id;
            userData.cid = cid;
            userData.name = name;
            userData.login = login;
            userData.password = password;
            userData.contact = contact;
            SMData.saveToken(key, token);
            SMData.saveUserData(key, userData);
          },
          function(error) {
            console.error(error);
          }).always(function() {
        App.updateAppData(key, userData);
        App.checkRouteButtons();
        if (callback && typeof callback === 'function') {
          callback(key, result);
        }
      });

      if (!response.error && response.success) {
        if (key === 'lardi') {
          res = XMLtoJson(response.success);

          if (!res || !'response' in res || 'error' in res.response) {
            return processing.reject(res);
          }

          res = res.response;
          result = true;
          token = res.sig;
          cid = res.uid;
          if (!res.is_contact || res.is_contact === 'false') {
            self.checkLardiContact(login, cid, token, function(name, id) {
              processing.resolve(name, id);
            });
          } else {
            contact = true;
            processing.resolve('Нет данных', 0);
          }

        } else {
          result = true;
          res = response.success;
          token = res.accessToken;
          cid = res.userId;
          contact = true;
          processing.resolve(res.fullName, cid);
        }
      } else {
        processing.reject(response.error.responseText);
      }
    });
  },

  validateData: function(key) {
    return true;
  },

  cargoSubmit: function(callback) {
    function defaultCallback(key, result) {
      App.scenes.auth.updateFormStatus(key, result);
      App.exchanges.saveCargoTypes();
    }

    callback = (typeof callback === 'function')
        ? callback
        : defaultCallback;
    var login = $('#cargo_login').val().trim();
    var password = $('#cargo_password').val().trim();

    if (!this.validateData('cargo')) {
      return this.updateFormStatus('cargo', false);
    }

    return this.signIn('cargo', login, password, callback);
  },

  lardiSubmit: function(callback) {
    function defaultCallback(key, result) {
      App.scenes.auth.updateFormStatus(key, result);
      App.exchanges.saveLardiCountries();
    }

    callback = (typeof callback === 'function')
        ? callback
        : defaultCallback;
    var login = $('#lardi_login').val().trim();
    var password = $('#lardi_password').val().trim();

    if (!this.validateData('lardi')) {
      return this.updateFormStatus('lardi', false);
    }

    return this.signIn('lardi', login, password, callback);
  },

  showOrderForm: function() {
    App.changeScene('cargos');
  },

  initForm: function(keys, callback) {
    function init(key) {
      if (App.appData[key].login) {
        $('#' + key + '_login').val(App.appData[key].login);
        $('#' + key + '_password').val(App.appData[key].password);
        if (App.appData[key].token) {
          this.updateFormStatus(key, true);
        }
      }
    }

    if (Array.isArray(keys)) {
      keys.forEach(init.bind(this));
    } else {
      init.call(this, keys);
    }

    if (callback && typeof callback === 'function') {
      callback();
    }
  },

  onChange: function(e) {
    var id = e.currentTarget.id;
    var key = id.slice(0, id.lastIndexOf('_'));
    var variable = id.slice(id.lastIndexOf('_') + 1);
    SMData.removeToken(key);
    App.appData[key][variable] = $(e.currentTarget).val();
    variable = variable.charAt(0).toUpperCase() + variable.slice(1);
    SMData.updateUserData(key, variable, $(e.currentTarget).val());

    return this.clearFormStatus(key);
  },

  togglePasswordVisability: function(key) {
    $('#' + key + '_password').attr('type', ($('#' + key + '_password').attr('type') === 'password' ? 'text' : 'password'));
  }
};
