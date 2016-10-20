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

  if (typeof id !== 'number') {
    id = parseInt(id);
  }

  if (typeof group !== 'number') {
    group = parseInt(group);
  }

  if (id) {
    switch (id) {
      case 34:
        trailers.push(2, 8, 13);
        break;
      case 25:
        trailers.push(3);
        break;
      case 32:
        trailers.push(1);
        break;
      case 36:
        trailers.push();
    }
  }

  return object;
}
