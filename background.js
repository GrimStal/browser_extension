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

if (navigator.userAgent.search(/Chrome/) > -1) {
  chrome.runtime.onMessage.addListener(function (request, uid, callback) {
    sendRequest(request, uid, callback);
    return true;
  });
}
