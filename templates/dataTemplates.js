'use strict';

var Templates = (function () {
  var t = {};

  t.lardiLogin = {
    wrapper_class: '',
    wrapper_id: 'lardiLogin',
    img_name: 'lardi.png',
    form_id: 'lardiAuth',
    submit_id: 'lardiSubmit',
    fields: [
      {
        id: 'lardi_login',
        label: 'логин',
        type: 'text',
      },
      {
        id: 'lardi_password',
        label: 'пароль',
        type: 'password',
      },
    ],
  };

  t.cargoLogin = {
    wrapper_class: 'show-right-border',
    wrapper_id: 'cargoLogin',
    img_name: 'cargo.png',
    form_id: 'cargoAuth',
    submit_id: 'cargoSubmit',
    fields: [
      {
        id: 'cargo_login',
        label: 'логин',
        type: 'text',
      },
      {
        id: 'cargo_password',
        label: 'пароль',
        type: 'password',
      },
    ],
  };

  t.cargoUnbind = {
    wrapper_class: 'show-right-border',
    wrapper_id: 'cargoUnbind',
    img_name: 'cargo.png',
    submit_id: 'cargoUnbind',
    text: 'Аккаунт привязан',
  };

  t.lardiUnbind = {
    wrapper_class: '',
    wrapper_id: 'lardiUnbind',
    img_name: 'lardi.png',
    submit_id: 'lardiUnbind',
    text: 'Аккаунт привязан',
  };

  return t;
}());
