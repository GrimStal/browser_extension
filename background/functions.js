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
      reqParams.headers['Accept-Language'] = 'ru-ru, ru';
      break;
    case 'cargo':
      reqParams.dataType = 'json';
      reqParams.contentType = 'application/json';
      reqParams.url = 'https://io.cargo.lt/' + data.url;
      reqParams.data = (reqParams.type === 'POST') ? JSON.stringify(data.data) : data.data;
      reqParams.headers['Accept-Language'] = 'ru-ru, ru';
      break;
    case 'countries':
      reqParams.dataType = 'json';
      reqParams.contentType = 'application/json';
      reqParams.url = 'https://restcountries.eu/rest/v1/name/' + data.url;
      break;
    // case 'geo':
    //   reqParams.data = data.data;
    //   reqParams.dataType = 'json';
    //   reqParams.contentType = 'application/json';
    //   reqParams.url = 'http://dev.virtualearth.net/REST/v1/Locations';
    //   break;
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
          if (msg.task === 'addToQueue' && msg.props) {
            chrome.browserAction.setBadgeText({ text: (Queue.amount < 1000 ? String(Queue.amount) : '999+') });
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

function parseGEO(response, cb) {
  if (!response || typeof response !== 'object') {
    return cb({ error: 'No response', success: null });
  } else {
    if (!('statusCode' in response) || response.statusCode !== 200) {
      if ('errorDetails' in response) {
        return cb({ error: response.errorDetails, success: null });
      }
      return cb({ error: 'Can not parse response', success: null });
    } else {
      if (!('resourceSets' in response) || !Array.isArray(response.resourceSets) ||
       response.resourceSets.length === 0) {
        return cb({ error: 'Can not parse response', success: null });
      } else if (!('resources' in response.resourceSets[0]) || !response.resourceSets[0].estimatedTotal) {
        return cb({ error: 'Nothing found', success: null });
      }
      return cb({ error: null, success: response.resourceSets[0].resources[0] });
    }
  }
}

function parseCoordinates(obj) {
  var info;
  var response = '';
  if (obj.error || !obj.success) {
    return response;
  } else {
    if ('point' in obj.success) {
      info = obj.success.point;
      if ('coordinates' in info) {
        response = {
          latitude: info.coordinates[0],
          longitude: info.coordinates[1]
        };
      }
    }
    if (!response) {
      console.log('API of Bing Locations has changed!');
    }
    return response;
  }
}
