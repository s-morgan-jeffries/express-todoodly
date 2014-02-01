'use strict';

module.exports = (function() {
  var moduleExports = {};

  moduleExports.home = function(req, res, next) {
    res.render('staticPages/home');
  };

  moduleExports.about = function(req, res, next) {
    res.render('staticPages/about');
  };

  return moduleExports;
})();