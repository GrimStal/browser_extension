/**
 * Created by grimstal on 26.01.17.
 */
var socket_server_address = 'http://localhost:3000/';
var socket = io(socket_server_address);

function socketAuth() {
  var cargo = SMData.getUserData('cargo');
  var lardi = SMData.getUserData('lardi');
  var cargo_login = (SMData.getToken('cargo') ? (cargo.login ? cargo.login : '') : '');
  var lardi_login = (SMData.getToken('lardi') ? (lardi.login ? lardi.login : '') : '');

  socket.emit('authorization', {
    cargo_login: cargo_login,
    lardi_login: lardi_login
  });
}


socket.on('connect', function() {
  socketAuth();
});

socket.on('marketMessage', function(message) {
  console.log('marketMessage received');
  if (SMData.getMarketMessagesAccept()) {
    showMarketNotification(message.title, message.message, message.link);
  }
});