'use strict';

function setSweetAlertDefaults() {
  if (swal && typeof swal === 'function') {
    swal.setDefaults({
      imageUrl: '/css/images/error.png',
      imageSize: '50x50',
      confirmButtonColor: '#91b247',
      allowEscapeKey: true,
      allowOutsideClick: true,
      customClass: 'alert-window',
      confirmButtonText: 'Закрыть',
    });
  }
}

function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function onEnter(func, event) {
  event = event || window.event;
  if (event.keyCode === 13) {
    return func();
  }
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

if (!Array.prototype.first) {
  Array.prototype.first = function () {
    return this[0];
  };
}

function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}

function checkEmpty(input) {
  return ($(input).val().length === 0);
}

var x2js = new X2JS();
