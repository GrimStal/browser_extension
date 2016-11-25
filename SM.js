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
    return SM.put(key + 'Token', data);
  };

  smdata.getToken = function (key) {
    return SM.get(key + 'Token');
  };

  smdata.removeToken = function (key) {
    SM.delete(key + 'Token');
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
    return SM.put(key + variable, data);
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

  return smdata;
}());
