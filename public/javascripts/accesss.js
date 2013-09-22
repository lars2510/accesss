var accesss = (function(mapHandler){
  
  google.maps.event.addDomListener(window, 'load', mapHandler.init);
  
  return {
    initMainPage: function(userData) {
      $('#mainTitle').html(userData.name);
      $.mobile.changePage('#mainPage', { transition: 'slide' } );
      $("#myDropdown").attr("selectedIndex", -1);
      this.mapHandler.resizeMap();
    },
    setUserImage: function(img) {
      $('#userImage').attr('src', img.data.url);
    },
    mapHandler: mapHandler
  }
}(new MapHandler()));
