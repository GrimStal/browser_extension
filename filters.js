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
      if (String(duplicates[i].id) &&
          String(duplicates[i].id) === String(el.id)) {
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

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function insertCheckbox() {
  var $select = $('.trailer-type-select');
  var $currentSelect = $select.find(':selected');
  var element;
  var container = $select.closest('.checkbox');
  var len = 100;
  var $target;

  /** Get elements with label elements and search wich element contains
  * the least of elements to add checkbox there.
  */
  container.children().find('label').parent().each(function (i, el) {
    var length = $(el).children().length;
    if (length < len) {
      $target = $(el);
      len = length++;
    } else {
      len = length;
    }
  });

  if ($currentSelect && $currentSelect.val() !== '') {
    element = _.templates.trailerCheckbox({
      value: $currentSelect.val(),
      type: $currentSelect.text(),
    });

    if ($target.get(0) === $select.parent().get(0)) {
      $(element).insertBefore($select);
    } else {
      $target.append(element);
    }

    $currentSelect.remove();
  }
}

function setCargoDependencies() {
  function setCheckbox(val) {
    var $checkbox = $('.trailer-type-checkbox[value="' + val + '"]');
    var $select = $('.trailer-type-select').find('option[value=' + val + ']');
    if ($checkbox[0]) {
      $checkbox.prop('checked', true);
    } else {
      $select.prop('selected', true).trigger('change');
    }
  }

  function setInput(selector, val) {
    var $el = $(selector);
    if (!$el.val()) {
      $el.val(val);
    }
  }

  var cargoType = parseInt($(this).val());

  switch (cargoType) {
    case 56:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setCheckbox(18);
      setCheckbox(6);
      setCheckbox(15);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    case 2:
    case 5:
    case 7:
    case 11:
    case 15:
    case 16:
    case 17:
    case 19:
    case 21:
    case 22:
    case 24:
    case 25:
    case 26:
    case 32:
    case 37:
    case 41:
    case 45:
    case 46:
    case 47:
    case 54:
    case 55:
    case 57:
    case 58:
    case 60:
    case 61:
    case 62:
    case 65:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    case 6:
    case 8:
    case 9:
    case 10:
    case 12:
    case 13:
    case 20:
    case 23:
    case 28:
    case 31:
    case 40:
    case 43:
    case 48:
    case 49:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      break;
    case 1:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#adr').val(1);
      $('#temperature').prop('disabled', false);
      break;
    case 27:
    case 59:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(16);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    case 30:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      setCheckbox(3);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    case 18:
    case 39:
    case 64:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      setCheckbox(3);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      break;
    case 36:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      break;
    case 33:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      $('#temperatureMin').val(0);
      $('#temperatureMax').val(2);
      break;
    case 35:
    case 38:
    case 44:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      $('#temperatureMin').val(-18);
      $('#temperatureMax').val(-18);
      break;
    case 3:
    case 4:
    case 34:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      $('#temperatureMin').val(4);
      $('#temperatureMax').val(7);
      break;
    case 50:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      $('#temperatureMin').val(2);
      $('#temperatureMax').val(8);
      break;
    case 42:
      setInput('#volume', 0);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#adr').val(1);
      break;
    case 29:
      setInput('#volume', 0);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      break;
    case 66:
    case 67:
      setInput('#volume', 60);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(7);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    case 14:
      setInput('#volume', 60);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(7);
      $('.load-type[value="full"]').prop('checked', true);
      $('#temperature').prop('disabled', false);
      $('#adr').val(1);
      break;
    case 53:
      setInput('#volume', 0);
      setInput('#weight', 0);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      break;
    default:
      console.log(cargoType);
      break;
  }
}

function checkTemperature() {
  var $ref = $('.trailer-type-checkbox[value=1]');
  var $isoterm = $('.trailer-type-checkbox[value=3]');
  var $temp = $('#temperature');

  if ($ref.prop('checked') || $isoterm.prop('checked')) {
    $temp.prop('disabled', false);
  } else {
    $temp.prop('disabled', true);
    $('#temperatureMin, #temperatureMax').val(0);
  }
}
