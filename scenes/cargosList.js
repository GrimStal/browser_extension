'use strict';

App.scenes.cargosList = {

  show: function () {
    var _this = this;
    var template;
    var getLardiCargos = this.getLardiCargos();
    var getLardiCurrencies = App.exchanges.getLardiCurrencies();

    this.currentArray = [];
    this.lardiCargos = [];
    this.newArray = [];
    this.oldArray = App.getSavedCargos('lardi') || [];

    $.when(getLardiCargos, getLardiCurrencies).then(
      function (lardiCargos, lardiCurrencies) {
        var currencies = XMLtoJson(lardiCurrencies).response;

        if (!currencies || !currencies.item) {
          console.log('Lardi doesn\'t response for currencies request');
        } else {
          currencies = currencies.item;
        }

        _this.lardiCargos = lardiCargos;
        _this.lardiCargos.forEach(function (cargo) {
            _this.currentArray.push(cargo.id);
            currencies.forEach(function (el) {
              if (Number(el.id) == Number(cargo.payment_currency_id)) {
                cargo.payment_currency_name = el.name;
              }
            });
          });

        if (_this.oldArray && Array.isArray(_this.oldArray)) {
          _this.currentArray.forEach(function (el) {
            if (_this.oldArray.indexOf(el) < 0) {
              _this.newArray.push(el);
            }
          });
        }

        _this.lardiCargos.forEach(function (cargo) {
            if (_this.newArray.indexOf(cargo.id) > -1) {
              cargo.isNew = 1;
            } else {
              cargo.isNew = 0;
            }
          });

        App.saveCargos('lardi', _this.currentArray);

        _this.lardiCargos.sort(sortByNewAndID);

        template = _.templates.cargosList({
            wrapper_class: 'cargos-list',
            wrapper_id: 'cargos-list',
            orderButtonText: 'Экспортировать',
            lardiCargos: _this.lardiCargos
          });

        $('.ce__wrapper').empty().append(template);
        $('.check-all').bind('change', function () {
          $('input[type=checkbox]').prop('checked', this.checked);
        });
        $('#goCargosList').addClass('current-scene');
      },
      function (error) {
        console.log(error);
        App.changeScene('settings');
      }
    );

  },

  hide: function () {
    $('.ce__wrapper').empty();
    $('.check-all').unbind('change', function () {
      $('input[type=checkbox]').attr('checked', this.checked);
    });
  },

  getLardiCargos: function (callback) {
    var result = $.Deferred();
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
          return result.reject(resp.error);
        }

        resp = resp.response;

        if (resp.gruz.item && typeof resp.gruz.item === 'object') {
          if (Array.isArray(resp.gruz.item)) {
            cargos = resp.gruz.item;
          } else {
            cargos.push(resp.gruz.item);
          }
        }

        result.resolve(cargos);
      }
    });

    return result.promise();
  },

  createCargoDuplicate: function (object, callback) {
    var _this = this;
    var note = [];
    var loads = this.setLoadTypes(object.zagruz_set);
    var cargo = new CargoObject();
    var getCargoTypes = App.exchanges.getCargoTypes();
    var getAutoTips = App.exchanges.getLardiAutoTips();
    var placeFrom = [];
    var areaFrom;
    var placeTo = [];
    var areaTo;

    if (!object) {
      return false;
    }

    areaFrom = getLardiAreaName(object.country_from_id, object.area_from_id);
    areaTo = getLardiAreaName(object.country_to_id, object.area_to_id);

    placeFrom.push(object.city_from);
    if (areaFrom) {
      placeFrom.push(areaFrom);
    }

    placeTo.push(object.city_to);
    if (areaTo) {
      placeTo.push(areaTo);
    }

    delete cargo.from;
    delete cargo.to;
    cargo.origins = [];
    cargo.destinations = [];
    cargo.origins.push({ country: getLardiCountryCode(object.country_from_id), name: placeFrom.join(', ') });
    cargo.destinations.push({ country: getLardiCountryCode(object.country_to_id), name: placeTo.join(', ') });

    $.when(getCargoTypes, getAutoTips).then(
        function (cargoTypes, autoTips) {
          var aTips = XMLtoJson(autoTips).response.item;

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

          if (!cargo.tillDate) {
            cargo.tillDate = new Date(object.date_from).setUTCHours(23, 59, 0, 0) / 1000;
          }

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
            note.push('Предоплата ' + object.payment_prepay + '%;');
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

          //auto_col_tip
          if (object.auto_col_id && object.auto_col_id.length > 0 && object.auto_col_id !== '0') {
            object.auto_col = parseInt(object.auto_col);
            if (object.auto_col > 0) {
              note.push(object.auto_col + ' ' + getName(aTips, object.auto_col_id));
            }
          }

          //Notes
          if (object.note.length > 0) {
            note.push(object.note);
          }

          if (object.add_info.length > 0) {
            note.push(object.add_info);
          }

          cargo.notes = note.join('; ');

          callback(null, cargo);

        },
        function (error) {
          console.log(error);
          callback(error);
        }
      );
  },

  sendDuplicatesToCargo: function (error, duplicate) {
    var def = $.Deferred();
    var creq = new Request('cargo', 'POST', 'cargos');

    if (!error && duplicate) {
      creq.data = duplicate;
      creq.headers = {
        'Access-Token': App.appData.cargo.token,
      };
      App.exchanges.getDataFromServer(creq).then(
        function (response) {
          def.resolve(response);
        },
        function (error) {
          console.log(error);
          def.reject(error);
        }
      );
    } else {
      def.reject(error);
    }

    return def.promise();
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
