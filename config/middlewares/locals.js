'use strict';

module.exports = function() {
  return function (req, res, next) {
    // All I really need at this point
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user;

    // Clear the flash
    res.locals.flash = {
      message: req.flash('message')[0],
      alertType: req.flash('alertType')[0]
    };
//    console.log(res.locals.flash);
    if (!(res.locals.flash.message || res.locals.flash.alertType)) {
      delete res.locals.flash;
    }
//    console.log(res.locals.flash);

    // And continue
    next();
  };
};