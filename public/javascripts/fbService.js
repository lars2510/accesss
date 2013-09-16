fbService = {
  _initMainPage: function(userData) {
    $('#mainTitle').html(userData.name);
    $.mobile.changePage('#bar', { transition: "slide" } );
  },

  _setUserImage: function(imageUrl) {
    debugger;
    $('#mainTitle').html(userData.name);
  },

  _getFbData: function(resource, cb) {
    FB.api('/me' + resource, function(response) {
      if(response.error) {
        console.log(error.message);
      } else {
        cb(response);  
      }  
    });
  },

  _initWithUserData: function(userData) {
    debugger;
    this._initMainPage(userData);
    this._getFbData('/picture?redirect=false', this._setUserImage);
  },

  _getUserDataFromFb: function() {
    this._getFbData('?fields=id,name,email,friends,user_likes', this._storeData);
  },

  _getUserData: function(userId) {
    var that = this;
    $.ajax({
      type: "GET",
      url: "/getFbUserData",
      data: {'userId': userId},
      dataType: 'json'
    }).done(function(userData) {
      userData.length > 0 ? that._initWithUserData(userData) : that._getUserDataFromFb();
    }).fail(function(e){
      console.log('error get user information');
    });
  },

  _storeData: function(userData) {
    console.log('storing user data');
    var that = this;
    $.ajax({
      type: "POST",
      url: "/saveFbUserData",
      data: userData,
      dataType: 'json'
    }).done(function() {
      that._initWithUserData(userData);
    }).fail(function(e){
      console.log('error saving user information');
    });
  },

  _initUser: function(userId) {
    this._getUserData(userId);
  },

  initUserData: function(userId) {
    this._initUser(userId);
  }
};