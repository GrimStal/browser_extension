'use strict';

function checkCargosForExport() {
  var result = $.Deferred();
  var resp;
  var cargos = [];
  var token = SMData.getToken('lardi');
  var cargoToken = SMData.getToken('cargo');
  var req = new Request('lardi', 'GET');
  var lardiUser = SMData.getUserData('lardi');

  if (token && cargoToken) {
    req.data = {
      sig: token,
      method: 'my.gruz.list'
    };

    sendRequest(req, null, function(response) {
      try {
        if (!response.error && response.success) {
          resp = XMLtoJson(response.success);
          if ('response' in resp) {
            resp = resp.response;
            if ('gruz' in resp) {
              if (typeof resp.gruz === 'object' && 'item' in resp.gruz && typeof resp.gruz.item === 'object') {
                if (Array.isArray(resp.gruz.item)) {
                  cargos = resp.gruz.item;
                } else {
                  cargos.push(resp.gruz.item);
                }
              }
            } else if ('error' in resp) {
              SMData.removeToken('lardi');
              signIn('lardi', lardiUser.login, lardiUser.password, function(key, result) {
                if (result) {
                  return result = checkCargosForExport();
                }
                return result.reject(resp.error);
              });
            } else {
              return result.reject('Data structure error', resp);
            }
          }

          return result.resolve(cargos.filter(filterCargos));
        }
      }
      catch(err){
        console.log('Error: ', err);
      }
    });
  } else {
    result.reject('User is not authorized on both cargo and lardi.');
  }

  return result.promise();
}

function signIn(key, login, password, callback) {
  var self = this;
  var link = (key === 'cargo') ? 'accounts/signin' : '';
  var req = new Request(key, 'POST', link);
  var data = {
    login: login,
    password: (key !== 'lardi') ? password : md5(password),
  };

  if (key === 'lardi') {
    data.method = 'auth';
  }

  req.data = data;

  sendRequest(req, null, function(response) {
    var result = false;
    var token;
    var res;
    var processing = $.Deferred();

    processing.then(
        function() {
          SMData.saveToken(key, token);
        },
        function(error) {
          console.error(error);
        })
        .always(function() {
          if (callback && typeof callback === 'function') {
            callback(key, result);
          }
        });

    if (!response.error && response.success) {
      if (key === 'lardi') {
        res = XMLtoJson(response.success);

        if (!res || !'response' in res || 'error' in res.response) {
          return processing.reject(res);
        }

        res = res.response;
        result = true;
        token = res.sig;
        processing.resolve();

      } else {
        result = true;
        res = response.success;
        token = res.accessToken;
        processing.resolve();
      }
    } else {
      processing.reject(response.error.responseText);
    }
  });
}

function filterCargos(cargo) {
  var exported = SMData.getExportedCargos('lardi');
  var pending = SMData.getPendingCargos('lardi');
  var today = new Date().setUTCHours(0, 0, 0, 0);
  var user_id = SMData.getUserData('lardi').id;
  if (!~exported.indexOf(cargo.id) && !~pending.indexOf(cargo.id)) {
    if (cargo.date_to) {
      return (new Date(cargo.date_to) >= today && cargo.contact === user_id);
    } else {
      return (new Date(cargo.date_from) >= today && cargo.contact === user_id);
    }
  }
}

function lardiExportWatcher() {
  if (SMData.getSystemMessagesAccept()) {
    if (!exportQueue.queue.size() && (new Date().getHours() > 8 && new Date().getHours() < 20)) {
      checkCargosForExport()
          .then(function(cargos) {
            if (cargos.length) {
              showNewCargosNotification(cargos.length);
            }
          })
          .catch(function(err) {
            console.log(err);
          });
    }
  }
}

