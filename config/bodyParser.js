'use strict';

var express = require('express'),
  expressValidator = require('express-validator');

module.exports = function() {
  // Parses json request body
  var jsonParser = express.json();
  // Parses urlencoded request body
  var urlParser = express.urlencoded();
  var validator = expressValidator();
  // methodOverride looks for a key ('_method' by default) in the now parsed request body, and if it finds it, it
  // replaces the request's method with the value of that property. I guess (?) browser's will only set the method to a
  // restricted set of values, and those often don't include DELETE or PUT.
  var methodOverride = express.methodOverride();

  // This is a pattern for gluing together multiple middleware functions into a single piece of middleware.
  var fn = function(req, res, next) {
    jsonParser(req, res, function(err) {
      if (err) {
        return next(err);
      }
      urlParser(req, res, function(err) {
        if (err) {
          return next(err);
        }
        validator(req, res, function(err) {
          if (err) {
            return next(err);
          }
          methodOverride(req, res, next);
        });
      });
    });
  };

  return fn;
};