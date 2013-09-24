var RouteHandler = function(map, directionsService, directionsDisplay) {
  
  var trafficLayer = new google.maps.TrafficLayer();
  var matchingRoutes = [];
  var curRouteData;
  var userData;
  var databaseRouteCnt;
  var curRouteCnt;
  var maxDeviation = 20; // maximum deviation for carpooling

  /**
  * calculate gmaps route 
  */
  this.calcRoute = function(routeType, carPos) {
    var routePoints = {
      start: carPos || $('#js_start input').val(),
      end: $('#js_end input').val()
    };
    _processRoute(routePoints, routeType);
  };

  this.matchRoute = function(routePoints, routeType) {
    _processRoute(routePoints, routeType);
  };

  this.setUserData = function(data) {
    userData = data;
  };

  var _findMatchingRoutes = function(curRouteType) {
    // if carpooling log for a driver and vice versa
    var routeType = curRouteType === 'DRIVING' ? 'CARPOOLING' : 'DRIVING';
    dataService.getRouteData(routeType, _filterNearbyRoutes);
  };

  var _filterNearbyRoutes = function(availableRoutes) {
      matchingRoutes = [];
      databaseRouteCnt = availableRoutes.length;
      curRouteCnt = 0;

      _.each(availableRoutes, function(route) {
        _calcRouteWithWaypts(route.value, _evaluateDistance);
      });
  };

  var _evaluateDistance = function(poolingRoute, originRoute) {
    // get total route data including waypoints to pick up or drop off someone
    var routeTotals = _computeSubrouteTotal(poolingRoute);

    // calculate details for longer time and distance due to carpooling
    var poolingDetail = {
      // extended distance in kilometer (rounded)
      extendedDist: parseInt(((routeTotals.distance - originRoute.distance) / 1000) + 0.5),
      // extended time in minutes (rounded)
      extendedTime: parseInt(((routeTotals.time - originRoute.time) / 60) + 0.5),
      // extended distance in percentage (rounded)
      percentDist: parseInt(((1 - originRoute.distance / routeTotals.distance) * 100) + 0.5),
      // extended time in percentage (rounded)
      percentTime: parseInt(((1 - originRoute.time / routeTotals.time) * 100) + 0.5)
    };
    if (poolingDetail.percentDist < maxDeviation) {
      poolingRoute.poolingDetail = poolingDetail;
      matchingRoutes.push(poolingRoute);
    }
    curRouteCnt += 1;
    // every route from database has been evaluated
    if (curRouteCnt === databaseRouteCnt) {
      curRouteCnt = 0;
      databaseRouteCnt = matchingRoutes.length;
      _filterSocialRoutes(matchingRoutes);     
    }
  };

  var _filterSocialRoutes = function(matchingRoutes) {
    dataService.getUserData(matchingRoutes[0].userId, new SocialHandler(_evaluateSocialConnection, 0);)
  };

  var _evaluateSocialConnection = function(routeUserData, pos) {
    // user data for matching route at pos
    matchingRoutes[pos];
    debugger;
  };

  var _computeSubrouteTotal = function(route) {
      var totalDist = 0;
      var totalTime = 0;
      var myroute = route.routes[0];
      _.each(myroute.legs, function(subroute) {
        totalDist += subroute.distance.value;
        totalTime += subroute.duration.value;      
      });
      return {
        distance: totalDist,
        time: totalTime
      };
  };

  /**
  * Carpooling calculation with waypoints where rider would could be picked up
  */
  var _calcRouteWithWaypts = function(route, cb) {
    
    var start, wp1, wp2, end;

    // parse database result to int
    route.distance = parseInt(route.distance);
    route.time = parseInt(route.time);

    if (curRouteData.resource === 'DRIVING') {
      // user is driver, his current route is start and end
      start = curRouteData.start;
      end = curRouteData.end;
      wp1 = route.start;
      wp2 = route.end;
    } else if (curRouteData.resource === 'CARPOOLING') {
      // user is carpooler, his current route is waypoint one and two
      start = route.start;
      end = route.end;
      wp1 = curRouteData.start;
      wp2 = curRouteData.end;
    }
    var waypts = [{
        location:wp1,
        stopover:true
      },{
        location:wp2,
        stopover:true
      }];
    var request = {
        origin:start,
        destination:end,
        travelMode: 'DRIVING',
        waypoints: waypts,
        optimizeWaypoints: true
    };
    directionsService.route(request, function(res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        res.userId = route.userId;
        cb(res, route);
      }
    });
  };

  var _showRoute = function(res) {
    directionsDisplay.setDirections(res);
    $('#js_direction').removeClass('ui-disabled');
  };

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
        }
        if (routeType === 'DRIVING' || routeType === 'CARPOOLING') {
          _saveRoute(routePoints, routeType, res);
        }
        if (routeType === 'CARPOOLING' && curRouteData) {
          _findMatchingRoutes(routeType);  
        }
      }
    });
  };

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

};