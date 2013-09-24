var SocialHandler = function(cb, routePos) {
  return function(data) {
    cb(data, routePos);
  }
}