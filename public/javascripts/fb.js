window.fbAsyncInit = function() {
  FB.init({
    appId      : '173666146154788',                    // App ID from the app dashboard
    status     : true,                                 // Check Facebook Login status
    cookie     : true,                                 // enable cookies to allow the server to access the session
    xfbml      : true                                  // Look for social plugins on the page
  });
  FB.Event.subscribe('auth.authResponseChange', function(response) {
    if (response.authResponse) {
      testAPI();
    } else {
      console.log('User cancelled login or did not fully authorize.');
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

function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me?fields=id,name,email,friends,user_likes', function(response) {
    $.ajax({
      type: "POST",
      url: "/fbLoginData",
      data: response,
      dataType: 'json'
    });
  });
}

/** for own button 
function fbLogin() {
  FB.login(function(response) {
    if (response.authResponse) {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
      });
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  }, {scope: 'email,user_likes'});
} **/