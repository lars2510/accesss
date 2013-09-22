var CarSharingHandler = function(map, geocoder, directionsService, directionsDisplay) {
  
  var myPosition;
  var markerInfoPopup = new google.maps.InfoWindow();
  var carPos;

  this.initCars = function(car2goData) {
    var image = 'images/car-marker.png';
    var address = $('#js_start input').val();
    var myLatLng;
    

    if(address.length > 0) {
      geocoder.geocode({'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            myPosition = results[0].geometry.location
            map.setCenter(myPosition);
          }
        } else {
          console.log("error: maps - geocoder failed due to: " + status);
        }
      });
    }

    // set car2go marker
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
                        '<br /><span class="carbook" onClick="accesss.mapHandler.startCarSharingRoute();">book now!</span>';
        _attachDetailLayer(marker, infoText);
      }
    });
  };

  this.getCarPos = function() {
    return carPos;
  };

  var _attachDetailLayer = function(marker, text) {
    google.maps.event.addListener(marker, 'click', function() {
      markerInfoPopup.setContent(text);
      markerInfoPopup.open(map, marker);
      carPos = new google.maps.LatLng(marker.position.ob, marker.position.pb);
      _getWalkingDistance(carPos);
    });
  };

  var _getWalkingDistance = function(selectedCarPos) {
    var request = {
      origin: myPosition, 
      destination: selectedCarPos,
      travelMode: google.maps.DirectionsTravelMode.WALKING
    };
    
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        var m = response.routes[0].legs[0].distance.value + " Meter"; 
        var sec = response.routes[0].legs[0].duration.value + " Sekunden";
        $('#js_carinfo').html('Entfernung zum Fahrzeug ca. ' + m + ' Meter. Fußweg ' + parseInt(parseInt(sec)/60) + ' Min.');
        directionsDisplay.setDirections(response);
        $('#js_direction').removeClass('ui-disabled');
      }
    });    
  };
  
};