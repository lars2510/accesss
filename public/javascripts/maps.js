var Gmaps = function() {
  var directionsDisplay;
  var directionsService;
  var map;
  var car2goData;
  var markerInfoPopup;
  var selectedCar2GoPos = [];

  /**
  * init default configuration for gmaps
  */
  this.init = function() {
    // init dispay for maps and directions and service for route information
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    markerInfoPopup = new google.maps.InfoWindow();
    
    // init gmaps position, map-canva and direction panel
    var hamburg = new google.maps.LatLng(53.55454, 9.99185);
    var mapOptions = {
      zoom:15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: hamburg
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    
    // insert control bar into gmaps
    var control = document.getElementById('control');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    control.style.display = 'block';

    // init auto completion
    new google.maps.places.SearchBox($('#js_start input')[0]);
    new google.maps.places.SearchBox($('#js_end input')[0]);

    // register event listener
    registerListener();

    // init car to go data
    if(car2goData) {
      initCar2Go(car2goData);
    } else {
      car2goApi.getLocalData('hamburg', initCar2Go);
    };
  };

  var initCar2Go = function(data) {
    car2goData = data;
    var image = 'images/map_pin_car.png';
    var myLatLng;
    _.each(car2goData.placemarks, function(car) {
      if (!(car.interior === 'UNACCEPTABLE' || car.exterior ==='UNACCEPTABLE')) {
        myLatLng = new google.maps.LatLng(car.coordinates[1], car.coordinates[0]);
        var marker = new google.maps.Marker({
              position: myLatLng,
              map: map,
              icon: image
        });
        var infoText = car.address + 
                        '<br />Tank: ' + car.fuel + '%' +
                        '<br />Kennzeichen: ' + car.name + 
                        '<br /><span class="carbook" onClick="accesss.gmaps.startCar2GoRoute();">book now!</span>';
        attachInfoText(marker, infoText);
      }
    });
  };

  var attachInfoText = function(marker, text) {
    google.maps.event.addListener(marker, 'click', function() {
      markerInfoPopup.setContent(text);
      markerInfoPopup.open(map, marker);
      selectedCar2GoPos[0] = marker.position.ob;
      selectedCar2GoPos[1] = marker.position.pb;
    });
    google.maps.event.addListener(markerInfoPopup, 'click', function() {console.log("READY");});
  };

  this.startCar2GoRoute = function(e) {
    debugger;
    console.log(selectedCar2GoPos);
  }

  /**
  * calculate gmaps route 
  */
  var calcRoute = function() {
    var start = $('#js_start input').val();
    var end = $('#js_end input').val();
    var p2start = {
          location:"hamburg, altona",
          stopover:true
    };
    var p2end = {
          location:"hamburg, hauptbahnhof",
          stopover:true
    };
    var waypts = [];
    waypts.push(p2start);
    waypts.push(p2end);

    var selectedMode = document.getElementById('mode').value;
    
    if(selectedMode === 'DRIVING') {
      (new google.maps.TrafficLayer()).setMap(map);
    }

    var request = {
        origin:start,
        destination:end,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[selectedMode]
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response.routes[0].legs[0].distance.text);
      }
    });
  };

  /**
  * register gmaps event listener for route navigation
  */
  var registerListener = function() {
    $('#js_mode select').on('change', calcRoute);
    $('#js_end input').on('keypress', function (event) {
      if(event.which == '13'){
        calcRoute();
      }
    });
  };

}
