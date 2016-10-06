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
    cargoTypeLabel: 'Тип груза',
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
};

function CargoObject() {
  this.from = [];
  this.to = [];
  this.type = 0;
  this.fromDate = null;
  this.tillDate = null;

  // this.fromDateto = 0;
  // this.tillDateto = 0;
  this.notes = '';
  this.trailers = [];
  this.pallets = 0;
  this.pallettype = 1;
  this.volume = 0;
  this.volumeldm = 13.6;
  this.weight = 0;
  this.minTemperature = null;
  this.maxTemperature = null;
  this.price = 0;
  this.currency = 0;
  this.top = 0;
  this.side = 0;
  this.back = 0;
  this.full = 0;
  this.partly = 0;
  this.adr = 0;
  this.tir = 0;
  this.declaration = 0;
  this.manipulator = 0;
  this.lift = 0;

  // this.boxes = [];
  // this.boxtype = 0;
  // this.accountId = 0;
}

function LardiTransCargoObject() {
  this.method = 'my.gruz.add';
  this.sig = undefined;
  this.country_from_id = undefined;
  this.area_from_id = undefined;
  this.city_from = '';
  this.country_to_id = undefined;
  this.area_to_id = undefined;
  this.city_to = '';
  this.date_from = '';       //Date format DD.MM.YYYY
  this.date_to = '';         //Date format DD.MM.YYYY
  // this.custom_control = false;   //

  this.adr = 0;
  this.t1 = false;
  this.cmr = false;
  this.gruz = '';
  this.tir = false;
  this.stavka = 0;

  this.body_type_id = undefined;
  this.body_type_group_id = undefined;
  this.note = '';           //Max length 40 symbols
  // this.mass_select = [];
  this.mass = 0;

  // this.mass2 = null;
  // this.value_select = [];
  this.value = undefined;

  // this.value2 = null;
  // this.payment_forma_id = null;
  this.payment_moment_id = undefined;

  // this.payment_vat = false;
  // this.payment_prepay = 0;
  // this.payment_delay = 0;

  this.payment_currency_id = undefined;
  // this.payment_unit_id = null;

  this.zagruz_set = '';         //Mnemonic of load types, comma as delimiter, no spaces
  // this.auto_col_tip = null;  //ID of auto type
  // this.auto_col = 1;         //Amount of autos
  // this.user_contact = 0;     //№ of subordinate contact. 0 is main
  // this.gab_dl = 0;
  // this.gab_sh = 0;
  // this.gab_v = 0;
  // this.ext_url = '';         //URL for tendors
  this.add_info = '';        //Additional info, max length 255 symbols
}
