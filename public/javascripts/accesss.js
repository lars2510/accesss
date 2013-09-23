var accesss = (function(mainController){
  
  google.maps.event.addDomListener(window, 'load', mainController.init);

  return {
    initMainPage: function(userData) {
      $.mobile.changePage('#mainPage', {transition: 'slide'});
      mainController.resizeMap();
      mainController.setUserData(userData);
    },
    mainController: mainController
  }
}(new MainController()));