function getCurrencies() {
  var result = $.Deferred();
  var token = SMData.getToken('lardi');
  var req = new Request('lardi', 'GET');
  var resp;
  var currencies = [];

  if (token) {
    req.data = {
      sig: token,
      method: 'get.payment.valuta.ref',
    };

    sendRequest(req, null, function(response) {
      if (!response.error && response.success) {
        resp = XMLtoJson(response.success);
        if (resp.error) {
          return result.reject(resp.error);
        }
        if ('response' in resp) {
          resp = resp.response;
          if ('item' in resp) {
            return result.resolve(resp.item);
          } else {
            return result.reject('Data structure error', resp);
          }
        }
      } else {
        return result.reject('Data structure error', resp);
      }
    });
  } else {
    result.reject('User is not authorized on both cargo and lardi.');
  }

  return result.promise();
}

function getLardiCountries() {
  var def = $.Deferred();
  var req = new Request('lardi', 'POST');
  var token = SMData.getToken('lardi');
  var resp;

  if (token) {
    req.data = {
      method: 'base.country',
      sig: token
    };

    sendRequest(req, null, function(response) {
      if (!response.error && response.success) {
        resp = XMLtoJson(response.success);
        if (resp.error) {
          return def.reject(resp.error);
        }
        if ('response' in resp) {
          resp = resp.response;
          if ('item' in resp) {
            return def.resolve(resp.item || []);
          } else {
            return def.reject('Data structure error', resp);
          }
        }
      } else {
        return def.reject('Data structure error', resp);
      }
    });
  } else {
    def.reject('Not authorized on lardi');
  }
  return def.promise();
}

function getLardiAreaName(countryID, areaID, countries) {
  var name = '';
  countries.forEach(function (country) {
    if (countryID === country.id) {
      if (areaID && country.areas && typeof country.areas === 'object') {
        if (country.areas.area && typeof country.areas.area === 'object') {
          if (Array.isArray(country.areas.area)) {
            country.areas.area.forEach(function (area) {
              if (Number(area.id) === Number(areaID)) {
                name = area.name;
              }
            });
          } else {
            if (Number(country.areas.area.id) === Number(areaID)) {
              name = country.areas.area.name;
            }
          }
        }
      }
    }
  });
  return name;
}

function getLardiAutoTips() {
  var def = $.Deferred();
  var req = new Request('lardi', 'POST');
  var token = SMData.getToken('lardi');
  var resp;

  if (!token) {
    def.reject('Lardi not authorized');
    return def.promise();
  } else {
    req.data = {
      method: 'base.auto_tip',
      sig: token
    };
    sendRequest(req, null, function(response) {
      if (!response.error && response.success) {
        resp = XMLtoJson(response.success);
        if (resp.error) {
          return def.reject(resp.error);
        }
        if ('response' in resp) {
          resp = resp.response;
          if ('item' in resp) {
            return def.resolve(resp.item || []);
          } else {
            return def.reject('Data structure error', resp);
          }
        }
      } else {
        return def.reject('Data structure error', resp);
      }
    });
  }
  return def.promise();
}

function getLardiCountryCode(countryID, countries) {
  var code = '';

  countries.forEach(function (el) {
    if (countryID === el.id) {
      code = el.sign;

      switch (code) {
        case 'ZY':
          code = 'BO';
          break;
        case 'AR':
          if (el.name = 'Армения') {
            code = 'AM';
          }

          break;
        case 'ZZ':
          if (el.name = 'Аргентина') {
            code = 'AR';
          }

          break;
        default:
          break;
      }
    }
  });

  return code;
}

