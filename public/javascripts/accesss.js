var accesss = (function(mainController){
  
  google.maps.event.addDomListener(window, 'load', mainController.init);

  return {
    initMainPage: function(userData) {
      $('#mainPage').on('pageshow',function(){
        mainController.resizeMap();
      });
      $.mobile.changePage('#mainPage', {transition: 'slide'});
      if (userData) {
        mainController.setUserData(userData);
      }
    },
    mainController: mainController
  }
}(new MainController()));