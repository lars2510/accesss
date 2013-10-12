/**
* Route-Handler Class
* Calculate, display and save different route types
* @author lars schuettemeyer
*/
var RouteHandler = function(map, directionsService, directionsDisplay) {
  
  var trafficLayer = new google.maps.TrafficLayer(),
      carSharingHandler,
      carPoolingHandler,
      userData,
      con;

  /**
  * calculate carpooling route with waypoints
  * @param {object} data - the user data
  */
  this.setUserData = function(data) {
    userData = data;
    // build socket connection to route user, an callback function if route is requested
    con = new SocketHandler(userData.userId, _showRequestedRoute);
  };

  /**
  * calculate route or start carSharing / carPooling process
  */
  this.routeRequest = function() {
    var selectedMode = $('#mode').val();
    var modeArray = selectedMode.split('-');
    var sharingType;

    if (modeArray.length == 2) {
      selectedMode = modeArray[0];
      sharingType = modeArray[1];
    }

    if (carSharingHandler) {
      carSharingHandler.removeMarker();
    }

    switch(sharingType) {
      case 'CARSHARING':
        // carsharing singleton, object will be created only once per session
        carSharingHandler = carSharingHandler || new CarSharingHandler(map, directionsService, directionsDisplay);
        carSharingHandler.init();
        break;
      case 'CARPOOLING':
        // carpooling singleton, object will be created only once per session
        carPoolingHandler = carPoolingHandler || new CarPoolingHandler(con, directionsService, directionsDisplay);
        this.calcRoute(sharingType);
        break;
      default:
        this.calcRoute(selectedMode);
    }  
  };

  /**
  * calculate route wrapper
  * @param {object} routeType - the route type
  */
  this.calcRoute = function(routeType) {
    var routePoints = _getRoutePoints();
    _processRoute(routePoints, routeType);
  };

  /**
  * calculate car sharing route
  */
  this.calcCarSharingRoute = function() {
    var routePoints = _getRoutePoints();
    var carPos = carSharingHandler.getCarPos();
    if(carPos) {
      routePoints.start = carPos;
      _processRoute(routePoints, 'DRIVING');
    } else {
      console.warn('error: RouteHandler - CarSharing pos not available');
    }
    carSharingHandler.removeMarker();
  };

  /**
  * show the requested route on the map
  * @param {object} info - the route data
  */
  var _showRequestedRoute = function(info) {
    if (carPoolingHandler) {
      carPoolingHandler.showRequestedRoute(info);
    } else {
      (new CarPoolingHandler(con, directionsService, directionsDisplay)).showRequestedRoute(info);
    } 
  };

  /**
  * calculate gmaps route and process the data
  * @param {object} routePoints - the route points
  * @param {string} routeType - the route type
  */
  var _processRoute = function(routePoints, routeType) {
    // add trafic layer if user driving by car
    if(routeType === 'DRIVING') {
      trafficLayer.setMap(map);
    } else {
      trafficLayer.setMap(null);
    }
    var mode = routeType === 'CARPOOLING' ? 'DRIVING' : routeType;
    var request = {
        origin:routePoints.start,
        destination:routePoints.end,
        travelMode: google.maps.TravelMode[mode]
    };
    
    directionsService.route(request, function(res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        if (routeType !== 'CARPOOLING') {
          _showRoute(res);
          _showRouteInfo(res);
        }
        if (routeType === 'DRIVING' || routeType === 'CARPOOLING') {
          _saveRoute(routePoints, routeType, res);
        }
        if (routeType === 'CARPOOLING' && curRouteData && userData) {
          carPoolingHandler.init(userData, curRouteData);
          carPoolingHandler.findMatchingRoutes(routeType);  
        }
      }
    });
  };

  /**
  * set route points from dom data
  */
  var _getRoutePoints = function() {
    return {
      start: $('#js_start input').val(),
      end: $('#js_end input').val()
    }
  };

  /**
  * show directions on the map
  * @param {object} res - gmaps route object
  */
  var _showRoute = function(res) {
    directionsDisplay.setDirections(res);
    $('#js_direction').removeClass('ui-disabled');
  };

  /**
  * save route to database
  * @param {object} routePoints - the start and end points
  * @param {object} selectedMode - the route mode
  * @param {object} routeRes - the gmaps route result
  */
  var _saveRoute = function(routePoints, selectedMode, routeRes) {
    var time = routeRes.routes[0].legs[0].duration.value;
    var distance = routeRes.routes[0].legs[0].distance.value;

    if (userData.userId && routePoints.start != '' && routePoints.end != '') {
      curRouteData = {
        start: routePoints.start,
        end: routePoints.end,
        userId: userData.userId,
        resource: selectedMode,
        time: time,
        distance: distance
      };
      dataService.storeRouteData(curRouteData);
    } else {
      console.warn('error: RouteHandler - route data is missing')
    }
  };

  /**
  * calc and show route info
  * @param {object} response - the gmaps route data
  */
  var _showRouteInfo = function(response) {
    var km = (response.routes[0].legs[0].distance.value / 1000).toFixed(1) + " km"; 
    var min = (response.routes[0].legs[0].duration.value / 60 + 0.5).toFixed(0) + " min";
    $('#js_carinfo').html('Die Strecke beträgt ' + km + ' (' + min + ')');
  }

};