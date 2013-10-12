/**
* Static accesss object with self envocing funktion 
* creates singelton instance of MainController
* @author lars schuettemeyer
*/
var accesss = (function(mainController){
  
  // on DOM ready init main controller
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