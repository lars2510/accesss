/**
* data service to process data requests to couchdb and facebook api
* @author lars schuettemeyer
*/
var dataService = {

  /**
  * init app with user data
  * @param {string} userId
  */
  initUserData: function(userId) {
    this.getUserData(userId);
  },

  /**
  * store the route data object
  * @param {object} routeData
  */
  storeRouteData: function(routeData) {
    var requestUrl = '/saveRouteData';
    $.ajax({
      type: 'POST',
      url: requestUrl,
      data: routeData,
      dataType: 'json'
    }).done(function() {
      console.log('info: dataService - route type: ' + routeData.resource + ' successful saved')
    }).fail(function(){
      console.warn('error: dataService - cant save ' + routeData.resource + ' information');
    });
  },

  /**
  * get route data object
  * @param {string} routeType - type of route, e.g. DRIVING
  * @param {function} cb - the callback function
  */
  getRouteData: function(routeType, cb) {
    var requestUrl = '/getRouteData/' + routeType;
    $.ajax({
      type: 'GET',
      url: requestUrl
    }).done(function(routeData) {
      cb(routeData);
    }).fail(function(){
      console.warn('error: dataService - cant get ' + routeData.resource + ' information');
    });
  },

  /**
  * Get fb user data from database or facebook
  * @param {int} userId the user id
  */
  getUserData: function(userId, cb) {
    var self = this;
    $.ajax({
      type: 'GET',
      url: '/getUserData/' + userId
    }).done(function(userData) {
      if (userData.length > 0) {
      // user is alreasy in database
        if (cb) {
          cb(userData[0].value);  
        } else {
          self._initWebsiteData(userData[0].value);
        }
      } else {
        // new user, get id, name, email, link, cover, picture, friends, likes from fb
        self._getUserDataFromFb('?fields=id,name,email,link,cover,picture,friends,likes', self._storeUserData);
      }
    }).fail(function(e){
      console.warn('error: dataService - can not get fb user data');
    });
  },

  /**
  * get new fb user data
  * @param {string} resource - the requested recouces
  * @param {function} cb - the callback function
  */
  _getFacebookUserData: function(resource, cb) {
    var self = this;
    
    console.log('info: dataService - new user, getting data from facebook')
    // use facebook api to get accesss user details
    FB.api('/me' + resource, function(response) {
      if(response.error) {
        console.log(response.error.message);
      } else {
        // callback function is invoked with response parameter (self envoking function)
        // explicit self context must be set, else context would be faceook api
        (_.bind(cb, self, response))();
      }  
    });
  },

  /**
  * store the user data
  * @param {object} userData - the user data object
  */
  _storeUserData: function(userData) {
    console.log('info: dataService - storing user data');
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/saveUserData',
      data: userData,
      dataType: 'json'
    }).done(function() {
      userData.userId = userData.id;
      self._initWebsiteData(userData);
    }).fail(function(){
      console.warn('error: dataService - cant save user information');
    });
  },

  /**
  * init website with user data
  * @param {object} userData - the user data
  */
  _initWebsiteData: function(userData) {
    accesss.initMainPage(userData);
  }
};