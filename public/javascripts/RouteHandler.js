var RouteHandler = function(map, directionsService, directionsDisplay) {
  
  var trafficLayer = new google.maps.TrafficLayer();
  var matchingRoutes = [];
  var matchingRoutesCnt = 0;
  var curRouteCnt = 0;
  var curRouteData;
  var userData;
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
      matchingRoutesCnt = availableRoutes.length;
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
    if (curRouteCnt === matchingRoutesCnt) {
      curRouteCnt = 0;
      matchingRoutesCnt = matchingRoutes.length;
      _filterSocialRoutes(matchingRoutes);     
    }
  };

  var _filterSocialRoutes = function(matchingRoutes) {
    _.each(matchingRoutes, function(route, pos) {
      // get social user data
      // due to asynchronous database request, the callback function params where wrapped in a closure
      dataService.getUserData(route.userId, _.bind(_evaluateSocialConnection, this, pos));
    });
  };

  var _evaluateSocialConnection = function(pos, routeUserData) {
    if (userData.userId !== routeUserData.userId) {
      var relationship = {};
      relationship.userData = routeUserData;

      // direct friend
      relationship.friend = _.filter(routeUserData.friends.data, function(friend) {
        return userData.userId === friend.id;
      });

      // friends in common
      var commonFriends = [];
      _.each(routeUserData.friends.data, function(routeFriend) {
        _.each(userData.friends.data, function(myFriend) {
          if (myFriend.id === routeFriend.id) {
            commonFriends.push(routeFriend.name);
          };
        });
      });
      relationship.commonFriends = commonFriends;
      matchingRoutes[pos].relationship = relationship;
    } else {
      matchingRoutes.splice(pos, 1);
    }
    curRouteCnt += 1;
    // every route from database was socialy evaluated (asynchron)
    if (curRouteCnt === matchingRoutesCnt) {
      curRouteCnt = 0;
      matchingRoutesCnt = 0;
      _evaluateBestRoute(matchingRoutes);     
    }
  };

  var _evaluateBestRoute = function(matchingRoutes) {
    var tmpRoute;
    if (matchingRoutes.length > 0) {
      if (matchingRoutes.length > 1) {
        // direct friend
        tmpRoute = _.filter(matchingRoutes, function(route) {
          return route.relationship.friend.length > 0;
        });
        if (tmpRoute.length > 0) {
          _announceBestRoute(tmpRoute[0]);
        } else {
          // friend in common
          tmpRoute = _.filter(matchingRoutes, function(route) {
            return route.relationship.commonFriends.length > 0;
          });
          if (tmpRoute.length === 1) {
            _announceBestRoute(tmpRoute[0]);
          } else {
            if (tmpRoute.length > 1) {
              // if more that 1 route have friends in common, calc min detour
              matchingRoutes = tmpRoute;
            }
            // if no social connection is available or more that 1 social route is available, calc detour factor
            var minDist = matchingRoutes[0].poolingDetail.percentDist;
            _.each(matchingRoutes, function(route) {
              if (route.poolingDetail.percentDist <= minDist) {
                minDist = route.poolingDetail.percentDist;
                tmpRoute = route;
              }
            });
            _announceBestRoute(tmpRoute);
          }
        }
      } else {
        _announceBestRoute(tmpRoute);
      }
    } else {
      console.log('leider keine passende route gefunden');
    }
  };

  var _announceBestRoute = function(route) {
    var rel = route.relationship;
    var user = rel.userData;
    var $dialog = $('#poolingContent #dialogContent');
    $dialog.html('');

    if (rel.friend.length > 4) {
      $dialog.append('<h3>Dein Freund ' + user.name + ' fährt die gleiche Strecke :)</h3>');
    } else {
      $dialog.append('<h3>' + user.name + ' fährt die gleiche Strecke :)</h3>');
      if (rel.commonFriends.length > 0) {
        $dialog.append('<p>Vielleicht kennt Ihr euch sogar!</p>');
        $dialog.append('<p>Ihr habt <strong>' + rel.commonFriends[0] + '</strong> als gemeinsamen Freund</p>');
      }
      if (rel.commonFriends.length > 1) {
        $dialog.append('<p>(Insgesamt ' + rel.commonFriends.length + ' gemeinsame Freunde)</p>');
      }
      $dialog.append('<p>Sein Profil findest du <a href="https://www.facebook.com/' + user.userId + '" target="_blank">hier</a></p>');
    }
    debugger;
  }

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