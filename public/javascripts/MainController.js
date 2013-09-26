var MainController = function() {

  var directionsDisplay,
      directionsService,
      map,
      routeHandler,
      carSharingHandler,
      geocoder,
      userData,
      searchBoxes = [];

  /**
  * init default configuration for gmaps
  */
  this.init = function() {
    // init maps services
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();

    // init gmaps position e.g. with longlat from hamburg
    var city = new google.maps.LatLng(53.55454, 9.99185); 
    var mapOptions = {
      zoom:15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: city
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    
    // init route service
    routeHandler = new RouteHandler(map, directionsService, directionsDisplay);

    // insert control bar into gmaps
    var control = document.getElementById('control');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    control.style.display = 'block';

    // init auto completion
    searchBoxes[0] = new google.maps.places.SearchBox($('#js_start input')[0]);
    searchBoxes[1] = new google.maps.places.SearchBox($('#js_end input')[0]);

    // register event listener
    _registerListener();
  };

  this.resizeMap = function() {
    google.maps.event.trigger(map, 'resize');
  };

  this.startCarSharingRoute = function() {
    var carPos = carSharingHandler.getCarPos();
    if(carPos) {
      routeHandler.calcRoute('DRIVING', carPos);
      carSharingHandler.removeMarker();
    } else {
      console.log('error: MainController - CarSharing pos not available');
    }
    
  };

  this.setUserData = function(data) {
    userData = data;
    var a = this.userData;
    $('#mainTitle').html("Willkommen " + userData.name);
    routeHandler.setUserData(userData);
  };

  this.setUserImage = function(img) {
    $('#userImage').attr('src', img.data.url);
  };

  var _routeRequest = function(carPos) {
    var selectedMode = $('#mode').val();
    var modeArray = selectedMode.split('-');
    var sharingType;

    if (modeArray.length == 2) {
      selectedMode = modeArray[0];
      sharingType = modeArray[1];
    }

    switch(sharingType) {
      case 'CARSHARING':
        // carsharing singleton, results will be cached. to disable caching create new instance on every request
        carSharingHandler = carSharingHandler || new CarSharingHandler(map, directionsService, directionsDisplay);
        carSharingHandler.init();
        break;
      case 'CARPOOLING':
        routeHandler.matchRoute(_getRoutePoints(), 'CARPOOLING');
        break;
      default:
        routeHandler.calcRoute(selectedMode);
    }  
  };

  var _displayCurrentLocation = function(pos) {
    myLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map
    });
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
  };

  var _getCurLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(_displayCurrentLocation, function(err) {
        console.log("error: maps - geoloaction error");
        console.log(err);
      });
    } else {
      console.log("error: maps - geolocation not supported");
    }
  };

  var _getRoutePoints = function() {
    return {
      start: $('#js_start input').val(),
      end: $('#js_end input').val()
    }
  };

  /**
  * register gmaps event listener for route navigation
  */
  var _registerListener = function() {

    // start route calculation
    $('#js_mode select').on('change', _routeRequest);
    $('#js_end input').on('keypress', function (event) {
      if(event.which == '13'){
        _routeRequest();
      }
    });

    // get geo location from user
    $('#js_geolocation').on('click', _getCurLocation);

    // location based search result
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBoxes[0].setBounds(bounds);
      searchBoxes[1].setBounds(bounds);
    });
  };
};
