'use strict';

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

function setCargoBodyType(id, group) {
  var trailers = [];

  if (!group) {
    return trailers;
  }

  id = parseInt(id);

  if (id) {
    switch (id) {
      // case 34:
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
        // trailers.push(9, 10, 17);
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

function getName(array, id) {
  var name = '';
  array.forEach(function (el) {
    if (Number(el.id) === Number(id)) {
      name = el.name;
    }
  });
  return name;
}

function getLardiCountryName(countryID) {
  return getName(lardiCountries, countryID);
}

function getLardiCountryCode(countryID) {
  var code = '';

  lardiCountries.forEach(function (el) {
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

function getLardiAreaName(countryID, areaID) {
  var name = '';
  lardiCountries.forEach(function (el) {
    if (countryID === el.id) {
      if (areaID && el.areas && typeof el.areas === 'object') {
        if (el.areas.area && typeof el.areas.area === 'object') {
          if (Array.isArray(el.areas.area)) {
            el.areas.area.forEach(function (area) {
              if (Number(area.id) === Number(areaID)) {
                name = area.name;
              }
            });
          } else {
            if (Number(el.areas.area.id) === Number(areaID)) {
              name = el.areas.area.name;
            }
          }
        }
      }
    }
  });
  return name;
}

function updateContactsCounter(array, id) {
  return array.forEach(function (el) {
    if (el.id === id) {
      el.count++;
    }
  });
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

function setLardiDate(date) {
  var newDate;
  var day;
  var month;
  var year;

  if (!date) {
    newDate = new Date();
  } else {
    newDate = new Date(date);
  }

  day = String(newDate.getDate());
  month =  String(newDate.getMonth() + 1);
  year =  String(newDate.getFullYear());

  return (year + '-' + (month.length < 2 ? '0' + month : month) + '-' + (day.length < 2 ? '0' + day : day));
}
