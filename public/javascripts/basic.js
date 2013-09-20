var accesss = {
  initMainPage: function(userData) {
    this.initHTML(userData);
    this.initMaps();
  },

  initHTML: function(userData) {
    $('#mainTitle').html(userData.name);
    $.mobile.changePage('#mainPage', { transition: 'slide' } );
    $("#myDropdown").attr("selectedIndex", -1);
  },

  initMaps: function() {
    this.gmaps = new Gmaps();
    this.gmaps.init();
  },

  setUserImage: function(img) {
    $('#userImage').attr('src', img.data.url);
  }

};
