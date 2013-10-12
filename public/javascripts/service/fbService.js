/**
* Facebook SDK implementation
* @author lars schuettemeyer
*/

/**
* Facebook SDK implementation
* Use of recommended Facebook code from https://developers.facebook.com/docs/reference/api/
*/
window.fbAsyncInit = function() {
  FB.init({
    appId      : '173666146154788',
    status     : true,
    cookie     : true,
    xfbml      : true
  });
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    if (response.authResponse) {
      console.log('info: fbService - user is logged in');
      dataService.initUserData(response.authResponse.userID);
    }
  });
};
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/**
* Facebook Login implementation,
* email and user likes are requested on top
*/
$(function() {
  $('#fblogin').on('click', function() {
    FB.login(function(response) {
      if (!response.authResponse) {
        console.warn('error: fbService - user cancelled login or did not fully authorize');
      }
    }, {scope: 'email,user_likes'});
  });
  $('#privateLogin').on('click', function() {
    accesss.initMainPage();
  });
});