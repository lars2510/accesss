CarPoolingHandler = function(con, directionsService, directionsDisplay) {

  var userData,
      curRouteData,
      matchingRoutes = [],
      matchingRoutesCnt = 0,
      curRouteData,
      curRouteCnt = 0,
      maxDeviation = 20; // maximum deviation for carpooling

  this.findMatchingRoutes = function(curRouteType) {
    // if carpooling log for a driver and vice versa
    var routeType = curRouteType === 'DRIVING' ? 'CARPOOLING' : 'DRIVING';
    dataService.getRouteData(routeType, _filterNearbyRoutes);
  };

  this.init = function(userData, curRouteData) {
    _setUserData(userData);
    _setCurRouteData(curRouteData);
  }

  this.showRequestedRoute = function(info) {
    _showPoolingRoute(info);
    _showRequestDialog(info);
  }

  var _setUserData = function(user) {
    userData = user;
  }

  var _setCurRouteData = function(data) {
    curRouteData = data;
  }

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
      debugger;
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
   
    // remove invalid routes, even with no friendship, rel obj musst be available
    matchingRoutes = _.filter(matchingRoutes, function(route) {
      return route.relationship;
    });

    if (matchingRoutes.length > 0) {
      // direct friend
      tmpRoute = _.filter(matchingRoutes, function(route) {
        return route.relationship.friend.length > 0;
      });
      if (tmpRoute.length > 0) {
        _announceBestRoute(tmpRoute[0]);
      } else {
        // friend in common
        tmpRoute = _.filter(matchingRoutes, function(route) {
          return route.relationship && route.relationship.commonFriends.length > 0;
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
      console.log('leider keine passende route gefunden');
    }
  };

  var _announceBestRoute = function(route) {
    var rel = route.relationship;
    var user = rel.userData;    
    var $dialog = $('#poolingPopup .dialogContent');
    var $dialogHeadline = $('#poolingPopup .dialogHeadline h1');

    $dialog.html('');
    $dialogHeadline.html('Heute muss dein Glückstag sein!');
    $dialogHeadline.append('<img src="' + user.picture + '" />');

    if (rel && rel.friend && rel.friend.length > 0) {
      $dialog.append('<h3>Dein Freund ' + user.name + ' fährt diese Strecke :)</h3>');
    } else {
      $dialog.append('<h3>' + user.name + ' fährt diese Strecke :)</h3>');
      if (rel && rel.commonFriends && rel.commonFriends.length > 0) {
        $dialog.append('<p>Vielleicht kennt ihr euch sogar!</p>');
        $dialog.append('<p><strong>' + rel.commonFriends[0] + '</strong> ist ein gemeinsamer Freund.</p>');
      }
      if (rel && rel.commonFriends && rel.commonFriends.length > 1) {
        $dialog.append('<p>(Insgesamt ' + rel.commonFriends.length + ' gemeinsame Freunde)</p>');
      }
      $dialog.append('<p>Das Nutzerprofil findest du <a href="https://www.facebook.com/' + user.userId + '" target="_blank">hier</a>.</p>');
    }

    $("#js_confirm-pooling").on('click', function() {
      var info = {
        userName: userData.name,
        userId: userData.userId,
        picture: userData.picture,
        time: route.poolingDetail.extendedTime,
        dist: route.poolingDetail.extendedDist,
        start: route.routes[0].legs[0].start_address,
        wp1: route.routes[0].legs[1].start_address,
        wp2: route.routes[0].legs[2].start_address,
        end: route.routes[0].legs[2].end_address
      }
      con.getRoute(user.userId, info);
    });
    $("#poolingPopup").popup('open');
  };

  var _showRequestDialog = function(info) {
    $dialog = $("#poolingPopupRoute");
    $dialogHeadline = $dialog.find('.dialogHeadline');
    $dialogHeadline.find('h1').html('Du hast eine Mitfahrer Anfrage!');
    $dialogHeadline.append('<img src="' + info.picture + '" />');
    $dialogContent = $dialog.find('.dialogContent');
    $dialogContent.html("<p>" + info.userName + " würde sich freuen von dir mitgenommen zu werden!</p>");
    $dialogContent.append("<p>Der Umweg würde nur " + info.time + " Minuten betragen.</p>");
    $dialogContent.append("<p>Deine neue Strecke wird dir auf der Karte angezeigt!</p>");
    $dialog.popup('open');  
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
  * Carpooling route with data from user request
  */
  var _showPoolingRoute = function(info) {
    var waypts = [{
        location:info.wp1,
        stopover:true
      },{
        location:info.wp2,
        stopover:true
      }];
    var request = {
        origin: info.start,
        destination: info.end,
        travelMode: 'DRIVING',
        waypoints: waypts,
        optimizeWaypoints: true
    };
    directionsService.route(request, function(res, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(res);
        $('#js_direction').removeClass('ui-disabled');
      }
    });
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
};