
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var dbHandler = require('./service/database');

// init app and db connection
var app = express();
dbHandler.init('user');

//set environment variables 
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// configute app
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

// development only
if ('development' == app.get('env')) {
  console.log('currently in development environment');
  app.use(express.errorHandler());
}

// configure routing
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/user/:id', function(req, res){
  res.send(req.params.id);
});
app.get('/couchtest', function(req, res){
  dbHandler.getUser("lars.meyer@gmail.com", res);
});
app.get('/getFbUserData', function(req, res){
  
  if (req.query && req.query.userId) {
    dbHandler.getUser(req.query.userId, res);
    //dbHandler.getUser("lars.meyer@gmail.com", res);
  } 
});
app.post('/saveFbUserData', function(req, res){
  if(req && req.body) {
    // eventuell noch geoposition der nutzer erfragen und alle aktiven auf karte anzeigen
    console.log('user wird gespeichert');
    // dbHandler.setUser(req.body);
  }
});

// create server instance
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
