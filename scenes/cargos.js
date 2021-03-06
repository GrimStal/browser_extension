'use strict';

App.scenes.cargos = {
  show: function () {
    function currentMonth() {
      var month = getTimestamp(this) * 1000;
      month = new Date(month).toLocaleString('ru', { month: 'long' });
      if (month === calendar.months[0]) {
        return true;
      }

      return false;
    }

    function nextMonth() {
      var month = getTimestamp(this) * 1000;
      month = new Date(month).toLocaleString('ru', { month: 'long' });
      if (month === calendar.months[1]) {
        return true;
      }

      return false;
    }

    /**
     * JQuery-UI Autocomplete data setting function.
     * @param  {Object} request  Has 'term' param, data set in input.
     * @param  {function} response Must get as argument an array or array of objects with label and value params.
     */
    function parseForAutocomplete(request, response) {
      App.exchanges.getLocations(request.term).then(function (res) {
        var results = $.map(res.locations, function (v, i) {
          switch (v.type) {
            case 0:
              return;
            case 1:
              if (v.name !== 'Russia Kaliningrad') {
                return;
              }

            default:
              return { label: v.name, value: v.name, object: v };
          }
        });

        response(results.sort(sortCities));
      },
      function (err) {
        console.error(err);
      });
    }

    var self = this;
    var calendar = this.getCalendarDates(4, 'ru');
    var today = new Date().setHours(0, 0, 0, 0) / 1000;
    var cargosData = Templates.cargosOffer;
    var getTrailerTypes = App.exchanges.getTrailerTypes();
    var getCurrencies = App.exchanges.getCurrencies();

    this.addingObj = SMData.getCargoAdding() || new AddingCargo();
    this.cargoTypeSet = 0;
    this.cargo = new CargoObject();
    this.lardi = new LardiTransCargoObject();

    $.when(getTrailerTypes, getCurrencies).then(function (ttypes, currencies) {
      var curFtt = concatArraysInArray(cargosData.trailerTypes.fixed);
      var currencies = createSortedObjectsArray(currencies.currencies);
      var trailerTypes = createSortedObjectsArray(ttypes.trailerTypes);
      trailerTypes = removeDuplicates(trailerTypes, curFtt);

      cargosData.dates = calendar.dates;
      cargosData.currentMonth = calendar.months[0];
      cargosData.nextMonth = calendar.months[1];
      cargosData.cargoTypes = cargoTypes;
      cargosData.trailerTypes.fixed[2].splice(-1, 1, trailerTypes);
      cargosData.currencies = currencies;
      $('.ce__wrapper').empty().append(_.templates.cargos(cargosData));

      /** Initialization of calendar: Set current date, add onClick function
      *   for available dates to set cargos, mark past dates,
      */
      $('.date').filter(getToday).addClass('today');
      $('.date').filter(availableDates).bind('click', self.selectDate.bind(self));
      $('.date').filter(pastDates).addClass('past');
      $('.date').filter(currentMonth).find('div').addClass('current-month');
      $('.date').filter(nextMonth).find('div').addClass('next-month');

      /** Disable to enter not digital chars to input */
      $('#price, #weight, #volume, #palets').bind('keyup keypress', onlyPositiveDigits);
      $('#temperatureMin, #temperatureMax').bind('keyup keypress', onlyDigits);

      /** Save the origin and destination objects on authocomplete select.
      * Also check if origin and destination are different countries - set tir.
      * Check if cargo is not Ukraine-Ukraine - set currency to EURO. Else - UAH.
      */
      $('#origin').autocomplete({
        source: parseForAutocomplete,
        select: function (event, obj) {
          var index;
          self.cargo.from[0] = obj.item.object;
          self.addingObj.from[0] = obj.item.object;
          SMData.saveCargoAdding(self.addingObj);
          if (self.cargo.to.length) {
            if (!self.isSameCountry()) {
              $('.document-type-checkbox[value=tir]').prop('checked', true);
              $('.document-type-checkbox[value=tir]').trigger('change');
              $('#currency').val(2);
            } else {
              index = ~obj.item.label.lastIndexOf(', ') ? (obj.item.label.lastIndexOf(', ') + 3) : 0;
              if (obj.item.label.slice(index) === 'Ukraine') {
                $('#currency').val(15);
              } else {
                $('#currency').val(2);
              }
              $('#currency').trigger('change');
            }
          }
        },
      });

      $('#destination').autocomplete({
        source: parseForAutocomplete,
        select: function (event, obj) {
          var index;
          self.cargo.to[0] = obj.item.object;
          self.addingObj.to[0] = obj.item.object;
          SMData.saveCargoAdding(self.addingObj);
          if (self.cargo.from.length) {
            if (!self.isSameCountry()) {
              $('.document-type-checkbox[value=tir]').prop('checked', true);
              $('.document-type-checkbox[value=tir]').trigger('change');
              $('#currency').val(2);
            } else {
              index = ~obj.item.label.lastIndexOf(', ') ? (obj.item.label.lastIndexOf(', ') + 3) : 0;
              if (obj.item.label.slice(index) === 'Ukraine') {
                $('#currency').val(15);
              } else {
                $('#currency').val(2);
              }
              $('#currency').trigger('change');
            }
          }
        },
      });

      $('#payment-type').val(2);

      $('#removeSelection').bind('click', function () {
        self.removeSelection(true);
      });

      $('#origin, #destination').bind('keyup', self.toggleClear);
      $('.origin-remove, .destination-remove').bind('click', self.removeCity);
      $('.revert-cities').bind('click', self.revertCities.bind(self));
      $('.trailer-type-select').change(insertCheckbox);
      $('#cargo-types').change(setCargoDependencies);
      $('#sendOrder').bind('click', self.sendCargosData.bind(self));
      $('#clean').bind('click', self.clearForm.bind(self));

      $('#weight, #volume, #palets, #temperatureMin, #temperatureMax, .trailer-type-select, ' +
        '.trailer-type-checkbox').bind('change', useEnteredData);

      $('#price, #currency').on('change', function () {
        self.addingObj[this.id] = $(this).val();
        SMData.saveCargoAdding(self.addingObj);
      });

      $('#payment-type').on('change', function () {
        self.addingObj.paymentType = $(this).val();
        SMData.saveCargoAdding(self.addingObj);
      });

      $('#by-request').change(function () {
        $('#payment-fieldset').attr('disabled', this.checked);
        if (this.checked) {
          $('#price, #currency').val('');
          $('#payment-type').val('2');
        } else {
          $('#currency').val('2');
        }
        $('#price, #currency, #payment-type').trigger('change');
        self.addingObj.priceRequest = this.checked;
        SMData.saveCargoAdding(self.addingObj);
      });

      $('#goCargos').addClass('current-scene');

      /** Fix for saving data */
      self.restoreData();
      $('#weight, #volume, #palets, #ldm,  #temperatureMin,' +
        '#temperatureMax, #adr').bind('change', function () {
        self.addingObj[this.id] = $(this).val();
        SMData.saveCargoAdding(self.addingObj);
      });

      $('.trailer-type-checkbox').on('change', function () {
        if ($(this).prop('checked')) {
          addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.trailers, $(this).val());
        } else {
          removeFromArray(App.scenes.cargos.addingObj.trailers, $(this).val());
        }
        SMData.saveCargoAdding(self.addingObj);
      });

      $('.load-type-checkbox').on('change', function () {
        if ($(this).prop('checked')) {
          addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.loadTypes, $(this).val());
        } else {
          removeFromArray(App.scenes.cargos.addingObj.loadTypes, $(this).val());
        }
        SMData.saveCargoAdding(self.addingObj);
      });

      $('.document-type-checkbox').on('change', function () {
        if ($(this).prop('checked')) {
          addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.documentTypes, $(this).val());
        } else {
          removeFromArray(App.scenes.cargos.addingObj.documentTypes, $(this).val());
        }
        SMData.saveCargoAdding(self.addingObj);
      });

      $('#note').on('change', function () {
        self.addingObj.note = $(this).val();
        SMData.saveCargoAdding(self.addingObj);
      });

      /** End Fix */

      self.setDates();
      App.stopLoading();
    }, function (errors) {
      console.log(errors);
    });
  },

  hide: function () {
    $('.date').unbind('click');
    $('#removeSelection').unbind('click');
    $('.revert-cities').unbind('click');

    $('#price, #weight, #volume, #palets').unbind('keyup keypress');
    $('#temperatureMin, #temperatureMax').unbind('keyup keypress');

    $('.trailer-type-select').unbind('change');
    $('#cargo-types').unbind('change');
    $('.trailer-type-checkbox[value=1], .trailer-type-checkbox[value=3]').unbind('change');
    $('#sendOrder').unbind('click');
    $('#clean').unbind('click');

    $('#origin, #destination').unbind('keyup');
    $('.origin-remove, .destination-remove').unbind('click');

    $('.ce__wrapper').empty();
  },

  restoreData: function () {
    var self = this;
    var trailers = [];
    var loadTypes = [];
    var documentTypes = [];

    // Dates
    this.addingObj.dates.forEach(function (timestamp) {
      $('.date').each(function () {
        if (parseInt($(this).attr('timestamp')) === timestamp) {
          $(this).addClass('selected');
        }
      });
    });

    if ($('.date.selected').length) {
      $('#removeSelection').show();
    }

    //cities
    if (this.addingObj.from.length) {
      this.cargo.from = cloneObj(this.addingObj.from);
      $('#origin').val(this.cargo.from[0].name);
    }
    if (this.addingObj.to.length) {
      this.cargo.to = cloneObj(this.addingObj.to);
      $('#destination').val(this.cargo.to[0].name);
    }

    $('#origin, #destination').trigger('keyup', this.toggleClear);

    //cargoType
    if (this.addingObj.cargoType) {
      $('#cargo-types').find('option[value="' + this.addingObj.cargoType + '"]').prop('selected', true);
    }

    //weight
    if (this.addingObj.weight !== '') {
      $('#weight').val(this.addingObj.weight);
    }

    //volume
    if (this.addingObj.volume !== '') {
      $('#volume').val(this.addingObj.volume);
    }

    //ldm
    if (this.addingObj.ldm !== '') {
      $('#ldm').val(this.addingObj.ldm);
    }

    //palets
    if (this.addingObj.palets !== '') {
      $('#palets').val(this.addingObj.palets);
    }

    //temperatureMin
    if (this.addingObj.temperatureMin !== '') {
      $('#temperatureMin').val(this.addingObj.temperatureMin);
    }

    //temperatureMax
    if (this.addingObj.temperatureMax !== '') {
      $('#temperatureMax').val(this.addingObj.temperatureMax);
    }

    //adr
    if (this.addingObj.adr) {
      $('#adr').find('option[value=' + this.addingObj.adr + ']').prop('selected', true);
    }

    //trailers
    if (this.addingObj.trailers && Array.isArray(this.addingObj.trailers)) {
      trailers = trailers.concat(this.addingObj.trailers);

      trailers.forEach(function (el, i) {
        if ($('.trailer-type-checkbox[value=' + el + ']').length) {
          $('.trailer-type-checkbox[value=' + el + ']').prop('checked', true);
        } else if ($('.trailer-type-select').find('option[value=' + el + ']').length) {
          $('.trailer-type-select').find('option[value=' + el + ']').prop('selected', true).trigger('change');
        }
        self.cargoTypeSet = 0;
      });
    }

    //loadTypes
    if (this.addingObj.loadTypes && Array.isArray(this.addingObj.loadTypes)) {
      loadTypes = loadTypes.concat(this.addingObj.loadTypes);

      loadTypes.forEach(function (el, i) {
        if ($('.load-type-checkbox[value=' + el + ']').length) {
          $('.load-type-checkbox[value=' + el + ']').prop('checked', true);
        }
        self.cargoTypeSet = 0;
      });
    }

    //documentTypes
    if (this.addingObj.documentTypes && Array.isArray(this.addingObj.documentTypes)) {
      documentTypes = documentTypes.concat(this.addingObj.documentTypes);

      documentTypes.forEach(function (el, i) {
        if ($('.document-type-checkbox[value=' + el + ']').length) {
          $('.document-type-checkbox[value=' + el + ']').prop('checked', true);
        }
        self.cargoTypeSet = 0;
      });
    }

    //pricerequest
    if (this.addingObj.priceRequest) {
      $('#by-request').prop('checked', true);
      return $('#by-request').trigger('change');
    }

    //price
    if (this.addingObj.price) {
      $('#price').val(this.addingObj.price);
    }

    //currency
    if (this.addingObj.currency) {
      $('#currency').find('option[value="' + this.addingObj.currency + '"]').prop('selected', true);
    }

    //payment-type
    if (this.addingObj.paymentType) {
      $('#payment-type').find('option[value=' + this.addingObj.paymentType + ']').prop('selected', true);
    }

    if (this.addingObj.note) {
      $('#note').val(this.addingObj.note);
    }
  },

  isSameCountry: function () {
    var from;
    var to;
    if (this.cargo && 'from' in this.cargo && 'to' in this.cargo) {
      if (Array.isArray(this.cargo.from) && Array.isArray(this.cargo.to)) {
        if (this.cargo.to.length && this.cargo.from.length) {
          if ('name' in this.cargo.from[0] && 'name' in this.cargo.to[0]) {
            from = this.cargo.from[0].name;
            from = from.slice(from.lastIndexOf(', ') || 0);
            to = this.cargo.to[0].name;
            to = to.slice(to.lastIndexOf(', ') || 0);
            if (from !== to) {
              return false;
            }
          }
        }
      }
    }
    return true;
  },

  selectionRule: function ($elements) {
    var weekdays = $elements.filter('.weekday').length;
    var weekends = $elements.filter('.weekend').length;
    var thursday = $elements.filter('.thursday').length;
    var curLength = $elements.length;
    var message = 'Максимальный период публикации ';
    var allowed = 3;

    /** Cargo.lt calendar logic: the bid can be selected on three
  *  days not inculuding weekends. But if start from thursday
  *  then saturday considered as working day for shipment;
  */
    if (((weekdays + weekends) <= 3) || (!thursday && weekends <= 2 && weekdays <= 3)) {
      this.removeSelection();
      $elements.addClass('selected');
      return true;
    } else {
      if (!weekends && weekdays > 3) {
        allowed = 3;
      } else if (weekends === 2 && weekdays > 3 && !thursday) {
        allowed = 5;
      } else if (weekends === 2 && weekdays > 3 && thursday) {
        allowed = 3;
      } else if (weekends === 1 && weekdays > 3) {
        allowed = 4;
      }

      message += allowed + ((allowed % 5)
          ? ' дня'
          : ' дней');
      return swal(message);
    }

  },

  setDates: function () {
    var today = new Date().setHours(0, 0, 0, 0) / 1000;
    var dates = [];
    this.dates = [];

    $('.date.selected').each(function (key, el, arr) {
      var timestamp = parseInt($(el).attr('timestamp'));
      var lastAdded;
      if (timestamp < today) {
        dates = [];
        return false;
      }

      if (dates.length !== 0) {
        lastAdded = dates[dates.length - 1];
        if ((lastAdded + (24 * 60 * 60)) != timestamp) {
          dates = [];
          return false;
        } else {
          dates.push(timestamp);
        }
      } else {
        dates.push(timestamp);
      }

    });

    //saveCargoAdding
    this.addingObj.dates = dates;
    SMData.saveCargoAdding(this.addingObj);

    return this.dates = dates;
  },

  /**
   * Removes all selections in calendar.
   * @param  {boolean} hide Need to hide button
   */
  removeSelection: function (hide) {
    $('.selected').removeClass('selected');
    this.setDates();
    if (hide) {
      $('#removeSelection').hide();
    }
  },

  removeCity: function () {
    var context = App.scenes.cargos;
    var input = $(this).prev('input');
    $(input).val('');
    $(this).hide();
    switch ($(input).attr('id')) {
      case 'origin':
        context.cargo.from.pop();
        context.addingObj.from = context.cargo.from;
        break;
      case 'destination':
        context.cargo.to.pop();
        context.addingObj.to = context.cargo.to;
        break;
      default:
        console.log('Unknown id');
    }
    //saveCargoAdding
    SMData.saveCargoAdding(context.addingObj);
  },

  removeAdditionalCheckboxes: function () {
    $('.trailer-type-checkbox[type=checkbox]').each(function () {
      if (['1', '2', '3', '8', '9', '10', '13', '17'].indexOf($(this).val()) < 0) {
        $(this).parent().remove();
      }
    });
  },

  selectDate: function (e) {
    var $el;
    var $elClass;
    var $selected;
    var $next;
    var $prev;

    if (!e) {
      return false;
    }

    $el = $(e.currentTarget);
    $elClass = '.' + $el.attr('class').split(' ').join('.');

    if ($('.selected').length === 0) {
      $('#removeSelection').show();
      $el.addClass('selected');
      return this.setDates();
    }

    $selected = $('.selected:first');
    $next = $selected.nextAll().add($selected).add($selected.parent().nextAll().children());
    $prev = $selected.prevAll().add($selected.parent().prevAll(':has("td")').children());

    if ($prev.is($elClass)) {
      this.removeSelection();
      $el.addClass('selected');
    } else if ($next.is($elClass)) {
      $next = $next.slice(0, $next.index($el) + 1);
      this.selectionRule($next);
    }

    return this.setDates();
  },

  /**
   * Returns the array of dates (only date nums) for set number of weeks
   * from current week start
   * @param  {number} weeks Amount of weeks to return dates
   * @return {array} Array of date nums
   */
  getCalendarDates: function (weeks, locale) {
    var today = new Date();
    var weekstart = new Date(today);
    var currentMonth;
    var nextMonth;
    var dates = [];

    if (!weeks) {
      return false;
    }

    if (today.getDay() !== 1) {
      weekstart.setDate(weekstart.getDate() - weekstart.getDay() + 1);
    }

    for (var i = 0; i < (weeks * 7); i++) {
      var date = new Date(weekstart);
      date.setDate(weekstart.getDate() + i);
      dates.push(date);
    }

    currentMonth = weekstart.toLocaleString(locale, { month: 'long' });
    nextMonth = dates[dates.length - 1].toLocaleString(locale, { month: 'long' });

    return {
      dates: dates,
      months: [currentMonth, nextMonth],
    };
  },

  revertCities: function () {
    if (!$('#origin') || !$('#destination')) {
      return false;
    }

    var $rev;
    var revObj;
    var $origin = $('#origin');
    var $destination = $('#destination');

    $rev = $origin.val();
    $origin.val($destination.val());
    $destination.val($rev);

    revObj = cloneObj(this.cargo.from);
    this.cargo.from = cloneObj(this.cargo.to);
    this.addingObj.from = cloneObj(this.cargo.to);
    this.cargo.to = cloneObj(revObj);
    this.addingObj.to = cloneObj(revObj);

    //saveCargoAdding
    SMData.saveCargoAdding(this.addingObj);
  },

  sendCargosData: function () {
    var self = this;
    var cargo = this.cargo;
    var lardi = this.lardi;
    var dates = this.dates;
    var $cargoType = $('#cargo-types');
    var $adr = $('#adr');
    var $weight = $('#weight');
    var $volume = $('#volume');
    var $pallets = $('#palets');
    var $ldm = $('#ldm');
    var $tempMin = $('#temperatureMin');
    var $tempMax = $('#temperatureMax');
    var trailers = [];
    var $loadTypes = $('.load-type:checked');
    var $documents = $('.document-type:checked');
    var $price = $('#price');
    var $currency = $('#currency');
    var $paymentType = $('#payment-type');
    var $note = $('#note');
    var cnote = [];
    var lnote = [];
    var dateOptions = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    var originAddress;
    var destinationAddress;

    var cargoDef = $.Deferred();
    var lardiDef = $.Deferred();

    $('.trailer-type-checkbox:checked').each(function (i, el) {
      trailers.push(parseInt($(el).val()));
    });

    if (!cargo.from.length || !cargo.to.length) {
      return swal('Ошибка!', 'Укажите место отправления и назначения.');
    }

    originAddress = splitAddress(cargo.from[0]);
    destinationAddress = splitAddress(cargo.to[0]);

    if ((!originAddress[1] && !originAddress[2]) ||
      (!destinationAddress[1] && !destinationAddress[2])) {
      return swal('Ошибка!', 'Необходимо указать регион или город отправки и доставки');
    }

    if (!dates.length) {
      return swal('Ошибка!', 'Укажите даты загрузки.');
    }

    if (!$cargoType.val()) {
      return swal('Ошибка!', 'Укажите тип груза.');
    }

    if (trailers.length === 0) {
      return swal('Ошибка!', 'Укажите тип кузова.');
    }

    if (!Number($weight.val()) && !Number($volume.val()) && !Number($pallets.val())) {
      return swal('Ошибка!', 'Укажите информацию о грузе: вес, объём или кол-во палет.');
    }

    if ($price.val().length > 6) {
      return swal('Ошибка!', 'Укажите правильную сумму!');
    }

    App.loading('Отправка данных');

    cargo.fromDate = this.dates[0];
    cargo.tillDate = new Date(dates[dates.length - 1] * 1000).setUTCHours(23, 59) / 1000;
    //потому что карго нужно время конца погрузки 23:59, иначе ставит предыдущую дату
    lardi.date_from = new Date(dates[0] * 1000).toLocaleString('ru', dateOptions);
    lardi.date_to = new Date(dates[dates.length - 1] * 1000).toLocaleString('ru', dateOptions);

    cargo.type = $cargoType.val();
    lardi.gruz = $cargoType.find(':selected').text();

    cargo.weight = setFloatParam($weight.val(), null);
    lardi.mass = setFloatParam($weight.val(), undefined);

    cargo.volume = setFloatParam($volume.val(), null);
    lardi.value = setFloatParam($volume.val(), undefined);

    cargo.pallets = setParam($pallets.val(), null);
    cargo.volumeldm = setFloatParam($ldm.val(), 0.0);

    if ($tempMin.val() !== '' || $tempMax.val() !== '') {
      cargo.minTemperature = setParam($tempMin.val(), 0);
      cargo.maxTemperature = setParam($tempMax.val(), 0);
      lnote.push('t от ' + setParam($tempMin.val(), 0) + ' до ' + setParam($tempMax.val(), 0));
    }

    cargo.trailers = trailers;

    $loadTypes.each(function (i, el) {
      cargo[$(el).val()] = 1;
    });

    $documents.each(function (i, el) {
      switch ($(el).val()) {
        case 'tir':
          cargo.tir = 1;
          lardi.tir = true;
          break;
        case 'declaration':
          cargo.declaration = 1;
          lnote.push('по декларации');
          break;
        case 'cmr':
          lardi.cmr = true;
          cnote.push($(el).val().toUpperCase());
          break;
        case 't1':
          lardi.t1 = true;
          cnote.push($(el).val().toUpperCase());
          break;
        default:
          cnote.push($(el).val().toUpperCase());
          lnote.push($(el).val().toUpperCase());
          break;
      }
    });

    if (!$('#by-request').prop('checked')) {
      if ($price.val().length > 0) {
        cargo.price = setParam($price.val(), null);
        lardi.stavka = setParam($price.val(), null);

        cargo.currency = $currency.val();
      }

      if ($paymentType.val()) {
        cnote.push('Оплата: ' + $paymentType.find(':selected').text());
      }
    } else {
      cargo.pricerequest = 1;
    }

    if ($adr.val()) {
      cargo.adr = 1;
      cnote.push('ADR: ' + $adr.val());
      lardi.adr = Number($adr.val());
    }

    if ($note.val()) {
      cnote.push($note.val());
      lardi.note = $note.val();
    }

    cargo.notes = cnote.join(', ');

    cargo.token = App.appData.cargo.token;
    cargoDef.resolve({ obj: cargo });

    if (App.appData.lardi.token) {
      var getMoments = App.exchanges.getLardiPaymentMoments();
      var getLoadTypes = App.exchanges.getLardiLoadTypes();
      var getBodyTypes = App.exchanges.getLardiBodyTypes();
      var getOriginCountryCode = App.exchanges.getCountryCode(originAddress[0]);
      var getDestinationCountryCode = App.exchanges.getCountryCode(destinationAddress[0]);

      $.when(getMoments, getLoadTypes, getBodyTypes,
        getOriginCountryCode, getDestinationCountryCode).then(
          function (moments, loads, bodies, origin, destination) {
        var paymentMoments = XMLtoJson(moments).response.item;
        var loadTypes = XMLtoJson(loads).response.item;
        var notSupportedLoadTypes = getAdditionalLoadTypes(loadTypes, $loadTypes);
        var bodyTypes = XMLtoJson(bodies).response.item;
        var countries = lardiCountries;
        var originCC = origin[0]['alpha2Code'];
        var destinationCC = destination[0]['alpha2Code'];

        if (!$('#by-request').prop('checked')) {
          lardi.payment_moment_id = getPaymentMomentID(paymentMoments, parseInt($paymentType.val()));
          if (!lardi.payment_moment_id && ($paymentType.val() === '3' || $paymentType.val() === '2')) {
            lnote.push($paymentType.find(':selected').text());
          }

          lardi.payment_currency_id = getCurrencyID(parseInt($currency.val()));
        }

        lardi.zagruz_set = getLoadTypesMnemos(loadTypes, $loadTypes);
        if (notSupportedLoadTypes) {
          lnote.push('Загрузка: ' + notSupportedLoadTypes);
        }

        lardi = setLardiBodyType(lardi, parseInt($cargoType.val()), trailers, bodyTypes);

        lardi.country_from_id = getLardiCountryID(originCC, countries);
        lardi.country_to_id = getLardiCountryID(destinationCC, countries);

        lardi.area_from_id = getLardiAreaID(originCC, originAddress[1], countries);
        lardi.area_to_id = getLardiAreaID(destinationCC, destinationAddress[1], countries);

        lardi.city_from = originAddress.last() || 'Не указано';
        lardi.city_to = destinationAddress.last() || 'Не указано';

        lardi.add_info = lnote.join('; ');
        lardi.user_contact = parseInt(App.appData.lardi.id);
        lardi.sig = App.appData.lardi.token;

        lardiDef.resolve({ obj: lardi });

      }, function (error) {
        lardiDef.resolve({ error: error });
      });
    } else {
      lardiDef.resolve({});
    }

    $.when(cargoDef, lardiDef).then(function (cargoResp, lardiResp) {
      var requests = [];
      if (cargoResp && 'obj' in cargoResp) {
        requests.push(cargoResp.obj);
      }
      if (lardiResp) {
        if ('obj' in lardiResp) {
          requests.push(lardiResp.obj);
        } else if ('error' in lardiResp) {
          console.log(lardiResp.error);
        }
      }

      if ('error' in lardiResp) {
        swal({
          title: 'Внимание!',
          text: 'Произошла ошибка при получении данных от Lardi-Trans.',
          showCancelButton: true,
          confirmButtonColor: '#b2ca7b',
          confirmButtonText: 'Отправить на Cargo.lt',
          closeOnConfirm: true,
          closeOnCancel: true
        }, function (isConfirm) {
          if (isConfirm) {
            App.addPort.postMessage({ task: 'addToQueue', props: requests });
          } else {
            App.stopLoading();
          }
        });
      } else {
        console.log(requests);
        App.addPort.postMessage({ task: 'addToQueue', props: requests });
      }
    }, function (error) {
      console.log('This mistake could not happen!');
      console.log(error);
    });
  },

  clearForm: function () {
    this.removeCity.call($('.origin-remove, .destination-remove'));
    this.removeSelection(true);
    this.removeAdditionalCheckboxes();
    $('input[type=text], textarea').val('');
    $('select:not("#currency,#payment-type")').val('');
    $('#currency').val('15');
    $('#payment-fieldset').prop('disabled', false);
    $('input[type=checkbox]').prop('checked', false);
    $('#temperatureMin, #temperatureMax').val('');
    $('.trailer-type-select option').css('display', 'block');
    SMData.removeCargoAdding();
    this.addingObj = new AddingCargo();
    this.cargo = new CargoObject();
    this.lardi = new LardiTransCargoObject();
  },

  /**
   * Shows or hides icon to clear field depending on if data entered
   * @return {function} show/hide icon
   */
  toggleClear: function () {
    if (checkEmpty(this)) {
      return $(this).next('.form-control-feedback').hide();
    }

    return $(this).next('.form-control-feedback').show();
  },
};
