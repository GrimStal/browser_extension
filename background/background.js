'use strict';

var exportQueue = new MQ();
var addQueue = new MQ();
var exportProgressNotificationId;
var updateNotificationId;
var GCMIds = ["896628471556"];

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
chrome.runtime.onUpdateAvailable.addListener(function(details) {
  return showUpdateNotification(details.version);
});

//On istalled, updated and Chrome updated event
chrome.runtime.onInstalled.addListener(function(details) {
  switch (deatails.reason) {
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
  if (details.reason === 'install') {
    SMData.setMarketMessagesAccept(true);
    SMData.setSystemMessagesAccept(true);
  }
});

chrome.runtime.onMessage.addListener(function(request, uid, callback) {
  sendRequest(request, uid, callback);
  return true;
});

chrome.runtime.onConnect.addListener(onConnect);
chrome.runtime.onConnect.addListener(onSystemConnect);

//GCM
chrome.runtime.onStartup.addListener(function() {
  // var registered = SMData.isGCMRegistered();
  // if (registered) {
  //   return;
  // }
  //
  // chrome.gcm.register(senderIds, registerCallback);
});

setInterval(function() {
  if (SMData.getSystemMessagesAccept()) {
    if (!exportQueue.queue.size()) {
      checkCargosForExport()
          .then(function(cargos) {
            showNewCargosNotification(cargos.filter(filterCargos).length)
          })
          .catch(function(err) {
            console.log(err);
          });
    }
  }
}, 1800000);

