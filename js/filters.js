function getTimestamp(obj) {
  return parseInt($(obj).attr('timestamp'));
}

function getToday() {
  if (getTimestamp(this) === (new Date().setUTCHours(0, 0, 0, 0) / 1000)) {
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
  if (a.type > b.type)
      return 1;
  if (b.type > a.type)
      return -1;
  return 0;
}

function sortCities(a, b) {
  if (a.object.type < b.object.type)
      return 1;
  if (b.object.type < a.object.type)
      return -1;
  return 0;
}

function sortContacts(a, b) {
  if (a.id > b.id)
      return 1;
  if (b.id > a.id)
      return -1;
  return 0;
}

function sortByNewAndID(a, b) {
  return (a.isNew < b.isNew) - (b.isNew < a.isNew) || (a.id < b.id) - (b.id < a.id);
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

function selectedContact(id, value) {
  return function (value) {
    return ('contact' in value && value.contact === id);
  };
}

function isIDInArray(n, val, index, array) {
  return n.id == val.id;
}
