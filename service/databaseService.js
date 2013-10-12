/**
* Module to init database connection and process requests
*
* @author lars schuettemeyer
*/
var cradle = require('cradle');
var connection;
var db;

// Database credentials, insert url, port, user and passwort
// var dbUrl = 'https://accesss.iriscouch.com';
// var dbPort = '6984';
var dbUrl = 'http://127.0.0.1';
var dbPort = '5984';
var dbUsername = 'lars';
var dbPassword = 'test1234';


module.exports = {

  /**
  * init connection to database
  * @param {sting} dbName - the database name
  */
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
        console.warn('info: databaseService - database ' + dbName + ' does not exists and will be created');
        db.create();
        self.initViews();
      }
    });
  },


  /**
  * get user info form database
  * @param {string} userName - the user name
  * @param {object} res - result output stream
  */
  getUser: function (userName, res) {
    console.log('info: databaseService - trying to get user data');
  	db.get(userName, function (err, doc) {
      res.send(doc);
	  });
  },

  /**
  * get user by id
  * @param {integer} userId - the user id
  * @param {object} res - result output stream
  */
  getUserById: function(userId, res) {
    console.log('info: databaseService - trying to get user by id');
    db.view('user/byUserId', { key: userId }, function (err, doc) {
      res.send(doc);
    });
  },

  /**
  * get all available routes for a given type
  * @param {string} routeType - the route type
  * @param {object} res - result output stream
  */
  getAvailableRoutes: function(routeType, res) {
    console.log('info: databaseService - trying to get route by type');
    db.view('route/availableRoutes', { key: routeType }, function (err, doc) {
      res.send(doc);
    });
  },

  /**
  * save user data to database
  * @param {object} userObj - the user object
  * @param {object} res - result output stream
  */
  saveUser: function (userObj, res) {
    db.save(userObj.email, {
      name: userObj.name,
      userId: userObj.id,
      picture: userObj.picture.data.url,
      likes: userObj.likes,
      friends: userObj.friends,
      resource: 'user'
    }, function (err, dbres) {
      if (err) {
        console.warn('error: databaseService - could not save record');
        console.log(err);
      } else {
        console.log('info: databaseService - new user successfull saved');
        res.send(userObj);
      }
    });
  },

  /**
  * save route data to database
  * @param {object} routeObj - the route data
  * @param {object} res - result output stream
  */
  saveRoute: function (routeObj, res) {
    db.save(routeObj, function (err, dbres) {
      if (err) {
        console.warn('error: databaseService - could not save route');
        console.log(err);
      } else {
        console.log('info: databaseService - new route successfull saved');
        res.send(routeObj);
      }
    });
  },


  /**
  * init views function will be triggered if new couchdb must be configured
  */
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
    console.log('info: databaseService - new view (byUserId) has been created');

    // create route view to select route by route type
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
    console.log('info: databaseService - new view (availableRoutes) has been created');
  }
};
