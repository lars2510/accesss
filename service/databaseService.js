/**
* database connection and helper functions
*
* Author: Lars Schüttemeyer
**/
var cradle = require('cradle');
var connection;
var db;

// Database credentials
var //dbUrl = 'https://accesss.iriscouch.com',
    //dbPort = '443',
    dbUrl = 'http://127.0.0.1',
    dbPort = '5984'
		dbUsername = 'lars',
		dbPassword = 'test1234';

module.exports = {
  initConnection: function (dbName) {
    var self = this;
    connection = connection || new(cradle.Connection)(dbUrl, dbPort, {
	    auth: { username: dbUsername, password: dbPassword }
		});
		db = db || connection.database(dbName);

    db.exists(function (err, exists) {
      if (err) {
        console.log('error: databaseService - error on database connection');
      } else if (exists) {
        console.log('info: databaseService - logged in to database: ' + dbName);
      } else {
        console.log('info: databaseService - database ' + dbName + ' does not exists and will be created');
        db.create();
        self.initViews();
      }
    });
  },

  getUser: function (userName, res) {
    console.log('info: databaseService - trying to get user data');
  	db.get(userName, function (err, doc) {
      res.send(doc);
	  });
  },

  getUserById: function(userId, res) {
    console.log('info: databaseService - trying to get user by id');
    db.view('user/byUserId', { key: userId }, function (err, doc) {
      res.send(doc);
    });
  },

  getAvailableRoutes: function(routeType, res) {
    console.log('info: databaseService - trying to get route by type');
    db.view('route/availableRoutes', { key: routeType }, function (err, doc) {
      res.send(doc);
    });
  },

  saveUser: function (userObj, res) {
    db.save(userObj.email, {
      name: userObj.name,
      //likes: userObj.user_likes,
      userId: userObj.id,
      resource: 'user'
    }, function (err, dbres) {
      if (err) {
        console.log('error: databaseService - could not save record');
        console.log(err);
      } else {
        console.log('info: databaseService - new user successfull saved');
        res.send(userObj);
      }
    });
  },

  saveRoute: function (routeObj, res) {
    db.save(routeObj, function (err, dbres) {
      if (err) {
        console.log('error: databaseService - could not save route');
        console.log(err);
      } else {
        console.log('info: databaseService - new route successfull saved');
        res.send(routeObj);
      }
    });
  },

  /** init views function is only need if new couchdb must be configured **/
  initViews: function () {
    // create user view to select user by byUserId
    db.save('_design/user', {
      views: {
        byUserId: {
          map: function (doc) { 
            if (doc.resource === 'user' && doc.userId) {
              emit(doc.userId, doc);
            }
          }
        }
      }
    });
    db.save('_design/route', {
      views: {
        availableRoutes: {
          map: function (doc) { 
            if (doc.resource === 'DRIVING' || doc.resource === 'CARPOOLING') {
              emit(doc.resource, doc);
            }
          }
        }
      }
    });
    console.log('info: databaseService - new view (byUserId) has been created');
  }
};



// db.get(['luke', 'vader'], function (err, doc) { ... });

/*db.merge('luke', {jedi: true}, function (err, res) {
      // Luke is now a jedi,
      // but remains on the dark side of the force.
  });*/

/* db.save('luke', '1-94B6F82', {
      force: 'dark', name: 'Luke'
  }, function (err, res) {
      // Handle response
  }); */