function getCargoArea(id, rus, country) {
  if (country === 'UA') {
    switch (Number(id)) {
      case 15:
        return 'Винницкая обл.';
      case 16:
        return 'Волынская обл.';
      case 17:
        return 'Днепропетровская обл.';
      case 18:
        return 'Донецкая обл.';
      case 19:
        return 'Житомирская обл.';
      case 20:
        return 'Закарпатская обл.';
      case 21:
        return 'Запорожская обл.';
      case 22:
        return 'Ивано-Франковская обл.';
      case 23:
        return 'Киевская обл.';
      case 24:
        return 'Кировоградская обл.';
      case 25:
        return 'Крым';
      case 26:
        return 'Луганская обл.';
      case 27:
        return 'Львовская обл.';
      case 28:
        return 'Николаевская обл.';
      case 29:
        return 'Одесская обл.';
      case 30:
        return 'Полтавская обл.';
      case 31:
        return 'Ровенская обл.';
      case 32:
        return 'Сумская обл.';
      case 33:
        return 'Тернопольская обл.';
      case 34:
        return 'Харьковская обл.';
      case 35:
        return 'Херсонская обл.';
      case 36:
        return 'Хмельницкая обл.';
      case 37:
        return 'Черкасская обл.';
      case 38:
        return 'Черниговская обл.';
      case 39:
        return 'Черновецкая обл.';
      default:
        if (~rus.indexOf('обл.')) {
          return (rus.slice(0, rus.indexOf('обл.')) + 'область');
        }
        return rus;
    }
  } else if (country === 'BY') {
    switch (Number(id)) {
      case 127:
        return 'Брестская обл.';
      case 128:
        return 'Витебская обл.';
      case 129:
        return 'Гомельская обл.';
      case 130:
        return 'Гродненская обл.';
      case 131:
        return 'Минская обл.';
      case 132:
        return 'Могилёвская обл.';
      default:
        if (~rus.indexOf('обл.')) {
          return (rus.slice(0, rus.indexOf('обл.')) + 'область');
        }
        return rus;
    }
  } else if (country === 'KZ') {
    switch (Number(id)) {
      case 133:
        return 'Кокшетау';
      case 134:
        return 'Актюбинск';
      case 135:
        return 'Алма-Ата';
      case 136:
        return 'Атырау';
      case 137:
        return 'Усть-Каменогорск';
      case 138:
        return 'Тараз';
      case 139:
        return 'Уральск';
      case 140:
        return 'Караганда';
      case 141:
        return 'Костанай';
      case 142:
        return 'Кызылорда';
      case 143:
        return 'Актау';
      case 144:
        return 'Павлодар';
      case 145:
        return 'Петропавловск';
      case 146:
        return 'Шымкент';
      default:
        if (~rus.indexOf('обл.')) {
          return (rus.slice(0, rus.indexOf('обл.')) + 'область');
        }
        return rus;
    }
  } else if (country === 'RU') {
    switch (Number(id)) {
      case 40:
        return 'Забайкальский край';
      case 41:
        return 'Адыгея';
        // case 42:
        //   return 'Алтай';
      case 43:
        return 'Алтайский край';
      case 44:
        return 'Амурская обл.';
      case 45:
        return 'Архангельская обл.';
      case 46:
        return 'Астраханская обл.';
      case 47:
        return 'Башкирия';
      case 48:
        return 'Белгородская обл.';
      case 49:
        return 'Брянская обл.';
      case 50:
        return 'Бурятия';
      case 51:
        return 'Владимирская обл.';
      case 52:
        return 'Волгоградская обл.';
      case 53:
        return 'Вологодская обл.';
      case 54:
        return 'Воронежская обл.';
      case 55:
        return 'Дагестан';
        // case 56:
        //   return 'Еврейская авт. обл.';
      case 57:
        return 'Ивановская обл.';
      case 58:
        return 'Ингушетия';
      case 59:
        return 'Иркутская обл.';
      case 60:
        return 'Кабардино-Балкария';
        // case 61:
        //   return 'Калининградская обл.';
      case 62:
        return 'Калмыкия';
      case 63:
        return 'Калужская обл.';
        // case 64:
        //   return 'Камчатский край';
      case 65:
        return 'Карачаево-Черкессия';
      case 66:
        return 'Петрозаводск';
      case 67:
        return 'Кемеровская обл.';
      case 68:
        return 'Кировская обл.';
      case 69:
        return 'Коми';
      case 72:
        return 'Костромская обл.';
      case 73:
        return 'Краснодарский край';
      case 74:
        return 'Красноярский край';
      case 75:
        return 'Курганская обл.';
      case 76:
        return 'Курская обл.';
      case 77:
        return 'Ленинградская обл.';
      case 78:
        return 'Липецкая обл.';
        // case 79:
        //   return 'Магаданская обл.';
      case 80:
        return 'Марий Эл';
      case 81:
        return 'Саранск';
      case 82:
        return 'Московская обл.';
      case 83:
        return 'Мурманская обл.';
        // case 84:
        //   return 'Ненецкий авт. окр.';
      case 85:
        return 'Нижегородская обл.';
      case 86:
        return 'Новгородская обл.';
      case 87:
        return 'Новосибирская обл.';
      case 88:
        return 'Омская обл.';
      case 89:
        return 'Оренбургская обл.';
      case 90:
        return 'Орловская обл.';
      case 91:
        return 'Пензенская обл.';
      case 92:
        return 'Пермский край';
      case 93:
        return 'Приморский край';
      case 94:
        return 'Псковская обл.';
      case 95:
        return 'Ростовская обл.';
      case 96:
        return 'Рязанская обл.';
      case 97:
        return 'Самарская обл.';
      case 98:
        return 'Саратовская обл.';
      case 99:
        return 'Республика Саха';
        // case 100:
        //   return 'Сахалинская обл.';
      case 101:
        return 'Свердловская обл.';
      case 102:
        return 'Северная Осетия';
      case 103:
        return 'Смоленская обл.';
      case 104:
        return 'Ставропольский край';
      case 106:
        return 'Тамбовская обл.';
      case 107:
        return 'Татарстан';
      case 108:
        return 'Тверская обл.';
      case 109:
        return 'Томская обл.';
      case 110:
        return 'Тува';
      case 111:
        return 'Тульская обл.';
      case 112:
        return 'Тюменская обл.';
      case 113:
        return 'Удмуртия';
      case 114:
        return 'Ульяновская обл.';
      case 116:
        return 'Хабаровский край';
      case 117:
        return 'Хакасия';
      case 118:
        return 'Ханты-Мансийск АО';
      case 119:
        return 'Челябинская обл.';
      case 120:
        return 'Чечня';
      case 122:
        return 'Чувашия';
        // case 123:
        //   return 'Чукотский авт. окр.';
      case 125:
        return 'Ямало-Ненецкий АО';
      case 126:
        return 'Ярославская обл.';
      default:
        if (~rus.indexOf('обл.')) {
          return (rus.slice(0, rus.indexOf('обл.')) + 'область');
        }
        return rus;
    }
  } else if (country === 'PL' && rus.indexOf('воеводство') === -1 && rus.indexOf('воев.') === -1) {
    return (rus + ' воеводство');
  } else if (~rus.indexOf('обл.')) {
    return (rus.slice(0, rus.indexOf('обл.')) + 'область');
  } else {
    return rus;
  }
}

