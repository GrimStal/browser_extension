'use strict';

var Request = function (to, type, url) {
  this.to = to;
  this.url = url;
  this.type = type;
  this.data = {};
  this.headers = {};
};

var MQ = function () {
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
