;(function() {
  var undefined;

  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  var root = freeGlobal || freeSelf || Function('return this')();

  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  var _ = root._ || {};

  /*----------------------------------------------------------------------------*/

  var templates = {
    'accountUnbinding': {},
    'addOrder': {},
    'auth': {},
    'cargos': {},
    'intro': {},
    'loading': {},
    'settingsNav': {}
  };

  templates['accountUnbinding'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__auth-wrapper col-xs-6 col-sm-6 col-md-6 col-lg-6 ' +
    ((__t = (wrapper_class)) == null ? '' : __t) +
    '" id="' +
    ((__t = (wrapper_id)) == null ? '' : __t) +
    '">\n    <div class="ce__unbinding-container">\n        <div class="ce__image-holder">\n            <img class="ce__unbinding-container_company-image" src="images/' +
    ((__t = (img_name)) == null ? '' : __t) +
    '" />\n        </div>\n        <div class="ce__unbinding_holder">\n          <div class="unbinding-message-holder">\n            <span class="glyphicon glyphicon-ok"></span>\n            <span class="unbinding_text">' +
    __e(text) +
    '</span>\n          </div>\n          <button id="' +
    ((__t = (submit_id)) == null ? '' : __t) +
    '" type="button" class="btn ce__btn btn-defualt ce__unbind_btn-confirm binded">\n              Отвязать\n          </button>\n        </div>\n    </div>\n</div>\n';

    }
    return __p
  };

  templates['addOrder'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__order_btn">\n  <button id="addOrder" type="button" class="btn btn-defualt ce__btn ce__order_btn-confirm col-xs-6 col-sm-6 col-sm-offset-3 col-xs-offset-3">\n    ' +
    __e(buttonText) +
    '\n  </button>\n</div>\n';

    }
    return __p
  };

  templates['auth'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<div class="ce__auth-wrapper col-xs-6 col-sm-6 col-md-6 col-lg-6 ' +
    ((__t = (wrapper_class)) == null ? '' : __t) +
    '" id="' +
    ((__t = (wrapper_id)) == null ? '' : __t) +
    '">\n    <div class="ce__form-container">\n        <div class="ce__image-holder">\n            <img class="ce__form-container_company-image" src="images/' +
    ((__t = (img_name)) == null ? '' : __t) +
    '" />\n        </div>\n        <div class="ce_form-holder">\n            <form novalidate id="' +
    ((__t = (form_id)) == null ? '' : __t) +
    '">\n                <fieldset>\n                  ';
    _.each(fields, function(field){
    __p += '\n                    <div class="form-group has-feedback">\n                        <label for="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '">' +
    ((__t = (field.label.toUpperCase())) == null ? '' : __t) +
    '</label>\n                        <input type="' +
    ((__t = (field.type)) == null ? '' : __t) +
    '" class="form-control auth-input" id="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '" name="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '" placeholder="Введите ' +
    ((__t = (field.label)) == null ? '' : __t) +
    '" />\n                    </div>\n                  ';
     }); ;
    __p += '\n                </fieldset>\n                <div class="ce__auth_btn">\n                    <button id="' +
    ((__t = (submit_id)) == null ? '' : __t) +
    '" type="button" class="btn ce__btn btn-defualt ce__auth_btn-confirm col-xs-8 col-sm-8 col-sm-offset-2 col-xs-offset-2">\n                  Привязать аккаунт\n                </button>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n';

    }
    return __p
  };

  templates['cargos'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<div class="ce__cargo-wrapper col-xs-12 col-sm-12 col-md-12 col-lg-12 ' +
    ((__t = (wrapper_class)) == null ? '' : __t) +
    '" id="' +
    ((__t = (wrapper_id)) == null ? '' : __t) +
    '">\n    <div class="row">\n        <div class="city-holder col-xs-7 col-md-7">\n            <form class="form-horizontal" role="form" id="city-holder-form" novalidate>\n                <fieldset>\n                    <div class="form-group has-feedback">\n                        <label for="city-from" class="col-xs-4 col-md-4">' +
    __e(cityFromLabel) +
    '</label>\n                        <input type="text" class="form-control city-from-input col-xs-6 col-sm-6" id="city-from" name="city-from" />\n                    </div>\n                    <div class="revert-cities">\n                        <img class="revert-cities-img" src="images/reverse.png" />\n                    </div>\n                    <div class="form-group has-feedback">\n                        <label for="city-to" class="col-xs-2 col-md-2">' +
    __e(cityToLabel) +
    '</label>\n                        <input type="text" class="form-control city-to-input col-xs-10 col-sm-10" id="city-to" name="city-to" />\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n        <div class="calendar-holder col-xs-5 col-md-5">\n            <div class="calendar">\n                <div class="month current-month">Сентябрь<span id="removeSelection" class="glyphicon glyphicon-remove"></div>\n                <table class="table table-bordered">\n                    <tr>\n                    ';
     var days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
    __p += '\n                    ';
     for(var i=0; i < days.length; i++) {
    __p += '\n                      <th>' +
    ((__t = (days[i])) == null ? '' : __t) +
    '</th>\n                    ';
     }
    __p += '\n                    </tr>\n\n                    ';
     for (var date=0; date < dates.length; date++){
    __p += '\n                      ';
     var dayNum = (date % 7); ;
    __p += '\n                      ';
     if (dayNum === 0) {
    __p += '\n                      <tr>\n                        <td class="date weekday date-' +
    ((__t = (dates[date])) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date]) +
    '</div></td>\n                      ';
     } else if (dayNum === 3) {
    __p += '\n                        <td class="date weekday thursday date-' +
    ((__t = (dates[date])) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date]) +
    '</div></td>\n                      ';
     } else if (dayNum === 5) {
    __p += '\n                        <td class="date weekend date-' +
    ((__t = (dates[date])) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date]) +
    '</div></td>\n                      ';
     } else if (dayNum === 6) {
    __p += '\n                        <td class="date weekend date-' +
    ((__t = (dates[date])) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date]) +
    '</div></td>\n                      </tr>\n                      ';
     } else {
    __p += '\n                        <td class="date weekday date-' +
    ((__t = (dates[date])) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date]) +
    '</div></td>\n                      ';
     }
    __p += '\n                    ';
     }
    __p += '\n                </table>\n                <div class="month next-month">Октябрь</div>\n            </div>\n        </div>\n    </div>\n</div>\n';

    }
    return __p
  };

  templates['intro'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '';
    with (obj) {
    __p += '<div class="ce__wrapper_auth-message auth-message col-xs-12 col-sm-12 col-md-12 col-lg-12">\n    Расширение "CargoExtension" позволяет одновременно добавлять Ваши грузы и транспорт на транспортные биржи\n    <span class="ce__company-name" title="https://www.cargo.lt">Cargo.LT</span> и <span class="ce__company-name" title="https://lardi-trans.com/">Lardi-Trans</span>. Для того, чтобы добавить предложение привяжите свой аккаунт.\n</div>\n';

    }
    return __p
  };

  templates['loading'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__loading">\n  <div class="row">\n    <div class="loading-img-holder">\n      <img src="images/loading.gif" class=\'loading-img\'/>\n    </div>\n    <div class="loading-text-holder">\n      <span class="ce__loading-text">' +
    __e(text) +
    '</span>\n    </div>\n  </div>\n</div>\n';

    }
    return __p
  };

  templates['settingsNav'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<div class="row">\n    <div class="ce__wrapper_nav_bar nav_bar col-xs-12 col-sm-12 col-md-12 col-lg-12">\n      ';
     _(list).forEach(function(item) {
    __p += '\n        <button type="button" class="btn btn-defualt ce__btn ce__btn_green ' +
    __e(item.class) +
    '-button col-xs-2 col-sm-2">item.text</button>\n      ';
     }); ;
    __p += '\n    </div>\n</div>\n';

    }
    return __p
  };

  /*----------------------------------------------------------------------------*/

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define(['lodash'], function(lodash) {
      _ = lodash;
      lodash.templates = lodash.extend(lodash.templates || {}, templates);
    });
  }
  else if (freeModule) {
    _ = require('lodash');
    (freeModule.exports = templates).templates = templates;
    freeExports.templates = templates;
  }
  else if (_) {
    _.templates = _.extend(_.templates || {}, templates);
  }
}.call(this));
