/**
* Socket-Handler Class
* implents the socket connection to all registered user to
* allow communication between different user clients 
*
* @author lars schuettemeyer
*/
var SocketHandler = function(userId, cb) {
  // for local testing purpose insert local server ip
  var socket = io.connect('http://192.168.1.7');
  // var socket = io.connect('https://accesss.herokuapp.com');
  
  // if new client connects call the server-side function 'adduser' and send 'userID' as parameter
  socket.on('connect', function(){
    socket.emit('adduser', userId);
  });

  // listener, whenever the server emits 'routerequest' use callback funktion to open info-layer
  socket.on('routerequest', function (info) {
    cb(info);
  });

  /**
  * inform the user (id), that a route (info) is requested
  * @param {integer} id - the user id
  * @param {object} info - route and user detail
  */
  this.getRoute = function(id, info) {
    socket.emit('getroute', id, info);
  };
};