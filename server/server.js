/**
 * Created by grimstal on 21.01.17.
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var messages = require('./messages');
var http = require('http').Server(app);


var app = express();
var port = 3000;

function getTime() {
  return moment().format('YYYY-MM-DD, hh:mm:ss');
}

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  req.allParams = function() {
    var params = {};
    if (req.body) {
      Object.keys(req.body).forEach(function(key) {
        params[key] = req.body[key];
      });
    }
    return params;
  }
  next();
});

app.use(function timeLog(req, res, next) {
  console.log(getTime() + ': ' + req.method + ' ' + req.url);
  next();
});

app.use('/message', messages);

app.listen(port, function() {
  console.log('App runned on ' + port + ' port.');
});