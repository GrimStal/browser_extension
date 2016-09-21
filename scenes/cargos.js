'use strict';

App.scenes.cargos = {

    show: function () {
        var _this = this;
        var cargosData = Templates.cargosOffer;
        cargosData.dates = this.getCalendarDates(4);
        console.log(cargosData);
        $('.ce__wrapper').empty().append(_.templates.cargos(cargosData));
        $('#header-message').text('Добавление груза на Cargo.LT и Lardi-Trans');

        $('.date-' + new Date().getDate()).addClass('today');

        $('.date').bind('click', this.selectDate.bind(this));
        $('#removeSelection').bind('click', function () {
          _this.removeSelection(true);
        });

      },

    hide: function () {
        this.removeSelection();
        $('.date').unbind('click', this.selectDate);
        $('#removeSelection').unbind('click');

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
        return $elements.addClass('selected');
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

    /**
     * Removes all selections in calendar.
     * @param  {boolean} hide Need to hide button
     */
    removeSelection: function (hide) {
      $('.selected').removeClass('selected');
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
        return $el.addClass('selected');
      }

      $selected = $('.selected:first');
      $next = $selected.nextAll().add($selected).add($selected.parent().nextAll().children());
      $prev = $selected.prevAll().add($selected.parent().prevAll(':has("td")').children());

      if ($prev.is($elClass)) {
        this.removeSelection();
        return $el.addClass('selected');
      } else if ($next.is($elClass)) {
        $next = $next.slice(0, $next.index($el) + 1);
        return this.selectionRule($next);
      }

      alert('неверная дата');
    },

    /**
     * Returns the array of dates (only date nums) for set number of weeks
     * from current week start
     * @param  {number} weeks Amount of weeks to return dates
     * @return {array} Array of date nums
     */
    getCalendarDates: function (weeks) {
      var today = new Date();
      var weekstart = new Date(today);
      var result = [];

      if (!weeks) {
        return false;
      }

      if (today.getDay() !== 1) {
        weekstart.setDate(weekstart.getDate() - weekstart.getDay() + 1);
      }

      for (var i = 0; i < (weeks * 7); i++) {
        var date = new Date(weekstart);
        date.setDate(weekstart.getDate() + i);
        result.push(date.getDate());
      }

      return result;
    },
  };
