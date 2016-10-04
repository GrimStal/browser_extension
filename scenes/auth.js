'use strict';

App.scenes.auth = {
    show: function () {
        var introHTML = _.templates.intro();
        var cargoHTML = _.templates.auth(Templates.cargoLogin);
        var lardiHTML = _.templates.auth(Templates.lardiLogin);
        var addOrder = _.templates.addOrder({ buttonText: 'Добавить предложение' });

        $('.ce__wrapper').empty().append(introHTML + cargoHTML + lardiHTML + addOrder);

        $('#cargoSubmit').bind('click', this.cargoSubmit.bind(this));
        $('#lardiSubmit').bind('click', this.lardiSubmit.bind(this));
        $('#addOrder').bind('click', this.showOrderForm.bind(this));
        $('.auth-input').bind('input', this.onChange.bind(this));
        this.initForm(['cargo', 'lardi'], this.checkAccess);

        $('#header-message').text('Добавление груза на Cargo.LT и Lardi-Trans');
      },

    hide: function () {
        $('#cargoSubmit').unbind('click', this.cargoSubmit);
        $('#lardiSubmit').unbind('click', this.lardiSubmit);
        $('#addOrder').unbind('click', this.showOrderForm);
        $('.auth-input').unbind('input', this.onChange);

        $$('.ce__wrapper').empty();
      },

    checkAccess: function () {
        var $orderButton = $('#addOrder');

        if (App.checkToken()) {
          $orderButton.prop('disabled', false);
          $orderButton.addClass('btn-accept');
          $orderButton.removeClass('btn-default');
        } else {
          $orderButton.prop('disabled', true);
          $orderButton.removeClass('btn-accept');
          $orderButton.addClass('btn-default');
        }
      },

    clearFormStatus: function (key) {
        var $submitButton = $('#' + key + 'Submit');
        var $parents =  $('#' + key + '_login, #' + key + '_password').parent();

        $parents.find('span').remove();
        $parents.removeClass('has-success has-error');
        $submitButton.removeClass('binded');
        $submitButton.text('Привязать аккаунт');

        this.checkAccess();
      },

    updateFormStatus: function (key, result) {
        var elClass = result ? 'has-success' : 'has-error';
        var icon = result ? '<span class="glyphicon glyphicon-ok form-control-feedback"></span>' :
            '<span class="glyphicon glyphicon-remove form-control-feedback"></span>';
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

    signIn: function (key, login, password, callback) {
      var req = new Request(key, 'POST', (key === 'cargo') ? 'accounts/signin' : '');
      var data = {
        login: login,
        password: (key !== 'lardi') ? password : md5(password),
      };

      if (key === 'lardi') {
        data.method = 'auth';
      }

      req.data = data;

      $('#' + key + 'Submit').text('Авторизация');

      App.sendRequest(req, function (response) {
          var result = false;
          var token;
          var res;
          var userData = {
            id: '',
            name: '',
            login: '',
            password: '',
          };

          if (!response.error && response.success) {
            result = true;

            if (key === 'lardi') {
              res = XMLtoJson(response.success);
              token = res.response.sig;
              userData.id = res.response.uid;
            } else {
              res = response.success;
              token = res.accessToken;
              userData.id = res.userId;
              userData.name = res.fullName;
            }

            userData.login = login;
            userData.password = password;

            App.saveToken(key, token);
            App.saveUserData(key, userData);
          }

          App.updateAppData(key, userData);

          if (callback && typeof callback === 'function') {
            callback(key, result);
          }
        });
    },

    validateData: function (key) {
      var lpRegExp = /^[0-9a-z]{6,15}$/i;
      var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var login = $('#' + key + '_login').val();
      var password = $('#' + key + '_password').val();

      if ((!lpRegExp.exec(login) && !emailRegExp.exec(login)) || !lpRegExp.exec(password)) {
        console.error(key);
        console.error('Не прошло регулярку');
        return false;
      }

      return true;
    },

    cargoSubmit: function (callback) {
      callback = (typeof callback === 'function') ? callback : this.updateFormStatus.bind(this);
      var login = $('#cargo_login').val();
      var password = $('#cargo_password').val();

      if (!this.validateData('cargo')) {
        return this.updateFormStatus('cargo', false);
      }

      return this.signIn('cargo', login, password, callback);
    },

    lardiSubmit: function (callback) {
      callback = (typeof callback === 'function') ? callback : this.updateFormStatus.bind(this);
      var login = $('#lardi_login').val();
      var password = $('#lardi_password').val();

      if (!this.validateData('lardi')) {
        return this.updateFormStatus('lardi', false);
      }

      return this.signIn('lardi', login, password, callback);
    },

    showOrderForm: function () {
      App.changeScene('cargos');
    },

    initForm: function (keys, callback) {
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

    onChange: function (e) {
        var id = e.currentTarget.id;
        var key = id.substr(0, id.lastIndexOf('_'));

        App.removeUserData(key);
        App.removeToken(key);
        App.updateAppData(key, {});

        return this.clearFormStatus(key);
      },

  };
