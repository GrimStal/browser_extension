'use strict';

App.scenes.cargos = {

    show: function() {

        /** Filters to set current and next months days in calendar. */
        function currentMonth() {
            var month = getTimestamp(this) * 1000;
            month = new Date(month).toLocaleString('ru', {month: 'long'});
            if (month === calendar.months[0]) {
                return true;
            }

            return false;
        }

        function nextMonth() {
            var month = getTimestamp(this) * 1000;
            month = new Date(month).toLocaleString('ru', {month: 'long'});
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
            _this.getLocations(request.term).then(function(res) {
                response($.map(res.locations, function(v, i) {
                    return {label: v.name, value: v.name, object: v};
                }));
            }, function(err) {
                console.error(err);
            });
        }

        var _this = this;
        var calendar = this.getCalendarDates(4, 'ru');
        var today = new Date().setHours(0, 0, 0, 0) / 1000;
        var cargosData = Templates.cargosOffer;
        var getCargoTypes = this.getCargoTypes();
        var getTrailerTypes = this.getTrailerTypes();
        var getCurrencies = this.getCurrencies();

        this.cargo = new CargoObject();

        $.when(getCargoTypes, getTrailerTypes, getCurrencies).then(function(ctypes, ttypes, currencies) {
            var curFtt = concatArraysInArray(cargosData.trailerTypes.fixed);
            var cargoTypes = createSortedObjectsArray(ctypes.cargoTypes);
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
            $('#header-message').text('Добавление груза на Cargo.LT и Lardi-Trans');

            /** Initialization of calendar: Set current date, add onClick function
            *   for available dates to set cargos, mark past dates,
            */
            $('.date').filter(getToday).addClass('today');
            $('.date').filter(availableDates).bind('click', _this.selectDate.bind(_this));
            $('.date').filter(pastDates).addClass('past');
            $('.date').filter(currentMonth).find('div').addClass('current-month');
            $('.date').filter(nextMonth).find('div').addClass('next-month');

            /** Disable to enter not digital chars to input */
            $('#price, #weight, #volume, #palets').bind('keyup keypress', onlyPositiveDigits);
            $('#temperatureMin, #temperatureMax').bind('keyup keypress', onlyDigits);

            /** Save the origin and destination objects on authocomplete select */
            $('#origin').autocomplete({
                source: parseForAutocomplete,
                select: function(event, obj) {
                    _this.cargo.from.push(obj.item.object);
                }
            });

            $('#destination').autocomplete({
                source: parseForAutocomplete,
                select: function(event, obj) {
                    _this.cargo.to.push(obj.item.object);
                }
            });

            $('#removeSelection').bind('click', function() {
                _this.removeSelection(true);
            });

            $('.revert-cities').bind('click', _this.revertCities.bind(_this));
            $('.trailer-type-select').change(insertCheckbox);
            $('#cargo-types').change(setCargoDependencies);
            $('.trailer-type-checkbox[value=1], .trailer-type-checkbox[value=3]').change(checkTemperature);
            $('#sendOrder').bind('click', _this.sendCargosData.bind(_this));

            _this.setDates();
        }, function(errors) {
            console.log(errors);
        });
    },

    hide: function() {
        this.removeSelection();
        $('.date').unbind('click', this.selectDate);
        $('#removeSelection').unbind('click');
        $('.revert-cities').unbind('click', this.revertCities);

        $('#price, #weight, #volume, #palets').unbind('keyup keypress', onlyPositiveDigits);
        $('#temperatureMin, #temperatureMax').unbind('keyup keypress', onlyDigits);

        $('.trailer-type-select').unbind('change');
        $('#cargo-types').unbind('change');
        $('.trailer-type-checkbox[value=1], .trailer-type-checkbox[value=3]').unbind('change');
        $('#sendOrder').unbind('click');

        $('.ce__wrapper').empty();
    },

    selectionRule: function($elements) {
        var weekdays = $elements.filter('.weekday').length;
        var weekends = $elements.filter('.weekend').length;
        var thursday = $elements.filter('.thursday').length;
        var curLength = $elements.length;
        var message = 'Можно указать только ';
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
            } else if (weekends === 2 && weekdays > 3) {
                allowed = 5;
            } else if (weekends === 1 && weekdays > 3) {
                allowed = 4;
            }

            message += allowed + (allowed % 5
                ? ' дня'
                : ' дней');
            return alert(message);
        }

    },

    setDates: function() {
        var today = new Date().setHours(0, 0, 0, 0) / 1000;
        var dates = [];
        this.dates = [];

        $('.selected').each(function(key, el, arr) {
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

        return this.dates = dates;
    },

    /**
     * Removes all selections in calendar.
     * @param  {boolean} hide Need to hide button
     */
    removeSelection: function(hide) {
        $('.selected').removeClass('selected');
        App.scenes.cargos.setDates();
        if (hide) {
            $('#removeSelection').hide();
        }
    },

    selectDate: function(e) {
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
    getCalendarDates: function(weeks, locale) {
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

        currentMonth = weekstart.toLocaleString(locale, {month: 'long'});
        nextMonth = dates[dates.length - 1].toLocaleString(locale, {month: 'long'});

        return {
            dates: dates,
            months: [currentMonth, nextMonth]
        };
    },

    revertCities: function() {
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
        this.cargo.to = cloneObj(revObj);
    },

    getDataFromServer: function(req) {
        var result = $.Deferred();

        App.sendRequest(req, function(response) {
            if (response.error) {
                return result.reject(response.error);
            }

            return result.resolve(response.success);
        });

        return result.promise();
    },

    getCargoTypes: function() {
        var req = new Request('cargo', 'GET', 'cargoTypes');
        return this.getDataFromServer(req);
    },

    getTrailerTypes: function() {
        var req = new Request('cargo', 'GET', 'trailerTypes');
        return this.getDataFromServer(req);
    },

    getCurrencies: function() {
        var req = new Request('cargo', 'GET', 'currencies');
        return this.getDataFromServer(req);
    },

    getLocations: function(name) {
        var req = new Request('cargo', 'GET', 'locations');
        req.headers = {
            'Access-Token': App.appData.cargo.token
        };
        req.data = {
            name: name
        };
        return this.getDataFromServer(req);
    },

    sendCargosData: function() {
        var _this = this;
        var cargo = this.cargo;
        var $cargoType = $('#cargo-types');
        var $adr = $('#adr');
        var $weight = $('#weight');
        var $volume = $('#volume');
        var $pallets = $('#palets');
        var $tempMin = $('#temperatureMin');
        var $tempMax = $('#temperatureMax');
        var trailers = [];
        var $loadTypes = $('.load-type:checked');
        var $documents = $('.document-type:checked');
        var $price = $('#price');
        var $currency = $('#currency');
        var $paymentType = $('#payment-type');
        var $note = $('#note');
        var note = [];


        $('.trailer-type-checkbox:checked').each(function(i, el) {
            trailers.push($(el).val());
        });

        if (!cargo.from.length || !cargo.to.length) {
            return alert('Укажите место отправления и назначения');
        }

        if (!this.dates.length) {
            return alert('Укажите даты отправки');
        }

        if (!$cargoType.val()) {
            return alert('Укажите тип груза');
        }

        if (!$weight.val() && !$value.val() && !$pallets.val()) {
            return alert('Укажите информацию о грузе');
        }

        cargo.type = $cargoType.val();
        cargo.weight = setParam($weight.val(), null);
        cargo.volume = setParam($volume.val(), null);
        cargo.pallets = setParam($pallets.val(), null);

        if (!$('#temperature').prop('disabled')) {
            cargo.minTemperature = setParam($tempMin.val(), 0);
            cargo.maxTemperature = setParam($tempMax.val(), 0);
        }

        cargo.trailers = trailers;
        cargo.price = setParam($price.val(), null);
        cargo.currency = $currency.val();

        $loadTypes.each(function (i, el) {
          cargo[$(el).val()] = 1;
        });

        $documents.each(function (i, el) {
          switch ($(el).val()) {
            case 'tir':
              cargo.tir = 1;
              break;
            case 'declaration':
              cargo.declaration = 1;
              break;
            default:
              note.push($(el).val().toUpperCase());
              break;
          }
        });

        if ($paymentType.val()) {
          note.push('Оплата: ' + $paymentType.find(':selected').text());
        }

        if ($adr.val()) {
          cargo.adr = 1;
          note.push('ADR: ' + $adr.val());
        }

        if ($note.val()) {
          note.push($note.val());
        }

        cargo.notes = note.join(', ');

        cargo.fromDate = this.dates[0];
        cargo.tillDate = this.dates[this.dates.length - 1];

        var req = new Request('cargo', 'POST','cargos');
        req.data = cargo;
        req.headers = { 'Access-Token': App.appData.cargo.token };

        App.loading('Отправка данных');

        App.sendRequest(req, function (response) {
            App.stopLoading();

            if (response.error && !response.success) {
              if (response.error.message) {
                return alert(response.error.message);
              }
              return alert(response.error);
            }

            return App.showScene('cargoAdded');
          });
    }
};
