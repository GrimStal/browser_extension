/**
 * Created by grimstal on 26.01.17.
 */
'use strict';
// var socket = new io('http://localhost:3000');

new Vue({
  el: '#chat',
  data: {
    users: [],
    socket: new io('http://localhost:3000/'),
    message: {
      title: '',
      message: '',
      link: '',
      selectedRooms: ['users']
    },
    chat: []
  },
  computed: {
    usersSelect: function() {
      return [{id: 'users', cargo_login: 'Все', lardi_login: 'пользователи'}].concat(this.users);
    }
  },
  mounted: function() {
    var self = this;
    var chat = document.getElementById("chat-message-holder");

    chat.scrollTop = chat.scrollHeight;

    this.socket.on('connect', function() {
      self.socket.emit('joinAdmins', {login: 'admin', password: 'admin'});
      self.socket.emit('watchUsers');
      self.socket.emit('getChat');
    });
    this.socket.on('usersOnline', function(props) {
      self.$set(self, 'users', props);
    });
    this.socket.on('chat', function(chat) {
      self.$set(self, 'chat', chat);
    });
  },
  methods: {
    send: function() {
      if (this.socket.connected) {
        return this.socket.emit('marketMessage', this.message);
      }
      return setTimeout(this.send, 3000);
    }
  }
});