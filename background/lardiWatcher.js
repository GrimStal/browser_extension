'use strict';

function checkCargosForExport() {
  var result = $.Deferred();
  var resp;
  var cargos = [];
  var token = SMData.getToken('lardi');
  var cargoToken = SMData.getToken('cargo');
  var req = new Request('lardi', 'GET');
  var lardiUser = SMData.getUserData('lardi');

  if (token && cargoToken) {
    req.data = {
      sig: token,
      method: 'my.gruz.list',
    };

    sendRequest(req, null, function(response) {
      if (!response.error && response.success) {
        resp = XMLtoJson(response.success);
        if (resp.error) {
          return result.reject(resp.error);
        }
        if ('response' in resp) {
          resp = resp.response;
          if ('gruz' in resp) {
            if (typeof resp.gruz === 'object' && 'item' in resp.gruz && typeof resp.gruz.item === 'object') {
              if (Array.isArray(resp.gruz.item)) {
                cargos = resp.gruz.item;
              } else {
                cargos.push(resp.gruz.item);
              }
            }
          } else if ('error' in resp) {
            SMData.removeToken('lardi');
            signIn('lardi', lardiUser.login, lardiUser.password, function(key, result) {
              if (result) {
                return result = checkCargosForExport();
              }
              return result.reject(resp.error);
            });
          } else {
            return result.reject('Data structure error', resp);
          }
        }

        return result.resolve(cargos);
      }
    });
  } else {
    result.reject('User is not authorized on both cargo and lardi.');
  }

  return result.promise();
}

function signIn(key, login, password, callback) {
  var self = this;
  var link = (key === 'cargo') ? 'accounts/signin' : '';
  var req = new Request(key, 'POST', link);
  var data = {
    login: login,
    password: (key !== 'lardi') ? password : md5(password),
  };

  if (key === 'lardi') {
    data.method = 'auth';
  }

  req.data = data;

  sendRequest(req, null, function(response) {
    var result = false;
    var token;
    var res;
    var processing = $.Deferred();

    processing.then(
        function() {
          SMData.saveToken(key, token);
        },
        function(error) {
          console.error(error);
        })
        .always(function() {
          if (callback && typeof callback === 'function') {
            callback(key, result);
          }
        });

    if (!response.error && response.success) {
      if (key === 'lardi') {
        res = XMLtoJson(response.success);

        if (!res || !'response' in res || 'error' in res.response) {
          return processing.reject(res);
        }

        res = res.response;
        result = true;
        token = res.sig;
        processing.resolve();

      } else {
        result = true;
        res = response.success;
        token = res.accessToken;
        processing.resolve();
      }
    } else {
      processing.reject(response.error.responseText);
    }
  });
}

function filterCargos(cargo) {
  var exported = SMData.getExportedCargos('lardi');
  if (!~exported.indexOf(cargo.id)) {
    if (cargo.date_to) {
      return new Date(cargo.date_to) >= Date.now();
    } else {
      return new Date(cargo.date_from) >= Date.now();
    }
  }
}

function lardiExportWatcher() {
  if (SMData.getSystemMessagesAccept()) {
    if (!exportQueue.queue.size()) {
      checkCargosForExport()
          .then(function(cargos) {
            showNewCargosNotification(cargos.filter(filterCargos).length);
          })
          .catch(function(err) {
            console.log(err);
          });
    }
  }
}