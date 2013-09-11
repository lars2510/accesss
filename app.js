
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var cradle = require('cradle');

var app = express();


//set environment variables 
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// configute app
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  console.log('currently in development environment');
  app.use(express.errorHandler());
}

var connection = new(cradle.Connection)('https://accesss.iriscouch.com', 443, {
    auth: { username: 'lars', password: 'test1234' }
});
var db = connection.database('user');

// configure routing
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/user/:id', function(req, res){
    res.send(req.params.id);
});

app.get('/couchtest', function(req, res){
  db.get('lars.meyer@gmail.com', function (err, doc) {
    res.send(doc);
  });
});

/*
db.save('testkey', {
      name: 'A Funny Name'
  }, function (err, res) {
      if (err) {
          // Handle error
          response += ' SAVE ERROR: Could not save record!!\n';
      } else {
          // Handle success
          response += ' SUCESSFUL SAVE\n';
      }
      db.get('testkey', function (err, doc) {
          response += ' DOCUMENT: ' + doc + '\n';
          http_res.end(response);
      });
  });
*/
// create server instance
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