function setCargoBodyType(id, group) {
  var trailers = [];

  if (!group) {
    return trailers;
  }

  id = parseInt(id);

  if (id) {
    switch (id) {
      case 34:
        trailers.push(2, 8, 13);
        break;
        // case 44:
        // case 55:
        // case 62:
        //   trailers.push(2, 8, 13);
        //   break;
      case 25:
      case 36:
        trailers.push(3);
        break;
      case 32:
        trailers.push(1);
        break;
      case 23:
        trailers.push(9, 10, 17);
        break;
        // case 27:
        //   trailers.push(4);
        //   break;
        // case 43:
        //   trailers.push(2, 3, 8, 9, 10, 13, 17);
        //   break;
        // case 46:
        // case 65:
        // case 66:
        // case 67:
        //   trailers.push(19);
        //   break;
        // case 35:
        // case 42:
        // case 58:
        // case 63:
        //   trailers.push(23);
        //   break;
        // case 50:
        // case 51:
      case 64:
        trailers.push(18);
        break;
      case 28:
        trailers.push(4);
        break;
        // case 30:
        //   trailers.push(15);
        //   break;
      case 33:
        // case 53:
        trailers.push(16);
        break;
        // case 22:
        // case 24:
      case 37:
        // case 56:
      case 61:
        trailers.push(7);
        break;
      case 20:
        trailers.push(6);
        break;
      case 26:
        trailers.push(22);
        break;
      case 48:
        // case 59:
        // case 60:
        trailers.push(21);
        break;
        // case 66:
        //   trailers.push(2, 3, 8, 9, 10, 13, 17);
        //   break;
    }
  } else {
    if (typeof group !== 'number') {
      group = parseInt(group);
    }

    switch (group) {
      case 1:
        trailers.push(1, /*2,*/ 3, 4, 5/*, 8, 9, 10, 13, 17*/);
        break;
      case 2:
        trailers.push(15, 16, 18, 20, 23);
        break;
      case 3:
        trailers.push(7);
        break;
        // case 4:
        //   trailers.push(6, 19, 21, 22);
        //   break;
    }

  }

  return trailers;
}

