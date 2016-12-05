'use strict';

function sendDuplicateToCargo(item) {

  function sendObject(req) {
    sendToServer(req).then(
      function (response) {
        def.resolve({ error: null, id: id });
      },
      function (error) {
        var err = '';
        if ('responseJSON' in error) {
          if ('error' in error.responseJSON) {
            err = error.responseJSON.error;
          }
        }
        if (err.length === 0) {
          err = 'Unknown error';
        }
        def.resolve({ error: err, id: id });
      }
    );
  }

  var id = '';
  var token = '';
  var def = $.Deferred();
  var creq = new Request('cargo', 'POST', 'cargos');
  var originRequest;
  var destinationRequest;

  if (~item.origins[0].name.search(/[0-9]/) || ~item.destinations[0].name.search(/[0-9]/)) {
    def.resolve({ error: 'Place can not be only numeric', response: null, id: null });
  }

  if (item) {
    id = item.lardiID;
    token = item.token;
    delete item.lardiID;
    delete item.token;

    creq.headers = {
      'Access-Token': token,
    };
    creq.data = item;
    sendObject(creq);
  } else {
    def.resolve({ error: 'No object', response: null, id: null });
  }

  return def.promise();
};

function sendNewCargo(item) {
  var def = $.Deferred();
  var req;
  var type;

  if (item) {

    if ('token' in item) {
      req = new Request('cargo', 'POST', 'cargos');
      req.headers = { 'Access-Token': item.token };
      delete item.token;
      type = 'cargo';
    } else if ('sig' in item) {
      req = new Request('lardi', 'POST');
      type = 'lardi';
    } else {
      def.reject('Server not set');
      return def.promise();
    }

    req.data = item;
    // console.log(creq);
    sendToServer(req).then(
      function (response) {
        if (type === 'cargo') {
          def.resolve({ error: null, server: 'cargo', id: response.id });
        } else if (type === 'lardi') {
          var resp = XMLtoJson(response);
          if ('response' in resp) {
            resp = resp.response;
          } else {
            return def.resolve({ error: 'Could not parse response', server: 'lardi', id: null });
          }

          if ('error' in resp) {
            def.resolve({ error: resp.error, server: 'lardi', id: null });
          } else {
            def.resolve({ error: null, server: 'lardi', id: resp.id });
          }
        }
      },
      function (error) {
        var err = '';

        console.log(error);
        if ('responseJSON' in error) {
          if ('error' in error.responseJSON) {
            err = error.responseJSON.error;
          }
        }

        if (err.length === 0) {
          err = 'Unknown error';
        }

        def.resolve({ error: err, server: (type === 'cargo' ? 'cargo' : 'lardi'), id: null });
      }
    );
  } else {
    def.resolve({ error: 'No object' });
  }

  return def.promise();
};

function exportCargoBatch(items) {
  var self = this;
  var queue = this.queue;
  var sended = [];
  var amount = this.amount;

  if (!this.inited) {
    return console.log('Not inited MQ');
  }

  if (!Array.isArray(items)) {
    sended.push(sendDuplicateToCargo(items));
  } else {
    items.forEach(function (el) {
      sended.push(sendDuplicateToCargo(el));
    });
  }

  chrome.browserAction.setIcon({ path: 'css/images/icons/loading-icon.png' });

  if (sended.length > 0) {
    $.when.apply(self, sended).then(
      function () {
        var args = [];
        var success = [];
        var errored = SMData.getErrorCargos('lardi');
        var pending = SMData.getPendingCargos('lardi');
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        args.forEach(function (el) {
          if (!('id') in el) {
            return false;
          }

          var pendingEl = pending.indexOf(el.id);
          if (pendingEl > -1) {
            pending.splice(pendingEl, 1);
            SMData.savePendingCargos('lardi', pending);
          }

          if (el.error) {
            if (errored.indexOf(el.id) === -1) {
              errored.push(el.id);
              SMData.saveErrorCargos('lardi', errored);
            }
          } else {
            if (errored.indexOf(el.id) > -1) {
              errored.splice(errored.indexOf(el.id), 1);
              SMData.saveErrorCargos('lardi', errored);
            }
            success.push(el.id);
          }
        });

        SMData.saveExportedCargos('lardi', SMData.getExportedCargos('lardi').concat(success));
        chrome.browserAction.setBadgeText({ text: (queue.size() < 1000 ? String(queue.size()) : '999+') });
        if (self.port) {
          self.port.postMessage({ sended: { ids: args, left: queue.size(), of: amount } });
        }
        queue.next();
      },
      function (error) {
        console.log(error);
        console.log('This mistake never might happen! Cargolt.js 103:8');
        if (self.port) {
          self.port.postMessage({ error: 'Не удалось связаться с сервером' });
        }
        queue.pause();
      }
    );
  } else {
    queue.next();
  }
}

function addCargoBatch(items) {
  var self = this;
  var queue = this.queue;
  var sended = [];
  var amount = this.amount;

  if (!this.inited) {
    return console.log('Not inited MQ');
  }

  if (!Array.isArray(items)) {
    sended.push(sendNewCargo(items));
  } else {
    items.forEach(function (el) {
      sended.push(sendNewCargo(el));
    });
  }

  if (sended.length > 0) {
    $.when.apply(self, sended).then(
      function () {
        var args = [];
        var success = [];
        var cargo = { success: false, error: '' };
        var lardi = { success: false, error: '' };
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        args.forEach(function (el) {
          if (el.server === 'cargo') {
            if (el.error) {
              cargo.error = el.error;
            } else {
              cargo.success = true;
            }
          } else if (el.server === 'lardi') {
            if (el.error) {
              lardi.error = el.error;
            } else {
              lardi.success = true;
              if (el.id) {
                SMData.saveExportedCargos('lardi', SMData.getExportedCargos('lardi').concat([el.id]));
              }
            }
          }
        });
        if (self.port) {
          self.port.postMessage({ sended: { cargo: cargo, lardi: lardi } });
        }
        queue.next();
      },
      function (error) {
        console.log(error);
        console.log('This mistake never might happen! Cargolt.js 241:8');
        if (self.port) {
          self.port.postMessage({ error: 'Не удалось связаться с сервером' });
        }
        queue.pause();
      }
    );
  } else {
    queue.next();
  }
}

function exportComplete() {
  if (this.port) {
    this.port.postMessage({ done: this.queue.size() === 0, show: true, errored: this.errored, of: this.amount });
  }

  this.amount = this.queue.size();
  this.errored = 0;
  SMData.savePendingCargos('lardi', []);
  chrome.browserAction.setIcon({ path: 'css/images/icons/16x16.png' });
  chrome.browserAction.setBadgeText({ text: '' });
}

function addComplete() {
  if (this.port) {
    this.port.postMessage({ done: this.queue.size() === 0, show: true });
  }

  this.amount = this.queue.size();
}
