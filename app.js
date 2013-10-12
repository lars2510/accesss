/** 
* Main Module for nodejs server configuration
*
* @author lars schuettemeyer
*/

/**
 * Module dependencies
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var dbService = require('./service/databaseService');
var socketHandler = require('./socketHandler');
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
app.get('/', routes.index);

/**
* route: get facebook user data from database if user already exists
* @param {integer} id - the user id
*/
app.get('/getUserData/:id', function(req, res){
  dbService.getUserById(req.params.id, res);
});

/**
* route: get route data for a given route type
* @param {string} routeType - the route type
*/
app.get('/getRouteData/:routeType', function(req, res){
  dbService.getAvailableRoutes(req.params.routeType, res);
});

/**
* save facebook user data to database
*/
app.post('/saveUserData', function(req, res){
  if(req && req.body) {
    dbService.saveUser(req.body, res);
  }
});

/**
* save route data to database
*/
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

// init socket handler
socketHandler.init(server);
