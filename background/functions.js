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

function sendToServer(req) {
  var result = $.Deferred();

  sendRequest(req, null, function (response) {
    if (response.error) {
      return result.reject(response.error);
    }

    return result.resolve(response.success);
  });

  return result.promise();
};

function onConnect(port) {
  var Queue;

  if (port.name === 'export') {
    Queue = exportQueue;
  } else if (port.name === 'add') {
    Queue = addQueue;
  } else {
    return false;
  }

  Queue.port = port;

  port.onMessage.addListener(function (msg) {
      if (!msg || typeof msg !== 'object') {
        console.log('Object not set: msg');
        return false;
      }

      if (Queue.port) {

        if (msg.task === 'addToQueue' && msg.props) {
          Queue.queue.pause();
          if (Array.isArray(msg.props)) {
            Queue.queue.addEach(msg.props);
          } else if (typeof msg.props === 'object') {
            Queue.queue.add(msg.props);
          } else {
            Queue.port.postMessage({ error: 'Incorrect data' });
          }
          Queue.amount = Queue.queue.size();
          Queue.queue.start();
        } else if (msg.task === 'disconnect') {
          Queue.port.disconnect();
        }

        if (port.name === 'export') {
          if (msg.task === 'exportEnabled') {
            port.postMessage({ done: Queue.queue.size() === 0 });
          }
        }

      }
    });

  port.onDisconnect.addListener(function (event) {
        Queue.port = undefined;
      });
}

function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}
