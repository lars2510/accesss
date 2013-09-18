window.fbAsyncInit = function() {
  FB.init({
    appId      : '173666146154788',                    // App ID from the app dashboard
    status     : true,                                 // Check Facebook Login status
    cookie     : true,                                 // enable cookies to allow the server to access the session
    xfbml      : true                                  // Look for social plugins on the page
  });
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    if (response.authResponse) {
      console.log('info: fb - user is logged in');
      fbService.initUserData(response.authResponse.userID);
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


$('#fblogin').live('click', function(e) {
  FB.login(function(response) {
    if (response.authResponse) {
      console.log('successfully logged in');
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  }, {scope: 'email,user_likes'});
});
