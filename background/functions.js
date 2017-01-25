'use strict';

/** Requests */

function sendRequest(data, uid, callback) {
  var reqParams = {
    url: '',
    type: '',
    data: '',
    crossDomain: true,
    dataType: '',
    contentType: '',
    headers: {},
    success: function(response) {
      callback({error: null, success: response});
    },

    error: function(error) {
      if (error.status === 200) {
        return callback({error: null, success: error.responseText});
      }

      callback({error: error, success: null});
    },
  };

  if (!data || !data.to || (data.to === 'cargo' && !data.url)) {
    return callback({error: 'Invalid data to send', success: null});
  }

  reqParams.type = data.type;
  reqParams.headers = data.headers ? data.headers : {};

  switch (data.to) {
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
    default:
      console.log(reqParams);
  }

  $.ajax(reqParams);
}

function sendToServer(req) {
  var result = $.Deferred();

  sendRequest(req, null, function(response) {
    if (response.error) {
      return result.reject(response.error);
    }

    return result.resolve(response.success);
  });

  return result.promise();
};

function onConnect(port) {
  var Queue;

  switch (port.name) {
    case 'export':
      Queue = exportQueue;
      break;
    case 'add':
      Queue = addQueue;
      break;
    default:
      return false;
  }

  Queue.port = port;

  port.onMessage.addListener(function(msg) {
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
          Queue.port.postMessage({error: 'Incorrect data'});
        }
        Queue.amount = Queue.queue.size();
        showProgressNotification();
        Queue.queue.start();
      } else if (msg.task === 'disconnect') {
        Queue.port.disconnect();
      }

      if (port.name === 'export') {
        if (msg.task === 'exportEnabled') {
          port.postMessage({done: Queue.queue.size() === 0});
        }
        if (msg.task === 'addToQueue' && msg.props) {
          chrome.browserAction.setBadgeText({text: (Queue.amount < 1000 ? String(Queue.amount) : '999+')});
        }
      }

    }
  });

  port.onDisconnect.addListener(function(event) {
    Queue.port = undefined;
  });
}

function onSystemConnect(port) {
  var System = {};

  switch (port.name) {
    case 'system':
      System.port = port;
      break;
    default:
      return false;
  }

  port.onMessage.addListener(function(msg) {
    if (!msg || typeof msg !== 'object' || !msg.task) {
      console.log('not valid message');
      return false;
    }

    if (System.port) {

      switch (msg.task) {
        case 'showTestNotification':
          showTestNotification();
          break;
        case 'disconnect':
          System.port.disconnect();
          break;
        case 'disableMarketNotifications':
          unregisterGCM();
          break;
        case 'enableMarketNotifications':
          chrome.gcm.register(GCMIds, registerCallback);
          break;
        default:
          console.log('Unknown task: ' + msg.task);
          return false;
      }
    }
  });

  port.onDisconnect.addListener(function(event) {
    System.port = undefined;
  });
}

function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}

function isOpera() {
  return !!(~navigator.userAgent.indexOf('OPR/'));
}

function isFirefox() {
  return !!(~navigator.userAgent.indexOf('Firefox/'));
}


/**
 * Notifications
 */

function showNotification(title, message) {
  if (SMData.getSystemMessagesAccept()) {
    return chrome.notifications.create(new BasicNotification(title, message));
  }
}

function showMarketNotification(title, message, link) {
  if (SMData.getMarketMessagesAccept()) {
    return chrome.notifications.create(new BasicNotification(title, message  + (link ? '\n' + link : '')), function(createdId) {
      if (link) {
        chrome.notifications.onClicked.addListener(function(notificationId) {
          if (createdId === notificationId) {
           chrome.tabs.create({ url: link, active: true });
          }
        });
      }
    });
  }
}

function showProgressNotification() {
  if (SMData.getSystemMessagesAccept() && !isOpera()) {
    return chrome.notifications.create(new ProgressNotification(), function(notificationId) {
      exportProgressNotificationId = notificationId;
    });
  }
}

function updateProgressNotification(currentSize, amount) {
  var updateData = new Object();
  if (SMData.getSystemMessagesAccept() && !isOpera() && amount - currentSize) {
    updateData.message = 'Экспортировано ' + (amount - currentSize) + ' из ' + amount;
    updateData.progress = Math.round((amount - currentSize) * 100 / amount);
    return chrome.notifications.update(exportProgressNotificationId, updateData);
  }
}

function showUpdateNotification(version) {
  function reloadApp() {
    if (!addQueue.queue.size() && !exportQueue.queue.size()) {
      if (chrome.runtime.reload) {
        chrome.runtime.reload();
      } else {
        chrome.runtime.restart();
      }
    } else {
      return setTimeout(reloadApp, 60000);
    }
  }

  return chrome.notifications.create(new UpdateNotification(version), function(updateNotificationId) {
    if (!isOpera()) {
      chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
        if (updateNotificationId === notificationId) {
          if (buttonIndex) {
            removeNotification(notificationId);
          } else {
            reloadApp();
          }
        }
      });
    }
  });
}

function showNewCargosNotification(amount) {
  if (SMData.getSystemMessagesAccept()) {
    return chrome.notifications.create(new newCargosNotification(amount), function(newCargoNotificationId) {
      if (!isOpera()) {
        chrome.notifications.onButtonClicked.addListener(function(notificationId) {
          if (newCargoNotificationId === notificationId) {
            chrome.browserAction.openPopup();
          }
        });
      }
    });
  }
}

function showTestNotification() {
  return chrome.notifications.create(new testNotification());
}


function removeNotification(id) {
  return chrome.notifications.clear(id);
}


/** GCM */
function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    console.log(chrome.runtime.lastError);
    return setTimeout(
        function() {
          return unregisterGCM();
        },
        60000);
  }

  // Send the registration token to your application server.
  sendRegistrationId(registrationId, function(error, succeed) {
    // Once the registration token is received by your server,
    // set the flag such that register will not be invoked
    // next time when the app starts up.
    if (succeed) {
      SMData.saveGCMToken(registrationId);
      return SMData.saveGCMRegistered();
    }
    console.log(error);
  });
}

function sendRegistrationId(id, callback) {
  // Send the registration token to your application server
  // in a secure way.
  console.log(id);
  $.ajax({
    url: GCM_server_address + 'message/subscribe',
    type: 'POST',
    data: {
      id: id
    }
  })
      .then(function() {
        return callback(null, true)
      })
      .catch(function(res) {
        return callback(res.error);
      });
}

function unregisterCallback() {
  if (chrome.runtime.lastError) {
    // When the unregistration fails, handle the error and retry
    // the unregistration later.
    return setTimeout(function() {
      return unregisterGCM();
    }, 60000);
  }
}

function unregisterGCM() {
  chrome.gcm.unregister(unregisterCallback);
}

function listenForGCM() {
  function listen(message) {
    // A message is an object with a data property that
    // consists of key-value pairs.
    showMarketNotification(message.data.title, message.data.body, message.data.link);
  }
  chrome.gcm.onMessage.addListener(listen);
}
