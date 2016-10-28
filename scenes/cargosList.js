'use strict';

App.scenes.cargosList = {

  show: function () {

  },

  hide: function () {

  },

  getLardiCargos: function (callback) {
    var resp;
    var cargos = [];
    var req = new Request('lardi', 'GET');
    req.data = {
      sig: App.appData.lardi.token,
      method: 'my.gruz.list',
    };

    App.sendRequest(req, function (response) {
      if (!response.error && response.success) {
        resp = XMLtoJson(response.success);

        if (resp.error) {
          return console.log(resp.error);
        }

        resp = resp.response;

        if (typeof resp.gruz.item === 'object') {
          if (Array.isArray(resp.gruz.item)) {
            cargos = resp.gruz.item;
          } else {
            cargos.push(resp.gruz.item);
          }
        } else {
          console.log(resp.gruz.item);
        }

        if (callback && typeof callback === 'function') {
          callback(cargos);
        }
      }
    });
  },

  createCargoDuplicate: function (object, callback) {
    console.log(object);
    var _this = this;
    var note = [];
    var loads = this.setLoadTypes(object.zagruz_set);
    var cargo = new CargoObject();
    var getCargoTypes = App.exchanges.getCargoTypes();
    var placeFrom = [];
    var areaFrom;
    var countryFrom;
    var placeTo = [];
    var areaTo;
    var countryTo;

    if (!object) {
      return false;
    }

    areaFrom = getLardiAreaName(object.country_from_id, object.area_from_id);
    countryFrom = getLardiCountryName(object.country_from_id);
    areaTo = getLardiAreaName(object.country_to_id, object.area_to_id);
    countryTo = getLardiCountryName(object.country_to_id);

    placeFrom.push(object.city_from);
    if (areaFrom) {
      placeFrom.push(areaFrom);
    }

    if (countryFrom) {
      placeFrom.push(countryFrom);
    }

    placeTo.push(object.city_to);
    if (areaTo) {
      placeTo.push(areaTo);
    }

    if (countryTo) {
      placeTo.push(countryTo);
    }

    cargo.from.push(placeFrom.join(', '));
    cargo.to.push(placeTo.join(', '));

    $.when(getCargoTypes).then(
        function (cargoTypes) {
          //Cargo type
          cargo.type = getID(cargoTypes.cargoTypes, object.gruz);
          if (cargo.type === -1) {
            note.push('Груз: ' + object.gruz);
            cargo.type = 55;
          }

          //ADR
          if (parseInt(object.adr)) {
            cargo.adr = 1;
            note.push('ADR: ' + object.adr);
          }

          //Load types
          $.extend(cargo, loads[0]);

          if (loads[1] && loads[1].length) {
            note.push('Загрузка: ' + loads[1]);
          }

          //CMR
          if (object.cmr && object.cmr === 'true') {
            note.push('CMR');
          }

          //custom control
          if (object.custom_control && object.custom_control === 'true') {
            note.push('Таможенный контроль');
          }

          //dates
          cargo.fromDate = new Date(object.date_from).setUTCHours(0, 0, 0, 0) / 1000;
          cargo.tillDate = new Date(object.date_to).setUTCHours(23, 59, 0, 0) / 1000;

          //volume
          if (object.value_select === 'FROM' || !object.value.length) {
            cargo.volume = parseFloat(object.value);
          } else {
            cargo.volume = parseFloat(object.value2);
          }

          //weight
          if (object.mass_select === 'FROM' || !object.mass_select.length) {
            cargo.weight = parseFloat(object.mass);
          } else {
            cargo.weight = parseFloat(object.mass2);
          }

          //medbook
          if (object.medBook && object.medBook === 'true') {
            note.push('Мед. книжка');
          }

          //currencies
          switch (object.payment_currency_id) {
            case '4':
              cargo.currency = 7;
              break;
            case '6':
              cargo.currency = 2;
              break;
            case '8':
              cargo.currency = 6;
              break;
            case '10':
              cargo.currency = 18;
              break;
            case '2':
            default:
              cargo.currency = 15;
              break;
          }

          //payment form
          if (object.payment_forma_id && object.payment_forma_id !== '0') {
            switch (object.payment_forma_id) {
              case '4':
                note.push('безнал.');
                break;
              case '6':
                note.push('комб.');
                break;
              case '8':
                note.push('эл. платеж.');
                break;
              case '10':
                note.push('карта.');
                break;
              case '2':
                note.push('нал.');
                break;
            }
          }

          //payment moment
          if (object.payment_moment_id && object.payment_moment_id !== '0') {
            switch (object.payment_moment_id) {
              case '4':
                note.push('Оплата на выгрузке');
                break;
              case '6':
                note.push('Оплата по оригиналам');
                break;
              case '8':
                if (object.payment_delay && object.payment_delay !== '0') {
                  note.push('Отсрочка платежа ' + object.payment_delay + ' дней');
                } else {
                  note.push('Отсрочка платежа');
                }

                break;
              case '2':
                note.push('Оплата на загрузке');
                break;
            }
          }

          //prepay
          object.payment_prepay = parseInt(object.payment_prepay);
          if (object.payment_prepay && (object.payment_prepay > 0 && object.payment_prepay <= 100)) {
            note.push('Предоплата ' + object.payment_prepay + '%');
          }

          //payment_unit
          switch (object.payment_unit) {
            case '2':
              note.push('сумма за км');
              break;
            case '4':
              note.push('сумма за т');
              break;
          }

          //payment_vat
          if (object.payment_vat && object.payment_vat == 'true') {
            note.push('НДС');
          }

          //stavka
          object.stavka = Number(object.stavka);
          if (object.stavka) {
            cargo.price = object.stavka;
          }

          //t1
          if (object.t1 && object.t1 == 'true') {
            note.push('T1');
          }

          //tir
          if (object.tir && object.tir == 'true') {
            cargo.tir = true;
          }

          //declaration
          if (object.add_info.toLowerCase().indexOf('по декларации') > -1 ||
            object.note.toLowerCase().indexOf('по декларации') > -1) {
            cargo.declaration = 1;
          }

          //full load
          if (object.add_info.toLowerCase().indexOf('полная') > -1 ||
            object.note.toLowerCase().indexOf('полная') > -1) {
            cargo.full = 1;
          }

          //partly load
          if (object.add_info.toLowerCase().indexOf('частичная') > -1 ||
            object.note.toLowerCase().indexOf('частичная') > -1) {
            cargo.partly = 1;
          }

          //fift load
          if (object.add_info.toLowerCase().indexOf('лифт') > -1 ||
            object.note.toLowerCase().indexOf('лифт') > -1) {
            cargo.lift = 1;
          }

          //manipulator load
          if (object.add_info.toLowerCase().indexOf('манипулятор') > -1 ||
            object.note.toLowerCase().indexOf('манипулятор') > -1) {
            cargo.manipulator = 1;
          }

          //Notes
          note.push(object.note, object.add_info);
          cargo.notes = note.join(', ');
          callback(cargo);
        },
        function (error) {
          console.log(error);
        }
      );
  },

  /**
   * Creates object of cargo.lt load types from lardi data. All load types
   * missing on cargo.lt returned as string to add to note.
   * @param {string} string String of russian load types from lardi cargo object.
   * @return {Array[object, string]}
   */
  setLoadTypes: function (string) {

    function setToObject(rus, attr) {
      var index = array.indexOf(rus);
      if (index !== -1) {
        obj[attr] = 1;
        array.splice(index, 1);
      }
    }

    var obj = {};
    var array = string.split(', ');
    var string = '';

    if (!array) {
      return [obj, string];
    }

    setToObject('верхняя', 'top');
    setToObject('боковая', 'side');
    setToObject('задняя', 'back');

    string = array.join(', ');

    return [obj, string];
  },

};
