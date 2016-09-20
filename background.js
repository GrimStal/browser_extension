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
      callback(null, response);
    },

    error: function (error) {
      if (error.status === 200) {
        return callback(null, error.responseText);
      }

      callback(error);
    },
  };

  if (!data || !data.to || (data.to === 'cargo' && !data.url)) {
    return callback('Invalid data to send');
  }

  switch (data.to){
    case 'lardi':
      reqParams.dataType = 'x-www-form-urlencoded';
      reqParams.contentType = 'application/xml';
      reqParams.url = 'https://io-dev.cargo.lt/lardi';
      reqParams.data = data.data;
      break;
    case 'cargo':
      reqParams.dataType = 'json';
      reqParams.contentType = 'application/json';
      reqParams.url = 'https://io-dev.cargo.lt/' + data.url;
      reqParams.data = JSON.stringify(data.data);
      break;
    default:
      return callback('Unknown request target');
  }
  reqParams.type = data.type;
  reqParams.headers = data.headers ? data.headers : {};

  $.ajax(reqParams);
  return true;
}

chrome.runtime.onMessage.addListener(function (request, uid, callback) {
  sendRequest(request, uid, callback);
  return true;
});

console.log('runned');
