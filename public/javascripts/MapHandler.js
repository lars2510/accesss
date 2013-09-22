var MapHandler = function() {

  var directionsDisplay,
      directionsService,
      map,
      car2goData,
      geocoder,
      trafficLayer,
      myPosition,
      carSharingHandler,
      searchBoxes = [],
      selectedCar2GoPos = [];

  /**
  * init default configuration for gmaps
  */
  this.init = function() {
    // init maps services
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    trafficLayer = new google.maps.TrafficLayer();
    
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
    searchBoxes[0] = new google.maps.places.SearchBox($('#js_start input')[0]);
    searchBoxes[1] = new google.maps.places.SearchBox($('#js_end input')[0]);

    // register event listener
    registerListener();

  };

  this.resizeMap = function() {
    google.maps.event.trigger(map, 'resize');
  }

  this.startCarSharingRoute = function() {
    console.log(carSharingHandler.getCarPos());
  };

  var routeRequest = function() {    
    var selectedMode = $('#mode').val();
    var sharingType;    
    var modeArray = selectedMode.split('-');

    if (modeArray.length == 2) {
      selectedMode = modeArray[0];
      sharingType = modeArray[1];
    }

    switch(sharingType) {
      case 'CARSHARING':
        carSharingHandler = carSharingHandler || new CarSharingHandler(map, geocoder, directionsService, directionsDisplay);
        if(car2goData) {
          carSharingHandler.initCars(car2goData);
        } else {
          car2goApi.getLocalData('hamburg', carSharingHandler.initCars);
        };
        break;
      case 'CARPOOLING':
        console.log('carpooling');
        break;
      default:
        calcDirection(selectedMode);
    }
    
  };

  /**
  * calculate gmaps route 
  */
  var calcDirection = function(selectedMode, waypts) {
    var start = $('#js_start input').val();
    var end = $('#js_end input').val();

    // add trafic layer if user driving by car
    if(selectedMode === 'DRIVING') {
      trafficLayer.setMap(map);
    } else {
      trafficLayer.setMap(null);
    }

    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode[selectedMode]
    };
    if (waypts && waypts.length) {
      request.waypoints = waypts;
      request.optimizeWaypoints = true;
    }
    
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        $('#js_direction').removeClass('ui-disabled');
      }
    });
  };

  var getRouteWithWaypts = function() {
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
    calcDirection('DRIVING', waypts);
  };

  var displayCurrentLocation = function(pos) {
    console.log(pos.coords.latitude);
    console.log(pos.coords.longitude);
    myLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map
    });
    map.setZoom(16);
    map.setCenter(myLatLng);

    geocoder.geocode({'latLng': myLatLng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $('#js_start input').val(results[0].formatted_address);
        }
      } else {
        console.log("error: maps - geocoder failed due to: " + status);
      }
    });

  }

  var getCurLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(displayCurrentLocation, function(err) {
        console.log("error: maps - geoloaction error");
        console.log(err);
      });
    } else {
      console.log("error: maps - geolocation not supported");
    }
  }

  /**
  * register gmaps event listener for route navigation
  */
  var registerListener = function() {

    // start route calculation
    $('#js_mode select').on('change', routeRequest);
    $('#js_end input').on('keypress', function (event) {
      if(event.which == '13'){
        routeRequest();
      }
    });

    // get geo location from user
    $('#js_geolocation').on('click', getCurLocation);

    // location based search result
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBoxes[0].setBounds(bounds);
      searchBoxes[1].setBounds(bounds);
    });
  };

}
