'use strict';

function sendDuplicateToCargo(item) {
  var id = '';
  var token = '';
  var def = $.Deferred();
  var creq = new Request('cargo', 'POST', 'cargos');

  if (item) {
    id = item.lardiID;
    token = item.token;
    delete item.lardiID;
    delete item.token;

    creq.data = item;
    creq.headers = {
      'Access-Token': token,
    };
    // console.log(creq);
    sendToServer(creq).then(
      function (response) {
        def.resolve({ error: null, id: id });
      },
      function (error) {
        var err;

        console.log(error);
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
  } else {
    def.resolve({ error: 'No object', response: null, id: null });
  }

  return def.promise();
};

function exportCargoBatch(items) {
  var self = this;
  var queue = this.queue;
  var sended = [];
  var ruCargos = '';
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

function addCargoBatch(item) {
  var queue = this.queue;
  var sended = [];
  var ruCargos = '';
  var amount = String(queue.size());

  if (!Array.isArray(items)) {
    sended.push(sendRequest(item, null, promise));
  } else {
    items.forEach(function (el) {
      sended.push(sendRequest(el, null, promise));
    });
  }

  if (sended.length > 0) {
    $.when.apply(self, sended).then(
      function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        if (port) {
          port.postMessage({ sended: args });
        }
        queue.next();
      },
      function (error) {
        queue.next();
      }
    );
  } else {
    queue.next();
  }
}

function exportComplete() {
  if (this.port) {
    this.port.postMessage({ done: this.queue.size() === 0, show: true });
  }

  this.amount = this.queue.size();
  SMData.savePendingCargos('lardi', []);
}
