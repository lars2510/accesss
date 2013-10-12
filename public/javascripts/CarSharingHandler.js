/**
* Car-Sharing Class
* shows car-sharing vehicles on the map, show additional information and calculates the route
* @author lars schuettemeyer
*/
var CarSharingHandler = function(map, directionsService, directionsDisplay) {

  var myPosition,
      myMarker,
      markerInfoPopup = new google.maps.InfoWindow(),
      geocoder = new google.maps.Geocoder(),
      markerList = [],
      carPos,
      self = this;
  
  self.carData;

  /**
  * init the car sharing handler
  */
  this.init = function() {
    if(self.carData) {
      // use cached data
      self.initCars(self.carData);
    } else {
      // get new data from car2go api for hamburg
      car2goService.getData('hamburg', self.initCars);
    };
  }

  /**
  * return current car position
  */
  this.getCarPos = function() {
    return carPos;
  };

  /**
  * calculate carpooling route with waypoints
  * @param {object} carData - the car data
  */
  this.initCars = function(carData) {
    var image = 'images/car-marker.png';
    var address = $('#js_start input').val();
    var myLatLng;
    
    if(!self.carData) {
      self.carData = carData;
    }

    if(address.length > 0) {
      geocoder.geocode({'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            myPosition = results[0].geometry.location
            map.setCenter(myPosition);
            myMarker = new google.maps.Marker({
                position: myPosition,
                map: map,
                title: 'Mein Startpunkt!',
                animation: google.maps.Animation.DROP
            });
          }
        } else {
          console.warn("error: CarSharingHandler - geocoder failed due to: " + status);
        }
      });
    }

    // filter cars, only good interior and exterior
    var acceptableCars = _.filter(carData.placemarks, function(car){ 
      return !(car.interior === 'UNACCEPTABLE' || car.exterior ==='UNACCEPTABLE'); 
    });

    // set car2go marker
    _.each(acceptableCars, function(car) {
      myLatLng = new google.maps.LatLng(car.coordinates[1], car.coordinates[0]);
      var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: image
      });
      markerList.push(marker);
      var infoText = car.address + 
                      '<br />Tank: ' + car.fuel + '%' +
                      '<br />Kennzeichen: ' + car.name + 
                      '<br /><span class="carbook" onClick="accesss.mainController.startCarSharingRoute();">buchen</span>';
      _attachDetailLayer(marker, infoText);
    });
  };

  /**
  * remove marker from map
  */
  this.removeMarker = function() {
    _.each(markerList, function(marker) {
      marker.setMap(null);
    });
    markerList = [];
  };

  /**
  * calculate carpooling route with waypoints
  * @param {object} marker
  * @param {string} text
  */
  var _attachDetailLayer = function(marker, text) {
    google.maps.event.addListener(marker, 'click', function() {
      myMarker.setMap(null);
      markerInfoPopup.setContent(text);
      markerInfoPopup.open(map, marker);
      carPos = marker.getPosition().lat() + ', ' + marker.getPosition().lng();
      _getWalkingDistance(carPos);
    });
  };

  /**
  * get the walking distance to the carsharing vehicle
  * @param {object} selectedCarPos
  */
  var _getWalkingDistance = function(selectedCarPos) {
    var request = {
      origin: myPosition, 
      destination: selectedCarPos,
      travelMode: google.maps.DirectionsTravelMode.WALKING
    };
    
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        var m = response.routes[0].legs[0].distance.value + " Meter"; 
        var min = (response.routes[0].legs[0].duration.value / 60 + 0.5).toFixed(0) + " min";
        $('#js_carinfo').html('Entfernung ' + m + '. Fußweg ' + min + '.');
        directionsDisplay.setDirections(response);
        $('#js_direction').removeClass('ui-disabled');
      }
    });    
  };
};