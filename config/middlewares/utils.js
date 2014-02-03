'use strict';

module.exports = (function() {
  var moduleExports = {};

  moduleExports.carryFlash = function(req, res, next) {
    var message = req.flash('message')[0],
      alertType = req.flash('alertType')[0];

    message = message || (res.locals && res.locals.flash && res.locals.flash.message);
    alertType = alertType || (res.locals && res.locals.flash && res.locals.flash.alertType);
    if (message && alertType) {
      req.flash('message', message);
      req.flash('alertType', alertType);
    }
    next();
  };

  return moduleExports;
})();