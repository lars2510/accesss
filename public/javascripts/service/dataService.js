var dataService = {

  initUserData: function(userId) {
    this._getUserData(userId);
  },

  storeRouteData: function(routeData) {
    $.ajax({
      type: "POST",
      url: "/saveRouteData",
      data: routeData,
      dataType: 'json'
    }).done(function() {
      console.log('info: dataService - route data successful saved')
    }).fail(function(){
      console.log('error: dataService - cant save user information');
    });
  },

  /**
  * Get fb user data from database or facebook
  * @param {int} userId the user id
  */
  _getUserData: function(userId) {
    console.log('info: dataService - getting user data');
    var self = this;
    $.ajax({
      type: 'GET',
      url: '/getUserData/' + userId
    }).done(function(userData) {
      if (userData.length > 0) {
        // user is already in database
        self._initWebsiteData(userData[0].value);
      } else {
        // new user
        self._getUserDataFromFb();
      }
    }).fail(function(e){
      console.log('error: dataService - can not get fb user data');
    });
  },

  _getUserDataFromFb: function() {
    console.log('info: dataService - new user, getting data from facebook')
    this._getFacebookUserData('?fields=id,name,email,friends,user_likes', this._storeUserData);
  },

  _getFacebookUserData: function(resource, cb) {
    var self = this;
    FB.api('/me' + resource, function(response) {
      if(response.error) {
        console.log(response.error.message);
      } else {
        (_.bind(cb, self, response))();
      }  
    });
  },

  _storeUserData: function(userData) {
    console.log('info: dataService - storing user data');
    var self = this;
    $.ajax({
      type: "POST",
      url: "/saveUserData",
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