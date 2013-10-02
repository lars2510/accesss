/**
* Socket Connection for user communication
*/
var io;
var users = [];
var socket = require('socket.io');

module.exports = {
  init: function (server) {
    io = socket.listen(server);
    users = [];

    // configuration only needed for heroku environment
    io.configure(function () { 
      io.set("transports", ["xhr-polling"]); 
      io.set("polling duration", 10); 
    });

    io.sockets.on('connection', function (socket) {

      // when the client emits 'adduser', this listens and executes
      socket.on('adduser', function(userId){
        users[userId] = socket;
        console.log('info: socketHandler - user added: ' + userId);
      });

      socket.on('getroute', function(routeUserId, info){
        if (users[routeUserId]) {
          users[routeUserId].emit('routerequest', info);  
        } else {
          console.log('error: socketHandler - user ' + routeUserId + ' not found')
        }
      });
    });
  }
};