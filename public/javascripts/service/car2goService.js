/**
* get live car-sharing data from car2go api
* @author lars schuettemeyer
*/
var car2goService = {
  /**
  * get live car-sharing data from car2go api
  * @param {string} city - get data from this city
  * @param {function} cb - the callback function
  */
  getData: function(city, cb) {
    var queryUrl = 'https://www.car2go.com/api/v2.1/vehicles';
    var consumerKey = 'socialMobility';
    $.ajax({
      url: queryUrl,
      cache: true,
      data: {
        'oauth_consumer_key': consumerKey,
        'loc': city,
        'format': 'json'
      },
      dataType: 'jsonp'
    }).done(function(res) {
     cb(res);
    }).fail(function(jqXHR, textStatus) {
      console.warn('error: car2goService - api error');
    });
  },

  /** cached local json data for testing purpose */
  getLocalData: function(city, cb) {
    $.ajax({
      url: '/vehicles.json'
    }).done(function(res) {
     cb(res);
    }).fail(function(jqXHR, textStatus) {
      console.warn('error: car2goService - api error');
    });
  }
}