'use strict';

module.exports = function (req, res, next) {
  // All I really need at this point
  res.locals.isAuthenticated = req.isAuthenticated();
  // And continue
  next();
};