'use strict';

var _ = require('lodash');

module.exports = (function() {
  var moduleExports = {};

  moduleExports.showHeaders = function(req, res, next) {
    var url = req.url,
      method = req.method,
      reqHeaders = _.cloneDeep(req.headers),
      query = req.query;

    res.on('finish', function() {
      console.log('\n\nRequest:');
      console.log(method + ' ' + url);
      console.log('\n\nRequest headers:');
      _.forIn(reqHeaders, function(val, key, obj) {
        console.log(key + ': ' + val);
      });
      console.log('\n\nResponse headers:');
      console.log(this._header);
    });
    return next();
  };

  moduleExports.showSessionStore = function(req, res, next) {
    var sessionStore = req.session;

    res.on('finish', function() {
      console.log(req.session);
    });
    return next();
  };

  return moduleExports;
})();