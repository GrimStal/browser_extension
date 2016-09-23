'use strict';

App.scenes.cargos = {

    show: function () {
        function getTimestamp(obj) {
          return parseInt($(obj).attr('timestamp'));
        }

        function getToday() {
          if (getTimestamp(this) === today) {
            return true;
          }

          return false;
        };

        function availableDates() {
          if (getTimestamp(this) >= today) {
            return true;
          }

          return false;
        }

        function pastDates() {
          if (getTimestamp(this) < today) {
            return true;
          }

          return false;
        }

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

        var _this = this;
        var calendar = this.getCalendarDates(4, 'ru');
        var today = new Date().setHours(0, 0, 0, 0) / 1000;
        var cargosData = Templates.cargosOffer;

        App.loading();
        cargosData.dates = calendar.dates;
        cargosData.currentMonth = calendar.months[0];
        cargosData.nextMonth = calendar.months[1];
        $('.ce__wrapper').empty().append(_.templates.cargos(cargosData));
        $('#header-message').text('Добавление груза на Cargo.LT и Lardi-Trans');

        /** Initialization of calendar: Set current date, add onClick function
        *   for available dates to set cargos, mark past dates,
        */
        $('.date').filter(getToday).addClass('today');
        $('.date').filter(availableDates).bind('click', this.selectDate.bind(this));
        $('.date').filter(pastDates).addClass('past');
        $('.date').filter(currentMonth).find('div').addClass('current-month');
        $('.date').filter(nextMonth).find('div').addClass('next-month');

        $('#removeSelection').bind('click', function () {
          _this.removeSelection(true);
        });

        $('.revert-cities').bind('click', this.revertCities);

        this.setDates();

        return App.stopLoading();
      },

    hide: function () {
        this.removeSelection();
        $('.date').unbind('click', this.selectDate);
        $('#removeSelection').unbind('click');
        $('.revert-cities').bind('click', this.revertCities);

        $('.ce__wrapper').empty();
      },

    selectionRule: function ($elements) {
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
      if (((weekdays + weekends) <= 3) ||
       (!thursday && weekends <= 2 && weekdays <= 3)) {
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

        message += allowed + (allowed % 5 ? ' дня' : ' дней');
        return alert(message);
      }

    },

    setDates: function () {
      var today = new Date().setHours(0, 0, 0, 0) / 1000;
      var dates = [];
      this.dates = [];

      $('.selected').each(function (key, el, arr) {
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
    removeSelection: function (hide) {
      $('.selected').removeClass('selected');
      App.scenes.cargos.setDates();
      if (hide) {
        $('#removeSelection').hide();
      }
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

      return { dates: dates, months: [currentMonth, nextMonth] };
    },

    revertCities: function () {
      if (!$('#origin') || !$('#destination')) {
        return false;
      }

      var rev = '';
      var $origin = $('#origin');
      var $destination = $('#destination');

      rev = $origin.val();
      $origin.val($destination.val());
      $destination.val(rev);
    },
  };
