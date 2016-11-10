'use strict';

App.scenes.cargosList = {

  show: function () {
    var _this = this;
    var template;
    var today = new Date().setUTCHours(0, 0, 0, 0);
    var getLardiCargos = this.getLardiCargos();
    var getLardiCurrencies = App.exchanges.getLardiCurrencies();
    var exportedArray = App.getExportedCargos('lardi') || [];

    if (!App.checkToken('lardi')) {
      return App.changeScene('cargos');
    }

    this.currentArray = [];
    this.lardiCargos = [];
    this.newArray = [];
    this.oldArray = App.getWatchedCargos('lardi') || [];
    this.exportedArray = [];

    App.loading('Получение данных');

    $.when(getLardiCargos, getLardiCurrencies).then(
      function (lardiCargos, lardiCurrencies) {
        var currencies = XMLtoJson(lardiCurrencies).response;

        if (!currencies || !currencies.item) {
          console.log('Lardi doesn\'t response for currencies request');
        } else {
          currencies = currencies.item;
        }

        for (var i = 0; i < lardiCargos.length; i++) {
          if (new Date(lardiCargos[i].date_from) >= today) {
            _this.lardiCargos.push(lardiCargos[i]);
          }
        }

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

        if (_this.exportedArray && exportedArray && Array.isArray(exportedArray)) {
          exportedArray.forEach(function (el) {
            if (_this.currentArray.indexOf(el) > -1) {
              _this.exportedArray.push(el);
            }
          });
        }

        _this.lardiCargos.forEach(function (cargo) {
            if (_this.newArray.indexOf(cargo.id) > -1) {
              cargo.isNew = 1;
            } else {
              cargo.isNew = 0;
            }

            if (_this.exportedArray.indexOf(cargo.id) > -1) {
              cargo.isExported = 1;
            } else {
              cargo.isExported = 0;
            }
          });

        App.saveWatchedCargos('lardi', _this.currentArray);
        App.saveExportedCargos('lardi', _this.exportedArray);

        template = _.templates.cargosList({
            wrapper_class: 'cargos-list',
            wrapper_id: 'cargos-list',
            orderButtonText: 'Экспортировать'
          });

        $('.ce__wrapper').empty().append(template);

        if (App.appData.lardi.contact === 'true' || App.appData.lardi.id === '0') {
          _this.createTable();
        } else {
          _this.createTable(App.appData.lardi.id);
        }

        if (App.appData.lardi.contact === 'false') {
          _this.createSelect();
          $('#contacts').bind('change', function () {
            _this.createTable($(this).val());
          });
        } else {
          $('.manager-block').addClass('hidden');
        }

        $('.check-all').bind('change', function () {
          $('input[type=checkbox]:not(:disabled)').prop('checked', this.checked);
        });
        $('#goCargosList').addClass('current-scene');
        $('#export').bind('click', _this.exportDuplicates.bind(_this));
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

  createTable: function (id) {
    App.loading('Построение таблицы');
    var filteredCargos = cloneObj(this.lardiCargos);
    var filter = selectedContact(id);
    var template;
    filteredCargos.sort(sortByNewAndID);

    if (id) {
      filteredCargos = filteredCargos.filter(filter);
    }

    template = _.templates.cargosListTable({
        lardiCargos: filteredCargos
      });

    $('#cargos-list table > tbody').empty().append(template);
    App.scenes.cargosList.setCheckAllAvailability();
    App.stopLoading();
  },

  setCheckAllAvailability: function () {
    if ($('.lardi-cargo-checkbox:disabled').length >= $('.lardi-cargo-checkbox').length) {
      $('.check-all').prop('disabled', true);
    } else {
      $('.check-all').prop('disabled', false);
    }
  },

  createSelect: function () {
    var selections;
    var template;
    if (App.appData.lardi.contact === 'false') {
      selections = [{
        id: '',
        name: 'Все',
        selected: App.appData.lardi.id === '0' ? true : false,
        count: 0
      }];

      this.lardiCargos.forEach(function (el) {
        if ('contact' in el && 'face' in el && 'name' in el) {
          var selected = (App.appData.lardi.id === el.contact) ? ((el.contact === '0') ? false : true) : false;
          var contact = {
            id: el.contact,
            name: el.contact === '0' ? el.name : el.face,
            selected: selected,
            count: 1
          };

          if (!selections.some(isIDInArray.bind(null, contact))) {
            selections.push(contact);
          } else {
            updateContactsCounter(selections, contact.id);
          }

          updateContactsCounter(selections, '');
        }
      });

      selections.sort(sortContacts);

      template = _.templates.cargosListContacts({ contacts: selections });
      $('.contacts-block').empty().append(template);
    }
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
    var ready = $.Deferred();
    var note = [];
    var loads = this.setLoadTypes(object.zagruz_set);
    var cargo = new CargoObject();
    var getCargoTypes = App.exchanges.getCargoTypes();
    var getAutoTips = App.exchanges.getLardiAutoTips();
    var placeFrom = [];
    var areaFrom;
    var placeTo = [];
    var areaTo;
    var day;

    if (!object) {
      ready.reject('Object not set');
      return ready.promise();
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
          day = new Date(cargo.fromDate * 1000).getUTCDay();

          if (!cargo.tillDate) {
            cargo.tillDate = new Date(object.date_from).setUTCHours(23, 59, 0, 0) / 1000;
          }

          if (day < 5 && day > 0) {
            if (cargo.tillDate - cargo.fromDate > 259140) {
              cargo.tillDate = cargo.fromDate + 259140;
            }
          } else if (day > 4 || day === 0) {
            if (cargo.tillDate - cargo.fromDate > 431940) {
              cargo.tillDate = cargo.fromDate + 431940;
            }
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
          cargo.lardiID = object.id;

          ready.resolve(cargo);

        },
        function (error) {
          ready.reject(error);
        }
      );

    return ready.promise();
  },

  sendDuplicatesToCargo: function (duplicate) {
    var id = '';
    var def = $.Deferred();
    var creq = new Request('cargo', 'POST', 'cargos');

    if (duplicate) {
      id = duplicate.lardiID;
      delete duplicate.lardiID;
      creq.data = duplicate;
      creq.headers = {
        'Access-Token': App.appData.cargo.token,
      };
      App.exchanges.getDataFromServer(creq).then(
        function (response) {
          def.resolve({ error: null, response: response, id: id });
        },
        function (error) {
          var err;

          console.log(error);
          if ('responseJSON' in error) {
            if ('error' in error.responseJSON) {
              err = error.responseJSON.error;
            }
          }

          if (err.length === 0) {
            err = 'Unknown error';
          }

          def.resolve({ error: err, response: null, id: id });
        }
      );
    } else {
      def.reject({ error: 'No object', response: null, id: null });
    }

    return def.promise();
  },

  exportDuplicates: function () {
    var _this = this;
    var selected = [];
    var duplicates = [];
    var $checked = $('.lardi-cargo-checkbox:checked');

    if (!$checked.length) {
      return swal('Ошибка', 'Не выбран ни один груз');
    }

    $checked.each(function (i, el) {
      selected.push($(el).val());
    });

    App.loading('Экспорт данных');

    selected.forEach(function (id) {
      _this.lardiCargos.forEach(function (cargo) {
        if (cargo.id === id) {
          duplicates.push(_this.createCargoDuplicate(cargo));
        }
      });
    });

    $.when.apply(this, duplicates).then(
      function () {
        var args = [];
        var sendedDuplicates = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        args.forEach(function (el) {
          sendedDuplicates.push(_this.sendDuplicatesToCargo(el));
        });

        $.when.apply(_this, sendedDuplicates).then(
          function () {
            var args = [];
            var success = [];
            var error = [];
            for (var i = 0; i < arguments.length; i++) {
              args.push(arguments[i]);
            }

            args.forEach(function (el) {
              if (el.error && el.id) {
                error.push(el.id);
              } else {
                success.push(el.id);
              }
            });

            $checked.each(function (i, el) {
              $(el).closest('tr').removeClass('new-cargo');
              if (error.indexOf($(el).val()) !== -1) {
                $(el).closest('tr').addClass('error');
                $(el).closest('tr').removeClass('successed');
              }

              if (success.indexOf($(el).val()) !== -1) {
                $(el).closest('tr').addClass('successed');
                $(el).closest('tr').removeClass('error');
                $(el).prop('disabled', true);
                $(el).prop('checked', false);
              }
            });

            _this.exportedArray = _this.exportedArray.concat(success);
            App.saveExportedCargos('lardi', _this.exportedArray);

            $('.check-all').prop('checked', false);
            App.scenes.cargosList.setCheckAllAvailability();

            App.stopLoading();
            if (error.length > 0) {
              swal('Ошибка', 'Не удалось экспортировать некоторые грузы');
            } else {
              swal({
                title: '',
                text: 'Грузы успешно добавлены',
                imageUrl: '/css/images/success.png',
                confirmButtonText: 'OK'
              });
            }
          },
          function (error) {
            App.stopLoading();
            if (error.error === 'No object') {
              swal('Ошибка', 'Не выбран ни один груз');
            } else {
              console.log(error);
              swal('Ошибка', 'Не удалось отправить данные на Cargo.LT');
            }
          }
        );
      },
      function (error) {
        App.stopLoading();
        console.log(error);
        swal('Ошибка', 'Не удалось создать копии для экспорта');
      });
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
