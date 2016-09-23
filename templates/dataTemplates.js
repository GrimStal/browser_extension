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
    cargoTypes: { 1: 'Тип 1', 2: 'Тип 2', 3: 'Тип 3' },
    adrLabel: 'ADR',
    adrs: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    weightLabel: 'Масса:',
    volumeLabel: 'Объём:',
    temperatureLabel: 't., C<sup>o</sup>',
    paletsLabel: 'Палеты:',
    carcaseTypes: {
        title: 'Тип кузова:',
        fixed: [
            {
              1: 'тент 82-92м<sup>3</sup>',
              2: 'мегатрейлер 100м<sup>3</sup>',
              3: 'тент 120м<sup>3</sup>',
            },
            {
              4: '&lt; 2т, 20м<sup>3</sup>',
              5: '&lt; 3.5т, 35м<sup>3</sup>',
              6: '&lt; 7.5т, 50м<sup>3</sup>',
            },
            {
              7: 'изотерм',
              8: 'рефрижератор',
              9: {
                  placeholder: 'Другой',
                  1: 'Опция 1',
                  2: 'Опция 2',
                  3: 'Опция 3',
                },
            },
          ],
      },
    loadTypes: {
      title: 'Тип загрузки:',
      fixed: [
          {
            1: 'верхняя',
            2: 'боковая',
            3: 'задняя',
          },
          {
            4: 'полная',
            5: 'частичная',
          },
          {
            7: 'лифт',
            8: 'манипулятор',
          },
        ],
    },
    documents: {
        title: 'Документы:',
        docs: [
          {
            1: 'CMR',
            2: 'TIR',
          },
          {
            3: 'T1',
            4: 'По декларации',
          },
        ],
      },
    paymentLabel: 'Стоимость:',
    currencies: {
      1: 'грн',
      2: 'USD',
      3: 'EUR',
      4: 'RUB',
    },
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
