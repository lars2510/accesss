var accesss = {

  initMainPage: function(userData) {
    $('#mainTitle').html(userData.name);
    $.mobile.changePage('#bar', { transition: 'slide' } );
  },

  setUserImage: function(img) {
    $('#userImage').attr('src', img.data.url);
  }

};