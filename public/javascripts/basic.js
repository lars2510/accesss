var accesss = {

  initMainPage: function(userData) {
    $('#mainTitle').html(userData.name);
    $.mobile.changePage('#mainPage', { transition: 'slide' } );
  },

  setUserImage: function(img) {
    $('#userImage').attr('src', img.data.url);
  }

};


var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var hamburg = new google.maps.LatLng(53.56308, 10.01856);
  var mapOptions = {
    zoom:12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: hamburg
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));
var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  var control = document.getElementById('control');
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
  control.style.display = 'block';
}

function calcRoute() {
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
  getDataFromCar2Go();

}

function getDataFromCar2Go() {
  $.ajax({
    url: 'https://www.car2go.com/api/v2.1/vehicles',
    cache: false,
    data: {
      'oauth_consumer_key': 'socialMobility',
      'loc': 'hamburg',
      'format': 'json'
    },
    dataType: 'jsonp'
  }).done(function(res) {
    
    var image = 'img/map_pin_car.png';
    var myLatLng = new google.maps.LatLng(53.56308, 10.01856);
    var beachMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image,
        animation: google.maps.Animation.DROP,
    });
  }).fail(function(jqXHR, textStatus) {
    debugger;
  });
}

google.maps.event.addDomListener(window, 'load', initialize);