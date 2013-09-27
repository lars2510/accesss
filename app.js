/** 
* nodejs server configuration
*
* author: lars schuettemeyer 
**/

/**
 * Module dependencies
 */
var express = require('express');
var socket = require('socket.io');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var dbService = require('./service/databaseService');
var app = express();

/** 
* init database connection
* the init function will configure a new couchdb with database and views 
**/
dbService.initConnection('accesss');

/**
* set environment variables
**/
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/**
* configute app
**/
app.configure(function () {
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'Xdce24f1f14fd' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

if ('development' == app.get('env')) {
  console.log('info: app - development environment');
  app.use(express.errorHandler());
}

/**
* configure routing
**/
// index page
app.get('/', routes.index);

/**
* route: get facebook user data from database if user already exists
* @return {object} userObj the user object
*/
app.get('/getUserData/:id', function(req, res){
  dbService.getUserById(req.params.id, res);
});

app.get('/getRouteData/:routeType', function(req, res){
  dbService.getAvailableRoutes(req.params.routeType, res);
});


// save facebook user data to database
app.post('/saveUserData', function(req, res){
  if(req && req.body) {
    dbService.saveUser(req.body, res);
  }
});

// save route data to database
app.post('/saveRouteData', function(req, res){
  if(req && req.body) {
    dbService.saveRoute(req.body, res);
  }
});

/**
* create server instance
**/
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('info: express server stated. listening on port ' + app.get('port'));
});

/**
* Socket Connection for user communication
*/
var io = socket.listen(server);
// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var users = [];
io.sockets.on('connection', function (socket) {

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(userId){
    users[userId] = socket;
    console.log('user added: ' + userId);
  });
  socket.on('getroute', function(routeUserId, info){
    console.log('send to user: ' + routeUserId);
    if (users[routeUserId]) {
      users[routeUserId].emit('routerequest', info);  
    } else {
      console.log('error: user ' + routeUserId + ' not found')
    }
  });
});