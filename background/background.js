'use strict';

var exportQueue = new MQ();
var addQueue = new MQ();

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

if (navigator.userAgent.search(/Gecko/) > -1) {
  chrome.runtime.onMessage.addListener(function (request, uid, callback) {
    sendRequest(request, uid, callback);
    return true;
  });

  chrome.runtime.onConnect.addListener(onConnect);
}