function createCargoDuplicate(object, atips, countries, cargoTypes) {
  var note = [];
  var loads = setLoadTypes(object.zagruz_set);
  var cargo = new CargoObject();
  var placeFrom = [];
  var areaFrom;
  var placeTo = [];
  var areaTo;
  var day;
  var countryFrom;
  var countryTo;

  areaFrom = getLardiAreaName(object.country_from_id, object.area_from_id, countries);
  areaTo = getLardiAreaName(object.country_to_id, object.area_to_id, countries);
  countryFrom = getLardiCountryCode(object.country_from_id, countries);
  countryTo = getLardiCountryCode(object.country_to_id, countries);

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
  cargo.origins.push({country: countryFrom, name: placeFrom.join(', ')});
  cargo.destinations.push({country: countryTo, name: placeTo.join(', ')});

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
    if ((cargo.weight > 3.5 || cargo.volume > 35) && cargo.trailers.indexOf(17) > -1) {
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
  if ('t1' in object && object.t1) {
    note.push('T1');
  }

  //tir
  if ('tir' in object && object.tir) {
    cargo.tir = true;
  }

  //declaration
  if (~object.add_info.toLowerCase().indexOf('по декларации') ||
      ~object.note.toLowerCase().indexOf('по декларации')) {
    cargo.declaration = 1;
  }

  //full load
  if (~object.add_info.toLowerCase().indexOf('полная') ||
      ~object.note.toLowerCase().indexOf('полная')) {
    cargo.full = 1;
  }

  //partly load
  if (~object.add_info.toLowerCase().indexOf('частичная') ||
      ~object.note.toLowerCase().indexOf('частичная')) {
    cargo.partly = 1;
  }

  //fift load
  if (~object.add_info.toLowerCase().indexOf('лифт') ||
      ~object.note.toLowerCase().indexOf('лифт')) {
    cargo.lift = 1;
  }

  //manipulator load
  if (~object.add_info.toLowerCase().indexOf('манипулятор') ||
      ~object.note.toLowerCase().indexOf('манипулятор')) {
    cargo.manipulator = 1;
  }

  //auto_col_tip
  if (object.auto_col_id && object.auto_col_id.length > 0 && object.auto_col_id !== '0') {
    object.auto_col = parseInt(object.auto_col);
    if (object.auto_col > 0) {
      note.push(object.auto_col + ' ' + getName(atips, object.auto_col_id));
    }
  }

  //Notes
  if (object.note.length) {
    note.push(object.note);
  }

  if (object.add_info.length) {
    note.push(object.add_info);
  }

  cargo.notes = note.join('; ');
  cargo.lardiID = object.id;
  cargo.token = SMData.getToken('cargo');
  return cargo;
}

function addToExportQueue(cargos) {
  exportQueue.queue.pause();
  exportQueue.queue.addEach(cargos);
  exportQueue.amount = exportQueue.queue.size();
  showProgressNotification();
  chrome.browserAction.setBadgeText({text: (exportQueue.amount < 1000 ? String(exportQueue.amount) : '999+')});
  exportQueue.queue.start();
}

function exportCargos() {
  var today = new Date().setUTCHours(0, 0, 0, 0);
  var $cargos = checkCargosForExport();
  var $currencies = getCurrencies();
  var $countries = getLardiCountries();
  var $atips = getLardiAutoTips();
  var $cargoTypes = getCargoTypes();
  var duplicates = [];
  var ids = [];

  $.when($cargos, $currencies, $countries, $atips, $cargoTypes)
      .then(function(lcargos, lcurrencies, lcountries, atips, cargoTypes) {
        lcargos.forEach(function(cargo) {
          if (new Date(cargo.date_from) < today) {
            cargo.date_from = today;
          }
          lcurrencies.forEach(function(currency) {
            if (Number(currency.id) == Number(cargo.payment_currency_id)) {
              cargo.payment_currency_name = currency.name;
            }
          });

          if (!Array.isArray(atips)) {
            atips = [atips];
          }

          ids.push(cargo.id);
          duplicates.push(createCargoDuplicate(cargo, atips, lcountries, cargoTypes));
        });
        SMData.savePendingCargos('lardi', SMData.getPendingCargos().concat(ids));
        addToExportQueue(duplicates);
      })
      .catch(function(err) {
        console.log(err);
        //TODO obtain error
      });
}

/**
 * Creates object of cargo.lt load types from lardi data. All load types
 * missing on cargo.lt returned as string to add to note.
 * @param {string} string String of russian load types from lardi cargo object.
 * @return {Array[object, string]}
 */
function setLoadTypes(string) {

  function setToObject(rus, attr) {
    var index = array.indexOf(rus);
    if (index !== -1) {
      obj[attr] = 1;
      array.splice(index, 1);
    }
  }

  var obj = {};
  var array = string.split(', ');
  var loadTypes = '';

  if (!array) {
    return [obj, loadTypes];
  }

  setToObject('верхняя', 'top');
  setToObject('боковая', 'side');
  setToObject('задняя', 'back');

  loadTypes = array.join(', ');

  return [obj, loadTypes];
}

function normalizeCity(city) {
  city = city.replace(/[\!\;\.]/g, '');
  city = city.replace(/\(.*\)/g, '');

  if (~city.indexOf(',')) {
    city = (city.slice(0, city.indexOf(',')));
  } else if (~city.indexOf('+')) {
    city = (city.slice(0, city.indexOf('+')));
  } else {
    if (city.match(/\d/g) && city.match(/\d/g).length === 1 && city.length > 1) {
      city = city.replace(/\-?\d/g, '');
    }
  }
  city = city.replace(/[\!\;\.\,]/g, '');
  return city;
}

/** Returns key by value.
 * @param  {Object} object Object to search
 * @param  {string} name   Value to search
 * @return {number || -1}        ID or -1
 */
function getID(array, name) {
  var result = -1;
  name = name.trim().toLowerCase();
  array.forEach(function (el) {
    if (name === el.type.trim().toLowerCase()) {
      result = Number(el.id);
    }
  });

  return result;
}

function createSortedObjectsArray(data) {
  var arr = [];
  for (var key in data) {
    arr.push({ id: key, type: data[key] });
  }

  arr.sort(sortByAlphabet);
  return arr;
}

function sortByAlphabet(a, b) {
  if (a.type > b.type)
    return 1;
  if (b.type > a.type)
    return -1;
  return 0;
}


function getCargoTypes() {
  var def = $.Deferred();
  var req = new Request('cargo', 'GET', 'cargoTypes');

  sendRequest(req, null, function(response) {
    if (!response.error && response.success && 'cargoTypes' in response.success) {
      def.resolve(createSortedObjectsArray(response.success.cargoTypes));
    } else {
      def.reject(response.error);
    }
  });
  return def.promise();
}