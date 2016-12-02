'use strict';

function Request(to, type, url) {
  this.to = to;
  this.url = url;
  this.type = type;
  this.data = {};
  this.headers = {};
};

// function GeoRequest(data) {
//   var request = new Request('geo', 'GET');
//   request.data = data;
//   return request;
// }
//
// function GeoRequest(string) {
//   var request = new Request('geo', 'GET');
//   if (!string) {
//     return false;
//   }
//
//   request.data = {
//     key: 'AopwzhwRqQfWy-zFLEhVu2edSMGC7PpA9LK_vaZ2q4VdUOaxYao1Uj5nTi-OAgPW',
//     includeNeighborhood: 1,
//     include: 'queryParse,ciso2',
//     maxResults: 1,
//     query: string
//   };
//
//   return request;
// }

function MQ() {
  var self = this;
  var init = false;

  this.port = undefined;
  this.queue = $.jqmq();
  this.amount = 0;
  this.errored = 0;
  this.init = function (options) {
    self.queue.update(options);
    init = true;
  };
  this.inited = function () {
    return init;
  };

  return this;
};

var x2js = new X2JS();
