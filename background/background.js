'use strict';

var exportQueue = new MQ();
var addQueue = new MQ();
var exportProgressNotificationId;
var updateNotificationId;
var GCMIds = ["896628471556"];
var GCM_server_address = 'http://localhost:3000/';
var socket = io(GCM_server_address);

exportQueue.init({
  delay: -1,
  batch: 5,
  callback: exportCargoBatch.bind(exportQueue),
  complete: exportComplete.bind(exportQueue)
});

addQueue.init({
  delay: -1,
  batch: 2,
  callback: addCargoBatch.bind(addQueue),
  complete: addComplete.bind(addQueue)
});


//Update available message
if (!isFirefox() || (isFirefox() && navigator.userAgent.match(/Firefox\/([0-9]+\.[0-9]*)/)[1] >= '51')) {
  chrome.runtime.onUpdateAvailable.addListener(function(details) {
    return showUpdateNotification(details.version);
  });
}

//On istalled, updated and Chrome updated event
if (!isFirefox() || (isFirefox() && navigator.userAgent.match(/Firefox\/([0-9]+\.[0-9]*)/)[1] >= '52')) {
  chrome.runtime.onInstalled.addListener(function(details) {
    switch (details.reason) {
      case 'install':
        SMData.setMarketMessagesAccept(true);
        SMData.setSystemMessagesAccept(true);
        break;
      case 'update':
        //variables were not in previous versions but have to be set on default after update
        if (details.previousVersion < '1.1.5') {
          SMData.setMarketMessagesAccept(true);
          SMData.setSystemMessagesAccept(true);
        }
        break;
      default:
        break;
    }
  });
} else {
  //TODO remove on next version
  SMData.setMarketMessagesAccept(true);
  SMData.setSystemMessagesAccept(true);
}

chrome.runtime.onMessage.addListener(function(request, uid, callback) {
  sendRequest(request, uid, callback);
  return true;
});

chrome.runtime.onConnect.addListener(onConnect);
chrome.runtime.onConnect.addListener(onSystemConnect);

setInterval(lardiExportWatcher, 30000);

/** GCM */
/**
if (!isFirefox()) {
  if (SMData.getMarketMessagesAccept()) {
    chrome.gcm.register(GCMIds, registerCallback);
  }
  listenForGCM();
}
 */

