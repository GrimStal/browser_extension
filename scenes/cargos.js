'use strict';

App.scenes.cargos = {
    show: function () {
        $('.ce__wrapper').empty().append(_.templates.cargos(Templates.cargosOffer));
        $('#header-message').text('Добавление груза на Cargo.LT и Lardi-Trans');
      },

    hide: function () {
        $$('.ce__wrapper').empty();
      },
  };
