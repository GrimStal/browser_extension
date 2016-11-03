App.scenes.cargoAdded = {

    show: function () {
      var successWrap = _.templates.cargoAdded({
        text: 'Ваш груз был успешно добавлен на Cargo.LT' + (App.appData.lardi.token ? ' и Lardi-Trans' : '')
      });
      var addOrder = _.templates.addOrder({ buttonText: 'Добавить новый груз' });
      $('.ce__wrapper').empty().append(successWrap + addOrder);
      $('#addOrder').addClass('btn-accept');
      $('#addOrder').bind('click', function () {
        App.showScene('cargos');
      });
    },

    hide: function () {
      $('#addOrder').unbind('click');
      $('.ce__wrapper').empty();
    },
  };
