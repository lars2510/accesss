var RouteHandler = function(map, directionsService, directionsDisplay) {
  
  var trafficLayer = new google.maps.TrafficLayer();
  var userId;

  /**
  * calculate gmaps route 
  */
  this.calcRoute = function(selectedMode, carPos) {
    var start = carPos || $('#js_start input').val();
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
    
    directionsService.route(request, function(res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        _showRoute(res);
        if (selectedMode == 'DRIVING') {
          _saveRoute(start, end);
        }
      }
    });
  };

  this.calcRouteWithWaypts = function(waypts) {
    waypts = [
      {
        location:"hamburg, altona",
        stopover:true
      },
      {
        location:"hamburg, hauptbahnhof",
        stopover:true
      }
    ];
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode[selectedMode],
        waypoints: waypts,
        optimizeWaypoints: true
    };
    directionsService.route(request, function(res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        _showRoute(res);
      }
    });
  };

  this.setUserId = function(id) {
    userId = id;
  };

  var _showRoute = function(res) {
    directionsDisplay.setDirections(res);
    $('#js_direction').removeClass('ui-disabled');
  };

  var _saveRoute = function(start, end) {
    if (userId) {
      var routeData = {
        start: start,
        end: end,
        userId: userId,
        resource: 'drivingroute'
      };
      dataService.storeRouteData(routeData);
    } else {
      console.log("error: RouteHandler - user id is not registered")
    }
  };
};