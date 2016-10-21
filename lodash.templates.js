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
    'cargoAdded': {},
    'cargos': {},
    'contacts': {},
    'intro': {},
    'loading': {},
    'settingsNav': {},
    'trailerCheckbox': {}
  };

  templates['accountUnbinding'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<div class="ce__auth-wrapper col-xs-6 col-sm-6 col-md-6 col-lg-6 ' +
    ((__t = (wrapper_class)) == null ? '' : __t) +
    '" id="' +
    ((__t = (wrapper_id)) == null ? '' : __t) +
    '">\n    <div class="ce__unbinding-container">\n        <div class="ce__image-holder center">\n          <img class="ce__unbinding-container_company-image" src="css/images/' +
    ((__t = (img_name)) == null ? '' : __t) +
    '" />\n        </div>\n\n        <div class="ce_form-holder">\n            <form novalidate id="' +
    ((__t = (form_id)) == null ? '' : __t) +
    '">\n                  ';
    _.each(fields, function(field){
    __p += '\n                    <div class="form-group">\n                        <label for="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '">' +
    ((__t = (field.label)) == null ? '' : __t) +
    '</label>\n                        ';
     if (field.type !== 'select') {
    __p += '\n                        <input type="' +
    ((__t = (field.type)) == null ? '' : __t) +
    '" class="form-control ';
     if (field.changeable) {
    __p += 'width-80 inline-block ';
     }
    __p += '" id="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '" name="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '" value=\'' +
    ((__t = (field.value)) == null ? '' : __t) +
    '\' disabled/>\n                          ';
     if (field.changeable) {
    __p += '\n                            <button id="' +
    ((__t = (field.change_id)) == null ? '' : __t) +
    '" type="button" class="btn ce__btn btn-accept col-xs-2 col-sm-2 right">\n                              <img src="css/images/edit.png" width="16" height="16"/>\n                            </button>\n                          ';
     }
    __p += '\n                        ';
     }
    __p += '\n                    </div>\n                  ';
     }); ;
    __p += '\n                </div>\n                <div class="ce__unbind_btn">\n                    <button id="' +
    ((__t = (submit_id)) == null ? '' : __t) +
    '" type="button" class="btn ce__btn btn-defualt ce__unbind_btn-confirm binded col-xs-8 col-sm-8 col-sm-offset-2 col-xs-offset-2">\n                      Отвязать\n                    </button>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n';

    }
    return __p
  };

  templates['addOrder'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__order_btn">\n  <button id="addOrder" type="button" class="btn btn-defualt ce__btn ce__order_btn-confirm col-xs-4 col-sm-4 col-sm-offset-4 col-xs-offset-4">\n    ' +
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
    '">\n    <div class="ce__form-container">\n        <div class="ce__image-holder center">\n          <img class="ce__form-container_company-image" src="css/images/' +
    ((__t = (img_name)) == null ? '' : __t) +
    '" />\n        </div>\n        <div class="ce_form-holder">\n            <form novalidate id="' +
    ((__t = (form_id)) == null ? '' : __t) +
    '">\n                <fieldset>\n                  ';
    _.each(fields, function(field){
    __p += '\n                    <div class="form-group has-feedback">\n                        <label for="' +
    ((__t = (field.id)) == null ? '' : __t) +
    '">' +
    ((__t = (field.label)) == null ? '' : __t) +
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
    '" type="button" class="btn ce__btn btn-defualt ce__auth_btn-confirm col-xs-8 col-sm-8 col-sm-offset-2 col-xs-offset-2">\n                      Привязать аккаунт\n                    </button>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n';

    }
    return __p
  };

  templates['cargoAdded'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__success">\n    <div class="row">\n        <div class="success-img-holder">\n            <img src="css/images/success.png" class=\'success-img\' />\n        </div>\n        <div class="success-text-holder">\n            <span class="ce__success-text">' +
    __e(text) +
    '</span>\n        </div>\n    </div>\n</div>\n';

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
    '">\n    <div class="container cargos-container">\n        <div class="row city-holder ">\n          <div class="city col-xs-2 col-sm-2">\n            <label>' +
    __e(originLabel) +
    '</label>\n            <label>' +
    __e(destinationLabel) +
    '</label>\n          </div>\n          <div class="city col-xs-6 col-sm-6">\n              <div class="form-group has-feedback">\n                  <input type="text" class="form-control origin-input input-sm" id="origin" name="origin" />\n                  <span class="form-control-feedback glyphicon glyphicon-remove origin-remove"></span>\n              </div>\n                  <div class="col-xs-8 col-sm-8">\n                      <div class="revert-cities col-xs-2 col-sm-2 col-xs-offset-7 col-sm-offset-7">\n                          <img class="revert-cities-img" src="css/images/reverse.png" />\n                      </div>\n                  </div>\n              <div class="form-group has-feedback">\n                  <input type="text" class="form-control destination-input input-sm" id="destination" name="destination" />\n                  <span class="form-control-feedback glyphicon glyphicon-remove destination-remove"></span>\n              </div>\n          </div>\n            <div class="calendar-holder col-xs-4 col-md-4">\n                <div class="calendar">\n                    <div class="month current-month">\n                        ' +
    __e(currentMonth) +
    '<span id="removeSelection" class="glyphicon glyphicon-remove"></div>\n                <table class="table dates">\n                    <tr>\n                    ';
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
    ((__t = (dates[date].getDate())) == null ? '' : __t) +
    '" timestamp="' +
    ((__t = ((dates[date].setUTCHours(0,0,0,0)/1000))) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date].getDate()) +
    '</div></td>\n                      ';
     } else if (dayNum === 3) {
    __p += '\n                        <td class="date weekday thursday date-' +
    ((__t = (dates[date].getDate())) == null ? '' : __t) +
    '" timestamp="' +
    ((__t = ((dates[date].setUTCHours(0,0,0,0)/1000))) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date].getDate()) +
    '</div></td>\n                      ';
     } else if (dayNum === 5) {
    __p += '\n                        <td class="date weekend date-' +
    ((__t = (dates[date].getDate())) == null ? '' : __t) +
    '" timestamp="' +
    ((__t = ((dates[date].setUTCHours(0,0,0,0)/1000))) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date].getDate()) +
    '</div></td>\n                      ';
     } else if (dayNum === 6) {
    __p += '\n                        <td class="date weekend date-' +
    ((__t = (dates[date].getDate())) == null ? '' : __t) +
    '" timestamp="' +
    ((__t = ((dates[date].setUTCHours(0,0,0,0)/1000))) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date].getDate()) +
    '</div></td>\n                      </tr>\n                      ';
     } else {
    __p += '\n                        <td class="date weekday date-' +
    ((__t = (dates[date].getDate())) == null ? '' : __t) +
    '" timestamp="' +
    ((__t = ((dates[date].setUTCHours(0,0,0,0)/1000))) == null ? '' : __t) +
    '"><div>' +
    __e(dates[date].getDate()) +
    '</div></td>\n                      ';
     }
    __p += '\n                    ';
     }
    __p += '\n                </table>\n                <div class="month next-month">' +
    __e(nextMonth) +
    '</div>\n            </div>\n        </div>\n        </div>\n      </div>\n      <div class="row">\n        <div class="cargo-info-holder container">\n          <div class="row">\n            <form class="form-inline" role="form" id="cargo-types-holder-form" novalidate>\n                  <div class="form-group">\n                      <label for="cargo-type" class="col-xs-2 col-sm-2">' +
    __e(cargoTypeLabel) +
    ':</label>\n                      <div class="col-xs-6 col-sm-6">\n                        <select class="form-control cargo-types-select input-sm" id="cargo-types" name="cargo-types">\n                          <option value="" selected>' +
    __e(cargoTypeLabel) +
    '</option>\n                            ';
     _.forEach(cargoTypes, function(type) {
    __p += '\n                              <option value="' +
    __e(type.id) +
    '">' +
    __e(type.type) +
    '</option>\n                            ';
     }) ;
    __p += '\n                        </select>\n                      </div>\n                  </div>\n                  <div class="form-group">\n                      <label for="adr" class="col-xs-1 col-sm-1">' +
    __e(adrLabel) +
    '</label>\n                      <div class="col-xs-3 col-sm-3">\n                        <select class="form-control adr-select input-sm" id="adr" name="adr">\n                          <option value="" selected></option>\n                            ';
     _.forEach(adrs, function(adr) {
    __p += '\n                              <option value="' +
    __e(adr) +
    '">' +
    __e(adr) +
    '</option>\n                            ';
     }) ;
    __p += '\n                        </select>\n                      </div>\n                  </div>\n            </form>\n          </div>\n\n          <div class="row">\n            <form class="form-inline" role="form" id="cargo-info-holder-form" novalidate>\n              <div class="form-group">\n                  <label for="weight" class="col-xs-2 col-sm-2">' +
    ((__t = (weightLabel)) == null ? '' : __t) +
    '</label>\n                  <div class="col-xs-1 col-sm-1 wide-right">\n                    <input type="text" class="form-control weight-input input-sm" id="weight" name="weight" placeholder="T"/>\n                  </div>\n              </div>\n              <div class="col-wrap col-xs-5 col-sm-5">\n                    <div class="form-group">\n                        <label for="volume" class="col-xs-3 col-sm-3">' +
    ((__t = (volumeLabel)) == null ? '' : __t) +
    '</label>\n                        <div class="col-xs-3 col-sm-3 wide-right">\n                          <input type="text" class="form-control volume-input input-sm" id="volume" name="volume" placeholder="m³"/>\n                        </div>\n                    </div>\n                    <div class="form-group">\n                        <label for="palets" class="col-xs-3 col-sm-3">' +
    ((__t = (paletsLabel)) == null ? '' : __t) +
    '</label>\n                        <div class="col-xs-3 col-sm-3 wide-right">\n                          <input type="text" class="form-control palets-input input-sm" id="palets" name="palets" />\n                        </div>\n                    </div>\n              </div>\n              <fieldset id="temperature" disabled>\n                <div class="form-group">\n                    <label for="temperature" class="col-xs-3 col-sm-3">' +
    ((__t = (temperatureLabel)) == null ? '' : __t) +
    '</label>\n                    <div class="col-wrap col-xs-9 col-sm-9">\n                      <div class="col-xs-5 col-sm-5 wide-right">\n                        <input type="number" min="-50" max="50" step="1" value="18" class="form-control temperature-input input-sm" id="temperatureMin" name="temperatureMin" />\n                      </div>\n                      <div class="col-xs-2 col-sm-2 wide-right wide-left center">\n                        -\n                      </div>\n                      <div class="col-xs-5 col-sm-5 wide-left">\n                        <input type="number" min="-50" max="50" step="1" value="18" class="form-control temperature-input input-sm" id="temperatureMax" name="temperatureMax" />\n                      </div>\n                    </div>\n                </div>\n              </fieldset>\n            </form>\n          </div>\n\n          <div class="row">\n              <label class="col-xs-2 col-sm-2">' +
    __e(trailerTypes.title) +
    '</label>\n              <div class="checkbox col-sm-10 col-xs-10">\n                  <div class="col-xs-4 col-md-4">\n                    ';
     _.forEach(trailerTypes.fixed[0], function(trailer) {
    __p += '\n                      <label>\n                          <input type="checkbox" class="trailer-type trailer-type-checkbox" value="' +
    __e(trailer.id) +
    '" />\n                          <span class="checkbox-text">' +
    ((__t = (trailer.type)) == null ? '' : __t) +
    '</span>\n                      </label>\n                    ';
     }); ;
    __p += '\n                  </div>\n                  <div class="col-xs-8 col-md-8 col-wrap">\n                    <div class="col-xs-6 col-md-6">\n                      ';
     _.forEach(trailerTypes.fixed[1], function(trailer) {
    __p += '\n                        <label>\n                            <input type="checkbox" class="trailer-type trailer-type-checkbox" value="' +
    __e(trailer.id) +
    '" />\n                            <span class="checkbox-text">' +
    ((__t = (trailer.type)) == null ? '' : __t) +
    '</span>\n                        </label>\n                      ';
     }); ;
    __p += '\n                    </div>\n                    <div class="col-xs-6 col-md-6">\n                      ';
     _.forEach(trailerTypes.fixed[2], function(trailer) {
    __p += '\n                        ';
     if (!(_.isArray(trailer))) {
    __p += '\n                          <label>\n                              <input type="checkbox" class="trailer-type trailer-type-checkbox" value="' +
    __e(trailer.id) +
    '" />\n                              <span class="check-text">' +
    ((__t = (trailer.type)) == null ? '' : __t) +
    '</span>\n                          </label>\n                        ';
     } else {
    __p += '\n                          <select class="trailer-type trailer-type-select input-sm col-xs-12 col-sm-12">\n                            <option selected value="">' +
    ((__t = (trailerTypes.placeholder)) == null ? '' : __t) +
    '</option>\n                            ';
     _.forEach(trailer, function(tr){
    __p += '\n                              <option value="' +
    __e(tr.id) +
    '">' +
    ((__t = (tr.type)) == null ? '' : __t) +
    '</option>\n                            ';
     }); ;
    __p += '\n                          </select>\n                        ';
     }
    __p += '\n                      ';
     }); ;
    __p += '\n                    </div>\n                  </div>\n              </div>\n          </div>\n\n          <div class="row">\n              <label class="col-xs-2 col-sm-2">' +
    __e(loadTypes.title) +
    '</label>\n              <div class="checkbox col-sm-10 col-xs-10">\n                  <div class="col-xs-4 col-md-4">\n                    ';
     _.forEach(loadTypes.fixed[0], function(type, key) {
    __p += '\n                      <label>\n                          <input type="checkbox" class="load-type load-type-checkbox" value="' +
    __e(key) +
    '" />\n                          <span class="check-text">' +
    __e(type) +
    '</span>\n                      </label>\n                    ';
     }); ;
    __p += '\n                  </div>\n                  <div class="col-xs-8 col-md-8 col-wrap">\n                    <div class="col-xs-6 col-md-6">\n                      ';
     _.forEach(loadTypes.fixed[1], function(type, key) {
    __p += '\n                        <label>\n                            <input type="checkbox" class="load-type load-type-checkbox" value="' +
    __e(key) +
    '" />\n                            <span class="check-text">' +
    __e(type) +
    '</span>\n                        </label>\n                      ';
     }); ;
    __p += '\n                    </div>\n                    <div class="col-xs-6 col-md-6">\n                      ';
     _.forEach(loadTypes.fixed[2], function(type, key) {
    __p += '\n                        <label>\n                            <input type="checkbox" class="load-type load-type-checkbox" value="' +
    __e(key) +
    '" />\n                            <span class="check-text">' +
    __e(type) +
    '</span>\n                        </label>\n                      ';
     }); ;
    __p += '\n                    </div>\n                  </div>\n              </div>\n          </div>\n\n          <div class="row">\n              <label class="col-xs-2 col-sm-2">' +
    __e(documents.title) +
    '</label>\n              <div class="checkbox col-sm-10 col-xs-10">\n                  <div class="col-xs-4 col-md-4">\n                    ';
     _.forEach(documents.docs[0], function(doc, key) {
    __p += '\n                      <div class="col-xs-6 col-md-6">\n                        <label>\n                            <input type="checkbox" class="document-type document-type-checkbox" value="' +
    __e(key) +
    '" />\n                            <span class="check-text">' +
    ((__t = (doc)) == null ? '' : __t) +
    '</span>\n                        </label>\n                      </div>\n                    ';
     }); ;
    __p += '\n                  </div>\n                  <div class="col-xs-7 col-md-7">\n                    ';
     _.forEach(documents.docs[1], function(doc, key) {
    __p += '\n                      <div class="col-xs-6 col-md-6">\n                        <label>\n                            <input type="checkbox" class="document-type document-type-checkbox" value="' +
    __e(key) +
    '" />\n                            <span class="check-text">' +
    ((__t = (doc)) == null ? '' : __t) +
    '</span>\n                        </label>\n                      </div>\n                    ';
     }); ;
    __p += '\n                  </div>\n              </div>\n          </div>\n\n          <div class="row">\n              <form class="form-inline" role="form" id="payment-form" novalidate>\n                <div class="form-group">\n                    <label for="price" class="col-xs-2 col-sm-2">' +
    __e(paymentLabel) +
    '</label>\n                    <div class="col-xs-3 col-sm-3">\n                      <input type="text" class="form-control payment-input input-sm" maxlength=6 id="price" name="price" />\n                    </div>\n                </div>\n                <div class="col-xs-3 col-sm-3">\n                  <select class="form-control currency-select input-sm" id="currency" name="currency">\n                      ';
     _.forEach(currencies, function(cur) {
    __p += '\n                          ';
     if (cur.id === "15") {
    __p += '\n                          <option selected value="' +
    __e(cur.id) +
    '">' +
    __e(cur.type) +
    '</option>\n                          ';
     } else {
    __p += '\n                          <option value="' +
    __e(cur.id) +
    '">' +
    __e(cur.type) +
    '</option>\n                          ';
     }
    __p += '\n                      ';
     }) ;
    __p += '\n                  </select>\n                </div>\n                <div class="col-xs-4 col-sm-4">\n                  <select class="form-control payment-type-select input-sm" id="payment-type" name="payment-type">\n                    <option selected disabled value="">' +
    __e(paymentTypePlaceholder) +
    '</option>\n                      ';
     _.forEach(paymentTypes, function(type, key) {
    __p += '\n                          <option value="' +
    __e(key) +
    '">' +
    __e(type) +
    '</option>\n                      ';
     }) ;
    __p += '\n                  </select>\n                </div>\n              </form>\n          </div>\n\n          <div class="row">\n            <form class="form-inline" role="form" id="note-form" novalidate>\n              <div class="form-group">\n                  <label for="note" class="col-xs-2 col-sm-2">' +
    __e(noteLabel) +
    '</label>\n                  <div class="col-xs-10 col-sm-10">\n                    <textarea rows="2" class="form-control note-textarea" maxlength=40 id="note" name="note" />\n                  </div>\n              </div>\n            </form>\n          </div>\n      </div>\n      </div>\n    </div>\n            </div>\n        </div>\n    </div>\n    <div class="row">\n          <div class="col-xs-3 col-sm-3 col-xs-offset-3 col-sm-offset-3">\n            <button id="clean" type="button" class="btn btn-defualt ce__btn ce__order_btn-clean col-xs-12 col-sm-12">\n              ' +
    __e(clearButtonText) +
    '\n            </button>\n          </div>\n          <div class="col-xs-3 col-sm-3">\n            <button id="sendOrder" type="button" class="btn btn-accept ce__btn ce__order_btn-confirm col-xs-12 col-sm-12">\n              ' +
    __e(orderButtonText) +
    '\n            </button>\n          </div>\n    </div>\n\n  </div>\n</div>\n';

    }
    return __p
  };

  templates['contacts'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
    function print() { __p += __j.call(arguments, '') }
    with (obj) {
    __p += '<select class="form-control contact-select" id="' +
    ((__t = (id)) == null ? '' : __t) +
    '" name="' +
    ((__t = (id)) == null ? '' : __t) +
    '">\n  ';
     _.forEach(users, function(user) {
    __p += '\n    <option value="' +
    __e(user.id) +
    '" ';
     if (user.id == defaultID) {
    __p += ' selected';
     }
    __p += '> ' +
    ((__t = (user.name)) == null ? '' : __t) +
    ' </option>\n  ';
     }) ;
    __p += '\n</select>\n';

    }
    return __p
  };

  templates['intro'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '';
    with (obj) {
    __p += '<div class="ce__wrapper_auth-message auth-message center col-xs-12 col-sm-12 col-md-12 col-lg-12">\n    Расширение "CARGO" позволяет одновременно добавлять Ваши грузы на транспортные биржи\n    <span class="ce__company-name cargo-site" title="https://www.cargo.lt">Cargo.LT</span> и <span class="ce__company-name lardi-site" title="https://lardi-trans.com/">Lardi-Trans.com</span>. Для того, чтобы добавить предложение привяжите свой аккаунт.\n</div>\n';

    }
    return __p
  };

  templates['loading'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
    __p += '<div class="ce__loading">\n    <div class="loading-wrap">\n        <div class="loading-img-holder">\n            <div class="loading-img-background">\n                <div class="loading-img-colored"></div>\n            </div>\n\n        </div>\n        <div class="loading-text-holder">\n            <span class="ce__loading-text">' +
    __e(text) +
    '</span>\n        </div>\n    </div>\n</div>\n';

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

  templates['trailerCheckbox'] =   function(obj) {
    obj || (obj = {});
    var __t, __p = '';
    with (obj) {
    __p += '<label>\n  <input type="checkbox" class="trailer-type trailer-type-checkbox" value="' +
    ((__t = (value)) == null ? '' : __t) +
    '" checked/>\n  <span class="check-text">' +
    ((__t = (type)) == null ? '' : __t) +
    '</span>\n</label>\n';

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
