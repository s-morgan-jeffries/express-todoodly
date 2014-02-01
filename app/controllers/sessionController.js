'use strict';

module.exports = function(passport) {
  var moduleExports = {};

  moduleExports.neu = function(req, res, next) {
    res.render('session/new');
  };

  moduleExports.create = function (req, res, next) {
    // This will authenticate using the LocalStrategy defined in lib/config/pass.js. The 'local' argument tells it to use
    // that strategy. The callback that follows is invoked once authentication is complete (it's the done callback).
    //backburner: Fix error handling in passport.authenticate
    passport.authenticate('local', function(err, user, info) {
      // This should probably be handled differently. If err is not null, it should be passed to the server's error
      // handler. Conversely, the presence of info indicates an authentication error (no such user or bad user/password
      // combo), so that could be treated as a 400-series error.
      var error = err || info;
      if (error) {
        error.status = error.status || 401;
        return next(error);
      }
      if (!user) {
        error = new Error("Did not authenticate");
        error.status = 401;
        return next(error);
      }
      // This is used to establish a login session. The code for this is in passport/lib/passport/http/request.js. It adds
      // a 'user' key to the session store. It also adds a user to the request object (the SessionStrategy handles
      // re-populating req.user on each request).
      //t0d0: Update this to use req.session.regenerate (so the session id changes when you log in)
      req.logIn(user, function(err) {
        if (err) {
//          return res.send(err);
          return next(err);
        }
        res.redirect('/users/' + user.id);

      });
      // passport.authenticate() actually returns a function, and normally that function is used as route middleware. It's
      // not done that way here, so we have to call it explicitly.
    })(req, res, next);
  };

  /**
   * destroy
   * logs a user out
   * returns nothing
   */
  moduleExports.destroy = function (req, res, next) {
    if(req.user) {
      // This line is probably redundant, since it deletes a key from req.session, whereas the next line removes
      // req.session entirely. Actually, no, it also removes the user from the request object.
      req.logout();
      req.session.destroy(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    } else {
      // Is this really necessary?
      var err = new Error('Not logged in');
      err.status = 401;
      next(err);
    }
  };

  return moduleExports;
};