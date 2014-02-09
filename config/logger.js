'use strict';

var express = require('express');

module.exports = function() {
  // Logging configured for development environment
  var logger = express.logger('dev');

  // This is a pattern for gluing together multiple middleware functions into a single piece of middleware.
  var fn = function(req, res, next) {
    logger(req, res, next);
  };

  return fn;
};