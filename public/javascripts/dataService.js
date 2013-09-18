var fbService = {

  initUserData: function(userId) {
    this._getUserData(userId);
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
      url: '/getFbUserData',
      data: {id: userId},
      dataType: 'json'
    }).done(function(userData) {
      if (userData.length > 0) {
        self._initAccesssWebsite(userData[0].value)
      } else {
        self._getUserDataFromFb()
      }
    }).fail(function(e){
      console.log('error: dataService - can not get fb user data');
    });
  },

  _storeData: function(userData) {
    console.log('info: dataService - storing user data');
    var self = this;
    $.ajax({
      type: "POST",
      url: "/saveFbUserData",
      data: userData,
      dataType: 'json'
    }).done(function() {
      self._initAccesssWebsite(userData);
    }).fail(function(e){
      console.log('error: dataService - cant save user information');
    });
  },

  _initAccesssWebsite: function(userData) {
    accesss.initMainPage(userData);
    this._getFbData('/picture?redirect=false', accesss.setUserImage);
  },

  _getUserDataFromFb: function() {
    console.log('info: dataService - new user, getting data from facebook')
    this._getFbData('?fields=id,name,email,friends,user_likes', this._storeData);
  },

  _getFbData: function(resource, cb) {
    var self = this;
    FB.api('/me' + resource, function(response) {
      if(response.error) {
        console.log(error.message);
      } else {
        (_.bind(cb, self, response))();
      }  
    });
  }
};