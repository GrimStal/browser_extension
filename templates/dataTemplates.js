'use strict';

var Templates = (function () {
  var t = {};

  t.lardiLogin = {
    wrapper_class: 'show-left-border',
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
    wrapper_class: '',
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
    wrapper_class: '',
    wrapper_id: 'cargoBind',
    img_name: 'cargo.png',
    submit_id: 'cargoUnbind',
    text: 'Аккаунт привязан',
  };

  t.lardiUnbind = {
    wrapper_class: 'show-left-border',
    wrapper_id: 'lardiBind',
    img_name: 'lardi.png',
    submit_id: 'lardiUnbind',
    text: 'Аккаунт привязан',
  };

  t.cargosOffer = {
    wrapper_class: 'cargos-offer',
    wrapper_id: 'cargosOffer',
    originLabel: 'Город погрузки:',
    destinationLabel: 'Город разгрузки:',
    dates: [],
    currentMonth: '',
    days: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
    nextMonth: '',
    cargoTypeLabel: 'Тип груза:',
    cargoTypes: [
      {
        id: 1,
        type: 'Тип 1',
      },
      {
        id: 2,
        type: 'Тип 2',
      },
      { id: 3,
        type: 'Тип 3',
      },
    ],
    adrLabel: 'ADR',
    adrs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    weightLabel: 'Масса:',
    volumeLabel: 'Объём:',
    temperatureLabel: 't., C<sup>o</sup>',
    paletsLabel: 'Палеты:',
    trailerTypes: {
        title: 'Тип кузова:',
        placeholder: 'Другой',
        fixed: [
            [
              { id: 2, type: 'тент 82-92м<sup>3</sup>' },
              { id: 13, type: 'мегатрейлер 100м<sup>3</sup>' },
              { id: 8, type: 'тент 120м<sup>3</sup>' },
            ],
            [
              { id: 9, type: '&lt; 2т, 20м<sup>3</sup>' },
              { id: 17, type: '&lt; 3.5т, 35м<sup>3</sup>' },
              { id: 10, type: '&lt; 7.5т, 50м<sup>3</sup>' },
            ],
            [
              { id: 3, type: 'изотерм' },
              { id: 1, type: 'рефрижератор' },
              [
                { id: 1, type: 'Опция 1' },
                { id: 2, type: 'Опция 2' },
                { id: 3, type: 'Опция 3' },
                { id: 4, type: 'Опция 4' },
                ],
            ],
          ],
      },
    loadTypes: {
      title: 'Тип загрузки:',
      fixed: [
          {
            top: 'верхняя',
            side: 'боковая',
            back: 'задняя',
          },
          {
            full: 'полная',
            partly: 'частичная',
          },
          {
            lift: 'лифт',
            manipulator: 'манипулятор',
          },
        ],
    },
    documents: {
        title: 'Документы:',
        docs: [
          {
            cmr: 'CMR',
            tir: 'TIR',
          },
          {
            t1: 'T1',
            declaration: 'По декларации',
          },
        ],
      },
    paymentLabel: 'Стоимость:',
    currencies: [
      { id: 1, type: 'грн' },
      { id: 2, type: 'USD' },
      { id: 3, type: 'EUR' },
      { id: 4, type: 'RUB' },
    ],
    paymentTypePlaceholder: 'Тип оплаты:',
    paymentTypes: {
      1: 'на выгрузке',
      2: 'после доставки',
      3: 'предоплата',
    },
    noteLabel: 'Комментарий',
    clearButtonText: 'Очистить',
    orderButtonText: 'Добавить',
  };

  return t;
}());

var Request = function (to, type, url) {
  this.to = to;
  this.url = url;
  this.type = type;
  this.data = {};
  this.headers = {};

  // var requestTypes = ['POST', 'GET'];
  //
  // this.setType = function (type) {
  //   if (requestTypes.indexOf(type.toUpperCase()) > -1) {
  //     return this.type = type;
  //   }
  //
  //   return false;
  // };
  //
  // this.cleaType = function () {
  //   return this.type = '';
  // };
  //
  // this.setData = function (data) {
  //   if (data && typeof data === 'object' && data.constructor === Object) {
  //     return this.data = data;
  //   }
  //
  //   if (arguments.length === 2 &&
  //     typeof arguments[0] === 'string' &&
  //     (typeof arguments[1] === 'string' || typeof arguments[1] === 'number')) {
  //     return this.data[arguments[0]] = arguments[1];
  //   }
  //
  //   return false;
  // };
  //
  // this.clearData = function () {
  //   return this.data = {};
  // };
  //
  // this.setHeaders = function (headers) {
  //   if (headers && typeof headers === 'object' && headers.constructor === Object) {
  //     return this.headers = headers;
  //   }
  //
  //   if (arguments.length === 2 &&
  //     typeof arguments[0] === 'string' &&
  //     (typeof arguments[1] === 'string' || typeof arguments[1] === 'number')) {
  //     return this.headers[arguments[0]] = arguments[1];
  //   }
  //
  //   return false;
  // };
  //
  // this.clearHeaders = function () {
  //   return this.headers = {};
  // };

};
