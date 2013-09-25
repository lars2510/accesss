var dataService = {

  initUserData: function(userId) {
    this.getUserData(userId);
  },

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
      console.log('error: dataService - cant save ' + routeData.resource + ' information');
    });
  },

  getRouteData: function(routeType, cb) {
    var requestUrl = '/getRouteData/' + routeType;
    $.ajax({
      type: 'GET',
      url: requestUrl
    }).done(function(routeData) {
      cb(routeData);
    }).fail(function(){
      console.log('error: dataService - cant get ' + routeData.resource + ' information');
    });
  },

  /**
  * Get fb user data from database or facebook
  * @param {int} userId the user id
  */
  getUserData: function(userId, cb) {
    console.log('info: dataService - getting user data');
    var self = this;
    $.ajax({
      type: 'GET',
      url: '/getUserData/' + userId
    }).done(function(userData) {
      // user is already in database
      if (userData.length > 0) {
        if (cb) {
          cb(userData[0].value);  
        } else {
          self._initWebsiteData(userData[0].value);
        }
      // new user  
      } else {
        self._getUserDataFromFb();
      }
    }).fail(function(e){
      console.log('error: dataService - can not get fb user data');
    });
  },

  _getUserDataFromFb: function() {
    console.log('info: dataService - new user, getting data from facebook')
    this._getFacebookUserData('?fields=id,name,email,link,cover,picture,friends,likes', this._storeUserData);
  },

  _getFacebookUserData: function(resource, cb) {
    var self = this;
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

  _storeUserData: function(userData) {
    console.log('info: dataService - storing user data');
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/saveUserData',
      data: userData,
      dataType: 'json'
    }).done(function() {
      self._initWebsiteData(userData);
    }).fail(function(){
      console.log('error: dataService - cant save user information');
    });
  },

  _initWebsiteData: function(userData) {
    accesss.initMainPage(userData);
    //this._getFbData('/picture?redirect=false', accesss.setUserImage);
  }
};