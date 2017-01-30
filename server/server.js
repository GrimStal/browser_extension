/**
 * Created by grimstal on 21.01.17.
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;
var userPool = [];
var notificationsPool = [];

function getTime() {
  return moment().format('YYYY-MM-DD, hh:mm:ss');
}

function findById(id, array) {
  var result;
  array.forEach(function(el, index) {
    if (el.id === id) {
      result = array[index];
    }
  });
  return result;
}

function removeUser(socketId) {
  userPool.forEach(function(user, index) {
    if (user.id === socketId) {
      userPool.splice(index, 1);
    }
  });
}

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/assets/js'));

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
  res.locals.header_scripts = [
    '/src/socket.io-1.4.5.js',
    '/src/vue.min.js'
  ];
  next();
});

app.use(function timeLog(req, res, next) {
  console.log(getTime() + ': ' + req.method + ' ' + req.url);
  next();
});

app.get('/online', function(req, res) {
  res.locals.scripts = ['/online.js'];
  res.render('message');
});

http.listen(port, function() {
  console.log('App runned on ' + port + ' port.');
});

io.sockets.on('connection', function(socket) {
  socket.on('joinAdmins', function(props) {
    if (props.login && props.password) {
      if (props.login === 'admin' && props.password === 'admin') {
        socket.leave('users');
        socket.join('admins');

        socket.on('marketMessage', function(message) {
          var postedMessage = {
            title: message.title,
            message: message.message,
            link: message.link
          };
          message.selectedRooms.forEach(function(room) {
            var sendingData = JSON.parse(JSON.stringify(postedMessage));
            io.sockets.to(room).emit('marketMessage', postedMessage);
            sendingData.to = room;
            notificationsPool.push(sendingData);
            io.sockets.to('admins').emit('chat', notificationsPool);
          });
        });

        socket.on('watchUsers', function() {
          io.sockets.to('admins').emit('usersOnline', userPool);
        });

        socket.on('getChat', function() {
          io.sockets.to('admins').emit('chat', notificationsPool);
        });
      }
    }
  });

  socket.on('disconnect', function() {
    removeUser(socket.id);
    io.sockets.to('admins').emit('usersOnline', userPool);
  });

  socket.on('authorization', function(message) {
    console.log('user has been connected');
    var user = findById(socket.id, userPool);
    if (user) {
      if (!message.cargo_login || !message.lardi_login) {
        removeUser(socket.id);
        socket.leave('users');
      } else {
        user.lardi_login = message.lardi_login;
        user.cargo_login = message.cargo_login;
        socket.join('users');
      }

    } else {
      if (message.cargo_login && message.lardi_login) {
        userPool.push({
          lardi_login: message.lardi_login,
          cargo_login: message.cargo_login,
          id: socket.id
        });
        socket.join('users');
      }
    }
    socket.broadcast.to('admins').emit('usersOnline', userPool);
  });
});

