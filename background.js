'use strict';

function sendRequest(data, uid, callback) {
  var reqParams = {
    url: '',
    type: '',
    data: '',
    crossDomain: true,
    dataType: '',
    contentType: '',
    headers: {},
    success: function (response) {
      callback({ error: null, success: response });
    },

    error: function (error) {
      if (error.status === 200) {
        return callback({ error: null, success: error.responseText });
      }

      callback({ error: error, success: null });
    },
  };

  if (!data || !data.to || (data.to === 'cargo' && !data.url)) {
    return callback({ error: 'Invalid data to send', success: null });
  }

  reqParams.type = data.type;
  reqParams.headers = data.headers ? data.headers : {};

  switch (data.to){
    case 'lardi':
      reqParams.dataType = 'application/xml';
      reqParams.contentType = 'application/x-www-form-urlencoded';
      reqParams.url = 'http://api.lardi-trans.com/api/';
      reqParams.data = data.data;
      break;
    case 'cargo':
      reqParams.dataType = 'json';
      reqParams.contentType = 'application/json';
      reqParams.url = 'https://io.cargo.lt/' + data.url;
      reqParams.data = (reqParams.type === 'POST') ? JSON.stringify(data.data) : data.data;
      break;
    case 'countries':
      reqParams.dataType = 'json';
      reqParams.contentType = 'application/json';
      reqParams.url = 'https://restcountries.eu/rest/v1/name/' + data.url;
    default:
      console.log(reqParams);
  }

  $.ajax(reqParams);
}

if (navigator.userAgent.search(/Gecko/) > -1) {
  chrome.runtime.onMessage.addListener(function (request, uid, callback) {
    sendRequest(request, uid, callback);
    return true;
  });
}

function exportBatch(items) {
  var queue = this.queue;
  var sended = [];
  var ruCargos = '';
  var amount = String(this.size());
  var promise;

  if (!Array.isArray(items)) {
    if ('promise' in items) {
      promise = items.promise;
      delete items.promise;
      sended.push(sendRequest(item, null, promise));
    }
  } else {
    items.forEach(function (el) {
      if ('promise' in el) {
        promise = el.promise;
        delete el.promise;
        sended.push(sendRequest(el, null, promise));
      }
    });
  }

  if (sended.length > 0) {
    $.when.apply(self, sended).then(
      function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        port.postMessage({ sended: args });
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

function addBatch(item) {
  var queue = this.queue;
  var sended = [];
  var ruCargos = '';
  var amount = String(this.size());
  var promise;

  if (!Array.isArray(items)) {
    if ('promise' in items) {
      promise = items.promise;
      delete items.promise;
      sended.push(sendRequest(item, null, promise));
    }
  } else {
    items.forEach(function (el) {
      if ('promise' in el) {
        promise = el.promise;
        delete el.promise;
        sended.push(sendRequest(el, null, promise));
      }
    });
  }

  if (sended.length > 0) {
    $.when.apply(self, sended).then(
      function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        port.postMessage({ sended: args });
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
    this.port.postMessage({ done: true });
  }
}

var MQ = function (portName, defaults) {
  if (!name || !defaults) {
    return false;
  }

  var self = this;
  this.port = undefined;
  this.queue = $.jqmq(defaults);
};

var exportQueue = new MQ('export',
{
  delay: -1,
  batch: 5,
  callback: exportBatch.bind(exportQueue),
  complete: exportComplete.bind(exportQueue)
});

var addQueue = new MQ('add',
{
  delay: -1,
  batch: 1,
  callback: addBatch.bind(exportQueue),
  complete: exportComplete.bind(addQueue)
});

chrome.runtime.onConnect.addListener(function (port) {
  var Queue;

  if (port.name === 'export') {
    Queue = exportQueue;
    console.log('export');
  } else if (port.name === 'add') {
    Queue = addQueue;
    console.log('add');
  } else {
    return false;
  }

  Queue.port = port;

  port.onMessage.addListener(function (msg) {
      if (msg.task === 'addToQueue' && msg.props) {
        if (Array.isArray(msg.props)) {
          Queue.queue.addEach(msg.props);
        } else if (typeof msg.props === 'object') {
          Queue.queue.add(msg.props);
        } else {
          port.postMessage({ error: 'Incorrect data' });
        }
      }
    });
});
