/**
* Module Socket-Handler for user communication
*
* @author lars schuettemeyer
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

      // when the client emits 'adduser' the new user will be added to userlist
      socket.on('adduser', function(userId){
        users[userId] = socket;
        console.log('info: socketHandler - user added: ' + userId);
      });

      // when the client emits 'getroute' the new route request will be send to client
      socket.on('getroute', function(routeUserId, info){
        if (users[routeUserId]) {
          users[routeUserId].emit('routerequest', info);  
        } else {
          console.warn('error: socketHandler - user ' + routeUserId + ' not found')
        }
      });
    });
  }
};