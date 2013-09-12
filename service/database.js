/**
* database connection and helper functions
*
* Author: Lars Schüttemeyer
**/
var cradle = require('cradle'),
		dbUrl = 'https://accesss.iriscouch.com',
		dbUsername = 'lars',
		dbPassword = 'test1234',
		connection,
		db;

module.exports = {
  init: function (dbName) {
    connection = connection || new(cradle.Connection)(dbUrl, 443, {
	    auth: { username: dbUsername, password: dbPassword }
		});
		db = db || connection.database(dbName);
  },

  getUser: function (userName, res) {
  	db.get(userName, function (err, doc) {
	  	res.send(doc.bday);
	  });
  }
};

var getView = function () {
	db.view('user/byUsername', { key: ['lars', 'oktober'] }, function (err, doc) {
     console.dir(doc);
  });
}

var saveView = function () {
	db.save('_design/user', {
    views: {
      byUsername: {
        map: function (doc) { 
          if (doc.resource === 'user' && doc.name) {
            var key = [doc.name, doc.bday];
            emit(key, doc);
          }
        }
      }
    }
  });
}


// db.get(['luke', 'vader'], function (err, doc) { ... });

/*db.merge('luke', {jedi: true}, function (err, res) {
      // Luke is now a jedi,
      // but remains on the dark side of the force.
  });*/

/* db.save('luke', '1-94B6F82', {
      force: 'dark', name: 'Luke'
  }, function (err, res) {
      // Handle response
  }); +/

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