'use strict';

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

function addToArrayWithoutDuplicates(array, el) {
  if (!~array.indexOf(el)) {
    array.push(el);
  }
}

function removeFromArray(array, el) {
  if (~array.indexOf(el)) {
    array.splice(array.indexOf(el), 1);
  }
}

function insertCheckbox() {
  var $select = $('.trailer-type-select');
  var $currentSelect = $select.find(':selected');
  var element;
  var container = $select.closest('.checkbox');
  var len = 100;
  var $target;

  if ($currentSelect && $currentSelect.val() !== '') {
    element = _.templates.trailerCheckbox({
      value: $currentSelect.val(),
      type: $currentSelect.text(),
    });

    $(element).insertBefore($select);

    $currentSelect.css('display', 'none');

    // fix for saving data
    if ('addingObj' in App.scenes.cargos) {
      addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.trailers, $currentSelect.val());
      SMData.saveCargoAdding(App.scenes.cargos.addingObj);
      $('.trailer-type-checkbox').off('change');
      $('.trailer-type-checkbox').on('change', function () {
        if ($(this).prop('checked')) {
          addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.trailers, $(this).val());
        } else {
          removeFromArray(App.scenes.cargos.addingObj.trailers, $(this).val());
        }
        SMData.saveCargoAdding(App.scenes.cargos.addingObj);
      });
    }
    //end fix

    $select.val('');
  }
}

function useEnteredData() {
  App.scenes.cargos.cargoTypeSet = 1;
}

function setCargoDependencies() {
  function setCheckbox(val) {
    var $checkbox = $('.trailer-type-checkbox[value="' + val + '"]');
    var $select = $('.trailer-type-select').find('option[value=' + val + ']');
    if ($checkbox[0]) {
      $checkbox.prop('checked', true);
      addToArrayWithoutDuplicates(App.scenes.cargos.addingObj.trailers, $checkbox.val());
    } else {
      $select.prop('selected', true).trigger('change');
    }
  }

  function setInput(selector, val) {
    var $el = $(selector);
    if (!$el.val()) {
      $el.val(val);
      $el.trigger('change');
    }
  }

  if (App.scenes.cargos.cargoTypeSet) {
    return false;
  }

  $('#weight, #volume, #palets, #temperatureMin, #temperatureMax, .trailer-type-select, ' +
    '.trailer-type-checkbox').unbind('change', useEnteredData);

  $('#weight, #volume, #palets, #temperatureMin, #temperatureMax').val('');
  $('.trailer-type-checkbox').prop('checked', false);
  App.scenes.cargos.removeAdditionalCheckboxes();
  $('.trailer-type-select option').css('display', 'block');

  var cargoType = parseInt($(this).val());

  //saveCargoAdding
  App.scenes.cargos.addingObj.cargoType = cargoType;
  App.scenes.cargos.addingObj.trailers = [];

  switch (cargoType) {
    case 56:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setCheckbox(18);
      setCheckbox(6);
      setCheckbox(15);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
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
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 6:
    case 8:
    case 9:
    case 10:
    case 12:
    case 13:
    case 20:
    case 23:
    case 27:
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
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 1:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#adr').val(1);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 59:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(16);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 18:
    case 30:
    case 39:
    case 64:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      setCheckbox(3);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 36:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 33:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
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
      // $('#temperature').prop('disabled', false);
      $('#temperatureMin').val(-18);
      $('#temperatureMax').val(-18);
      break;
    case 3:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin').val(4);
      $('#temperatureMax').val(7);
      break;
    case 4:
    case 34:
      setInput('#volume', 82);
      setInput('#weight', 20);
      setInput('#palets', 33);
      setCheckbox(1);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
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
      // $('#temperature').prop('disabled', true);
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
      // $('#adr').val(1);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 29:
      setInput('#volume', 0);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 66:
    case 67:
      setInput('#volume', 60);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(7);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 14:
      setInput('#volume', 60);
      setInput('#weight', 20);
      setInput('#palets', 0);
      setCheckbox(7);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', false);
      // $('#adr').val(1);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    case 53:
      setInput('#volume', 0);
      setInput('#weight', 0);
      setInput('#palets', 33);
      setCheckbox(2);
      setCheckbox(13);
      setCheckbox(8);
      $('.load-type[value="full"]').prop('checked', true);
      // $('#temperature').prop('disabled', true);
      $('#temperatureMin, #temperatureMax').val('');
      break;
    default:
      console.log(cargoType);
      break;
  }
  $('.load-type[value="full"]').trigger('change');

  SMData.saveCargoAdding(App.scenes.cargos.addingObj);
}

function checkTemperature() {
  var $ref = $('.trailer-type-checkbox[value=1]');
  var $isoterm = $('.trailer-type-checkbox[value=3]');
  var $cistern = $('.trailer-type-checkbox[value=7]');
  var $temp = $('#temperature');

  if ($ref.prop('checked') || $isoterm.prop('checked') ||
      ($cistern[0] && $cistern.prop('checked'))) {
    $temp.prop('disabled', false);
  } else {
    $temp.prop('disabled', true);
    $('#temperatureMin').val(4);
    $('#temperatureMax').val(7);
  }
}

function setParam(param, defaultVal) {
  return parseInt(param)
      ? parseInt(param)
      : defaultVal;
}

function setFloatParam(param, defaultVal) {
  return parseFloat(param)
      ? parseFloat(param)
      : defaultVal;
}
