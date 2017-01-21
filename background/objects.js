'use strict';

function Request(to, type, url) {
  this.to = to;
  this.url = url;
  this.type = type;
  this.data = {};
  this.headers = {};
};

function MQ() {
  var self = this;
  var init = false;

  this.port = undefined;
  this.queue = $.jqmq();
  this.amount = 0;
  this.errored = 0;
  this.init = function(options) {
    self.queue.update(options);
    init = true;
  };
  this.inited = function() {
    return init;
  };

  return this;
};

function BasicNotification(title, message) {
  this.type = 'basic';
  this.title = title;
  this.message = message;
  this.iconUrl = '/css/images/icons/128x128.png';
  this.priority = 1;

  return this;
}

function ProgressNotification() {
  this.type = 'progress';
  this.title = 'Экспортирование грузов';
  this.message = 'Экспортировано 0 грузов';
  this.progress = 0;
  this.iconUrl = '/css/images/icons/128x128.png';

  return this;
}

function UpdateNotification(version) {
  this.type = 'basic';
  this.title = 'Доступна новая версия!';
  this.message = 'Доступна версия ' + version + '.\n' +
      'Для корректной работы мы рекомендуем использовать самые свежие версии расширения.\n';
  this.iconUrl = '/css/images/icons/128x128.png';
  this.priority = 2;
  if (!isOpera()) {
    this.buttons = [
      {
        title: 'Я хочу обновиться сейчас'
      },
      {
        title: 'Позже'
      }
    ];
  }

  return this;
}

function newCargosNotification(amount) {
  this.type = 'basic';
  this.title = 'У вас появились новые грузы!';
  this.message = 'У вас было добавлено ' + amount + ' новых\nгрузов на Lardi-Trans.\nЭкспортируйте их на Cargo.LT';
  this.iconUrl = '/css/images/icons/128x128.png';
  this.priority = 1;

  return this;
}

function testNotification() {
  this.type = 'basic';
  this.title = 'Тестовое сообщение';
  this.message = 'Так будет выглядеть сообщение.';
  this.iconUrl = '/css/images/icons/128x128.png';
  this.priority = 0;

  return this;
}

var x2js = new X2JS();
