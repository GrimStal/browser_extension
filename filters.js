function getTimestamp(obj) {
  return parseInt($(obj).attr('timestamp'));
}

function getToday() {
  if (getTimestamp(this) === (new Date().setHours(0, 0, 0, 0) / 1000)) {
    return true;
  }

  return false;
};

function availableDates() {
  if (getTimestamp(this) >= (new Date().setHours(0, 0, 0, 0) / 1000)) {
    return true;
  }

  return false;
}

function pastDates() {
  if (getTimestamp(this) < (new Date().setHours(0, 0, 0, 0) / 1000)) {
    return true;
  }

  return false;
}

function sortByAlphabet(a, b) {
  if (a.type > b.type) return 1;
  if (b.type > a.type) return -1;
  return 0;
}

function createSortedObjectsArray(data) {
  var arr = [];
  for (var key in data) {
    arr.push({ id: key, type: data[key] });
  }

  arr.sort(sortByAlphabet);
  return arr;
}

function removeDuplicates(array, duplicates) {

  function checkDuplicates(el) {
    for (var i = 0; i < duplicates.length; i++) {
      if (String(duplicates[i].id) && String(duplicates[i].id) === String(el.id)) {
        return false;
      }
    }

    return true;
  }

  return array.filter(checkDuplicates);
}

function concatArraysInArray(array) {
  var result = [];

  array.forEach(function (item) {
    result = result.concat(item);
  });

  return result;
}

function onlyPositiveDigits(e) {
  var digits = ' 1234567890.,';
  if (e.keyCode !== 8 && e.keyCode !== 46) {
    return (digits.indexOf(String.fromCharCode(e.which)) !== -1);
  }
}

function onlyDigits(e) {
  var digits = ' 1234567890.,-+';
  if (e.keyCode !== 8 && e.keyCode !== 46) {
    return (digits.indexOf(String.fromCharCode(e.which)) !== -1);
  }
}
