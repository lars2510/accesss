var SocketConnection = function(userId, cb) {
  //var socket = io.connect('http://192.168.1.2');
  var socket = io.connect('https://accesss.herokuapp.com');
  
  // on connection to server, ask for user's name with an anonymous callback
  socket.on('connect', function(){
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit('adduser', userId);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on('routerequest', function (info) {
    cb(info);
  });

  this.getRoute = function(id, info) {
    socket.emit('getroute', id, info);
  };
};