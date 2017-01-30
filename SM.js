'use strict';

var SM = (function () {
  var sm = {};

  sm.get = function (key) {
    return localStorage.getItem(key);
  };

  sm.put = function (key, data) {
    return localStorage.setItem(key, data);
  };

  sm.delete = function (key) {
    return localStorage.removeItem(key);
  };

  return sm;
}());

var SMData = (function () {
  var smdata = {};

  smdata.saveToken = function (key, data) {
    SM.put(key + 'Token', data);
    if (typeof App !== 'undefined') {
      App.systemPort.postMessage({ task: 'authChanges', props: {} });
    } else {
      socketAuth();
    }
  };

  smdata.getToken = function (key) {
    return SM.get(key + 'Token');
  };

  smdata.removeToken = function (key) {
    SM.delete(key + 'Token');
    if (typeof App !== 'undefined') {
      App.systemPort.postMessage({ task: 'authChanges', props: {} });
    } else {
      socketAuth();
    }
  };

  smdata.saveUserData = function (key, data) {
    SM.put(key + 'Login', data.login);
    SM.put(key + 'Password', data.password);
    SM.put(key + 'Name', data.name);
    SM.put(key + 'ID', data.id);
    SM.put(key + 'CompanyID', data.cid);
    SM.put(key + 'Contact', data.contact);
  };

  smdata.updateUserData = function (key, variable, data) {
    SM.put(key + variable, data);
  };

  smdata.removeUserData = function (key) {
    SM.delete(key + 'Login');
    SM.delete(key + 'Password');
    SM.delete(key + 'Name');
    SM.delete(key + 'ID');
    SM.delete(key + 'CompanyID');
    SM.delete(key + 'Contact');
  };

  smdata.getUserData = function (key) {
    return {
      login: SM.get(key + 'Login'),
      password: SM.get(key + 'Password'),
      name: SM.get(key + 'Name'),
      id: SM.get(key + 'ID'),
      cid: SM.get(key + 'CompanyID'),
      contact: SM.get(key + 'Contact'),
    };
  };

  smdata.getWatchedCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'CargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  smdata.saveWatchedCargos = function (key, array) {
    return SM.put(key + 'CargoIDs', array);
  };

  smdata.removeWatchedCargos = function (key) {
    SM.delete(key + 'CargoIDs');
  };

  smdata.getExportedCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'exportedCargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  smdata.saveExportedCargos = function (key, array) {
    return SM.put(key + 'exportedCargoIDs', array);
  };

  smdata.removeExportedCargos = function (key) {
    SM.delete(key + 'exportedCargoIDs');
  };

  smdata.getPendingCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'pendingCargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  smdata.savePendingCargos = function (key, array) {
    return SM.put(key + 'pendingCargoIDs', array);
  };

  smdata.removePendingCargos = function (key) {
    SM.delete(key + 'pendingCargoIDs');
  };

  smdata.getErrorCargos = function (key) {
    var resp = [];
    var ids = SM.get(key + 'errorCargoIDs');

    if (typeof ids === 'string') {
      resp = ids.split(',');
    }

    return resp;
  };

  smdata.saveErrorCargos = function (key, array) {
    return SM.put(key + 'errorCargoIDs', array);
  };

  smdata.removeErrorCargos = function (key) {
    SM.delete(key + 'errorCargoIDs');
  };

  smdata.saveCargoAdding = function (obj) {
    var data;
    if (obj && typeof obj === 'object' && obj instanceof AddingCargo) {
      data = $.extend(smdata.getCargoAdding(), obj);
      return SM.put('cargoObject', JSON.stringify(data));
    }
  };

  smdata.getCargoAdding = function () {
    var obj = new AddingCargo();
    $.extend(obj, JSON.parse(SM.get('cargoObject')));
    return obj;
  };

  smdata.removeCargoAdding = function () {
    SM.delete('cargoObject');
  };

  smdata.saveGCMRegistered = function() {
    return SM.put('GCMRegistered', true);
  };

  smdata.isGCMRegistered = function() {
    return SM.get('GCMRegistered') === 'true';
  };

  smdata.setSystemMessagesAccept = function(bool) {
    return SM.put('SystemMessages', bool);
  };

  smdata.getSystemMessagesAccept = function() {
    return SM.get('SystemMessages') === 'true';
  };

  smdata.setMarketMessagesAccept = function(bool) {
    return SM.put('MarketMessages', bool);
  };

  smdata.getMarketMessagesAccept = function() {
    return SM.get('MarketMessages') === 'true';
  };

  smdata.saveGCMToken = function(token) {
    return SM.put('GCMToken', token);
  };

  smdata.getGCMToken = function() {
    return SM.get('GCMToken');
  };

  return smdata;
}());
