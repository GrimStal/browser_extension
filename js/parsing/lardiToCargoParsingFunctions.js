'use strict';

/** Returns key by value.
 * @param  {Object} object Object to search
 * @param  {string} name   Value to search
 * @return {number || -1}        ID or -1
 */
function getID(object, name) {
  var result = -1;
  name = name.trim().toLowerCase();
  _.forEach(object, function (objName, key) {
    if (name === objName.trim().toLowerCase()) {
      result = Number(key);
    }
  });

  return result;
}

function setCargoBodyType(id, group) {
  var trailers = [];

  if (!group) {
    return trailers;
  }

  if (id) {
    if (typeof id !== 'number') {
      id = parseInt(id);
    }

    switch (id) {
      case 34:
      case 44:
      case 55:
      case 62:
        trailers.push(2, 8, 13);
        break;
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
      case 27:
        trailers.push(4);
        break;
      case 43:
        trailers.push(2, 3, 8, 9, 10, 13, 17);
        break;
      case 46:
      case 65:
      case 66:
      case 67:
        trailers.push(19);
        break;
      case 35:
      case 42:
      case 58:
      case 63:
        trailers.push(23);
        break;
      case 50:
      case 51:
      case 64:
        trailers.push(18);
        break;
      case 28:
        trailers.push(4);
        break;
      case 30:
        trailers.push(15);
        break;
      case 33:
      case 53:
        trailers.push(16);
        break;
      case 22:
      case 24:
      case 37:
      case 56:
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
      case 59:
      case 60:
        trailers.push(21);
        break;
      case 66:
        trailers.push(2, 3, 8, 9, 10, 13, 17);
        break;
      case 43:
        trailers.push(2, 3, 8, 9, 10, 13, 17);
        break;
      case 43:
        trailers.push(2, 3, 8, 9, 10, 13, 17);
        break;
      case 43:
        trailers.push(2, 3, 8, 9, 10, 13, 17);
        break;
    }
  } else {
    if (typeof group !== 'number') {
      group = parseInt(group);
    }

    switch (group) {
      case 1:
        trailers.push(1, 2, 3, 4, 5, 8, 9, 10, 13, 17);
        break;
      case 2:
        trailers.push(15, 16, 18, 20, 23);
        break;
      case 3:
        trailers.push(7);
        break;
      case 4:
        trailers.push(6, 19, 21, 22);
        break;
    }

  }

  return trailers;
}

function getLardiCountryName(countryID) {
  var name = '';
  lardiCountries.forEach(function (el) {
    if (countryID === el.id) {
      name = el.name;
    }
  });

  return name;
}

function getLardiAreaName(countryID, areaID) {
  var name = '';
  lardiCountries.forEach(function (el) {
    if (countryID === el.id) {
      if (areaID && el.areas && typeof el.areas === 'object'
       && el.areas.area && el.areas.area.forEach) {
        el.eareas.area.forEach(function (area) {
          if (Number(area.id) === Number(areaID)) {
            name = area.name;
          }
        });
      }
    }
  });
  return name;
}
