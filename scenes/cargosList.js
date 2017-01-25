'use strict';

App.scenes.cargosList = {

  show: function () {
    var self = this;
    var template;
    var today = new Date().setUTCHours(0, 0, 0, 0);
    var getLardiCargos = this.getLardiCargos();
    var getLardiCurrencies = App.exchanges.getLardiCurrencies();
    var exportedArray = SMData.getExportedCargos('lardi') || [];
    var pendingArray = SMData.getPendingCargos('lardi') || [];
    var erroredArray = SMData.getErrorCargos('lardi') || [];

    if (!App.checkToken('lardi')) {
      return App.changeScene('cargos');
    }

    this.currentArray = [];
    this.lardiCargos = [];
    this.newArray = [];
    this.oldArray = SMData.getWatchedCargos('lardi') || [];
    this.exportedArray = [];
    this.pendingArray = [];
    this.erroredArray = [];

    App.loading('Получение данных');

    $.when(getLardiCargos, getLardiCurrencies).then(
      function (lardiCargos, lardiCurrencies) {
        var currencies = XMLtoJson(lardiCurrencies).response;

        if (!currencies || !currencies.item) {
          console.log('Lardi doesn\'t response for currencies request');
          if (currencies.error) {
            SMData.removeToken('lardi');
            return App.scenes.auth.signIn('lardi', App.appData.lardi.login, App.appData.lardi.password, function (key, result) {
              if (result) {
                self.show();
              } else {
                App.checkRouteButtons();
                SMData.removeUserData('lardi');
                App.changeScene('settings');
              }
            });
          }
          return App.changeScene('cargos');
        } else {
          currencies = currencies.item;
        }

        for (var i = 0; i < lardiCargos.length; i++) {
          if (new Date(lardiCargos[i].date_from) >= today) {
            self.lardiCargos.push(lardiCargos[i]);
          } else if (lardiCargos[i].date_to && new Date(lardiCargos[i].date_to) >= today) {
            lardiCargos[i].date_from = setLardiDate();
            self.lardiCargos.push(lardiCargos[i]);
          }
        }

        self.lardiCargos.forEach(function (cargo) {
            self.currentArray.push(cargo.id);
            currencies.forEach(function (el) {
              if (Number(el.id) == Number(cargo.payment_currency_id)) {
                cargo.payment_currency_name = el.name;
              }
            });
          });

        if (self.oldArray && Array.isArray(self.oldArray)) {
          self.currentArray.forEach(function (el) {
            if (self.oldArray.indexOf(el) < 0) {
              self.newArray.push(el);
            }
          });
        }

        if (self.exportedArray && exportedArray && Array.isArray(exportedArray)) {
          exportedArray.forEach(function (el) {
            if (self.currentArray.indexOf(el) > -1) {
              self.exportedArray.push(el);
            }
          });
        }

        if (self.pendingArray && pendingArray && Array.isArray(pendingArray)) {
          pendingArray.forEach(function (el) {
            if (self.currentArray.indexOf(el) > -1) {
              self.pendingArray.push(el);
            }
          });
        }

        if (self.erroredArray && erroredArray && Array.isArray(erroredArray)) {
          erroredArray.forEach(function (el) {
            if (self.currentArray.indexOf(el) > -1) {
              self.erroredArray.push(el);
            }
          });
        }

        self.lardiCargos.forEach(function (cargo) {
            if (self.newArray.indexOf(cargo.id) > -1) {
              cargo.isNew = 1;
            } else {
              cargo.isNew = 0;
            }

            if (self.exportedArray.indexOf(cargo.id) > -1) {
              cargo.isExported = 1;
            } else {
              cargo.isExported = 0;
            }

            if (self.pendingArray.indexOf(cargo.id) > -1) {
              cargo.isPending = 1;
            } else {
              cargo.isPending = 0;
            }

            if (self.erroredArray.indexOf(cargo.id) > -1) {
              cargo.isErrored = 1;
            } else {
              cargo.isErrored = 0;
            }
          });

        SMData.saveWatchedCargos('lardi', self.currentArray);
        SMData.saveExportedCargos('lardi', self.exportedArray);
        SMData.savePendingCargos('lardi', self.pendingArray);
        SMData.saveErrorCargos('lardi', self.erroredArray);

        template = _.templates.cargosList({
            wrapper_class: 'cargos-list',
            wrapper_id: 'cargos-list',
            orderButtonText: 'Экспортировать'
          });

        $('.ce__wrapper').empty().append(template);

        if (App.appData.lardi.contact === 'true' || App.appData.lardi.id === '0') {
          self.createTable();
        } else {
          self.createTable(App.appData.lardi.id);
        }

        self.createSelect();
        $('#contacts').on('change', function () {
          self.createTable($(this).val());
        });

        $('.check-all').on('change', function () {
          $('input[type=checkbox]:not(:disabled)').prop('checked', this.checked);
          $($('.lardi-cargo-checkbox')[0]).trigger('change', { isCheckAll: true });
        });

        $('#goCargosList').addClass('current-scene');
        $('#export').bind('click', self.exportDuplicates.bind(self));
        App.stopLoading();
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
    filteredCargos.sort(sortExportTable);

    if (id) {
      filteredCargos = filteredCargos.filter(filter);
    }

    template = _.templates.cargosListTable({
        lardiCargos: filteredCargos
      });

    $('#cargos-list table > tbody').empty().append(template);

    $('.lardi-cargo-checkbox').on('change', function (e, obj) {
      if (!obj || !obj.isCheckAll) {
        $('.check-all').prop('checked', false);
      }
      App.exportPort.postMessage({ task: 'exportEnabled' });
    });

    App.exportPort.postMessage({ task: 'exportEnabled' });
    $('.check-all').prop('checked', false);
    App.scenes.cargosList.setCheckAllAvailability();
    App.stopLoading();
  },

  setCheckAllAvailability: function () {
    if ($('.lardi-cargo-checkbox:disabled').length >= $('.lardi-cargo-checkbox').length) {
      $('.check-all').prop('disabled', true);
      $('.check-all').prop('checked', false);
    } else {
      $('.check-all').prop('disabled', false);
    }
  },

  createSelect: function () {
    var isSelectedUser = false;
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
            count: el.isExported ? 0 : 1
          };

          if (!selections.some(isIDInArray.bind(null, contact))) {
            selections.push(contact);
          } else {
            if (!el.isExported) {
              updateContactsCounter(selections, contact.id);
            }
          }

          if (!el.isExported) {
            updateContactsCounter(selections, '');
          }
        }
      });

      selections.forEach(function(selection) {
        if (selection.id === App.appData.lardi.id) {
          isSelectedUser = true;
        }
      });

      if (!isSelectedUser) {
        selections.push({
          id: App.appData.lardi.id,
          name: App.appData.lardi.name,
          selected: true,
          count: 0
        });
      }

      selections.sort(sortContacts);
    } else {
      selections = [{
        id: '',
        name: 'Мои грузы',
        selected: true,
        count: 0
      }];

      this.lardiCargos.forEach(function (el) {
        if ('contact' in el && 'face' in el && 'name' in el) {
          if (!el.isExported) {
            updateContactsCounter(selections, '');
          }
        }
      });
    }

    template = _.templates.cargosListContacts({ contacts: selections });
    $('.contacts-block').empty().append(template);
  },

  getLardiCargos: function () {
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

        if ('response' in resp) {
          resp = resp.response;
          if ('gruz' in resp) {
            resp = resp.gruz;
            if (typeof resp === 'object' && 'item' in resp && typeof resp.item === 'object') {
              if (Array.isArray(resp.item)) {
                cargos = resp.item;
              } else {
                cargos.push(resp.item);
              }
            }
          }
        }

        result.resolve(cargos);
      }
    });

    return result.promise();
  },

  createCargoDuplicate: function (object, atips) {
    var self = this;
    var note = [];
    var loads = this.setLoadTypes(object.zagruz_set);
    var cargo = new CargoObject();
    var autoTips = atips;
    var placeFrom = [];
    var areaFrom;
    var placeTo = [];
    var areaTo;
    var day;
    var countryFrom;
    var countryTo;

    return false;

    areaFrom = getLardiAreaName(object.country_from_id, object.area_from_id);
    areaTo = getLardiAreaName(object.country_to_id, object.area_to_id);
    countryFrom = getLardiCountryCode(object.country_from_id);
    countryTo = getLardiCountryCode(object.country_to_id);

    placeFrom.push(normalizeCity(object.city_from));
    placeTo.push(normalizeCity(object.city_to));

    if (areaFrom) {
      placeFrom.push(getCargoArea(object.area_from_id, areaFrom, countryFrom));
    }

    if (areaTo) {
      placeTo.push(getCargoArea(object.area_to_id, areaTo, countryTo));
    }

    delete cargo.from;
    delete cargo.to;
    cargo.origins = [];
    cargo.destinations = [];
    cargo.origins.push({ country: countryFrom, name: placeFrom.join(', ') });
    cargo.destinations.push({ country: countryTo, name: placeTo.join(', ') });

    //Cargo type
    cargo.type = getID(cargoTypes, object.gruz);
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
    cargo.volume = parseFloat(object.value) || 0.0;

    //weight
    cargo.weight = parseFloat(object.mass) || 0.0;

    //trailers
    object.body_type_id = parseInt(object.body_type_id);
    object.body_type_group_id = parseInt(object.body_type_group_id);
    cargo.trailers = setCargoBodyType(object.body_type_id, object.body_type_group_id);

    /**fix for "Крытые" body_type_group_id */
    if (object.body_type_group_id && object.body_type_group_id === 1 && !object.body_type_id) {
      if ((cargo.weight > 7.5 || cargo.volume > 50) && cargo.trailers.indexOf(10) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(10), 1);
      }
      if ((cargo.weight > 3.5 || cargo.volume > 35)  && cargo.trailers.indexOf(17) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(17), 1);
      }
      if ((cargo.weight > 2 || cargo.volume > 20) && cargo.trailers.indexOf(9) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(9), 1);
      }
      if (cargo.volume > 92 && cargo.trailers.indexOf(2) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(2), 1);
      }
      if (cargo.volume > 100 && cargo.trailers.indexOf(13) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(13), 1);
      }
      if (cargo.volume > 120 && cargo.trailers.indexOf(8) > -1) {
        cargo.trailers.splice(cargo.trailers.indexOf(8), 1);
      }
    }

    /* end fix*/

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
        note.push(object.auto_col + ' ' + getName(autoTips, object.auto_col_id));
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
    cargo.token = App.appData.cargo.token;
    return cargo;
  },

  markCargos: function () {
    var self = this;
    var args = [];
    var success = [];
    var error = [];
    var $checked;

    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    args.forEach(function (el) {
      if (!('id' in el)) {
        return false;
      }

      if (el.error && el.id) {
        if (self.erroredArray.indexOf(el.id) === -1) {
          self.erroredArray.push(el.id);
        }
        error.push(el.id);
      } else {
        if (self.erroredArray.indexOf(el.id) > -1) {
          self.erroredArray.splice(self.erroredArray.indexOf(el.id), 1);
        }
        success.push(el.id);
      }
    });

    if (App.currentScene === App.scenes.cargosList) {
      $checked = $('.lardi-cargo-checkbox:checked');
      $checked.each(function (i, el) {

        if (error.indexOf($(el).val()) !== -1) {
          $(el).closest('tr').removeClass('pending');
          $(el).closest('tr').addClass('error');
          $(el).prop('disabled', false);
          $(el).prop('checked', false);
        }

        if (success.indexOf($(el).val()) !== -1) {
          $(el).closest('tr').removeClass('pending');
          $(el).closest('tr').addClass('successed');
          $(el).prop('disabled', true);
          $(el).prop('checked', false);
        }
      });

      self.exportedArray = self.exportedArray.concat(success);
    }

  },

  exportDuplicates: function () {
    var self = this;
    var selected = [];
    var duplicates = [];
    var $checked = $('.lardi-cargo-checkbox:checked');
    var $errored = $('tr.error');
    var getAutoColTips = App.exchanges.getLardiAutoTips();

    if (!$checked.length) {
      return swal('Ошибка', 'Не выбран ни один груз');
    }

    this.enableExport(true);

    $checked.each(function (i, el) {
      selected.push($(el).val());
      $(el).closest('tr').removeClass('new-cargo');
      $(el).closest('tr').addClass('pending');
      $(el).prop('disabled', true);
    });

    this.setCheckAllAvailability();

    SMData.savePendingCargos('lardi', SMData.getPendingCargos().concat(selected));

    $errored.removeClass('error');

    $.when(getAutoColTips).then(function (resp) {
      var atips = [];
      resp = XMLtoJson(resp);

      if (!('response' in resp)) {
        App.stopLoading();
        console.log('Couldn\'t get AutoColTips from lardi');
        return swal('Ошибка', 'Сервер не отвечает');
      }

      resp = resp.response;

      if ('item' in resp) {
        if (Array.isArray(resp.item)) {
          atips = resp.item;
        } else if (resp.item instanceof Object && 'id' in resp.item && 'name' in resp.item) {
          atips.push(resp.item);
        }
      }

      selected.forEach(function (id) {
        self.lardiCargos.forEach(function (cargo) {
          if (cargo.id === id) {
            duplicates.push(self.createCargoDuplicate(cargo, atips));
          }
        });
      });

      App.exportPort.postMessage({ task: 'addToQueue', props: duplicates });

    }, function (err) {
      App.stopLoading();
      console.log(err);
      swal('Ошибка', 'Сервер не отвечает');
    });

  },

  enableExport: function (bool) {
    var disabled = bool || false;

    if (!disabled) {
      $('.pending').find('.lardi-cargo-checkbox').prop('disabled', false);
      $('.pending').removeClass('pending');
      SMData.savePendingCargos('lardi', []);

      if ($('.lardi-cargo-checkbox:checked:not(:disabled)').length) {
        $('#export').prop('disabled', false);
        $('#export').addClass('active');
      } else {
        $('#export').prop('disabled', true);
        $('#export').removeClass('active');
      }
    } else {
      $('#export').prop('disabled', true);
      $('#export').removeClass('active');
    }
    this.setCheckAllAvailability();
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
