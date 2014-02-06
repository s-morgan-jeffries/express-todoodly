'use strict';

var utils = require('../../lib/middleware/utils'),
  _ = require('lodash');

module.exports = function(passport) {
  var moduleExports = {};

  // Renders the signin form.
  moduleExports.neu = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.template = 'session/new';
    next();
  };

  // Logs the user in (in response to a post request).
  moduleExports.create = function (req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};
    // This will authenticate using the LocalStrategy defined in the passport configuration module. The 'local' argument
    // tells it to use that strategy. The callback that follows is invoked once authentication is complete (it's the
    // done callback).
    passport.authenticate('local', function(err, user, info) {
      // This means there was a server error.
      if (err) {
        config.content.alerts.main = {
          msg: 'Oops! Something went wrong.',
          type: 'danger'
        };
        err.status = err.status || 500;
          err.redirectTo = req.session && req.session.lastPage || '/';
        return next(err);
      }
      // This means there was an authentication error. This will need to be handled differently when I start doing AJAX
      // requests.
      if (!user) {
        // If we have info on what went wrong, send the user back to the signin page with a flash message.
        if (info && info.errors) {
          if (info.errors.email) {
            config.content.alerts.email = {
              msg: info.errors.email.message,
              type: 'danger'
            };
            err = new Error(info.errors.email.message);
            err.status = 401;
            err.redirectTo = req.session && req.session.lastPage || '/';
            return next(err);
          } else if (info.errors.password) {
            config.content.alerts.password = {
              msg: info.errors.password.message,
              type: 'danger'
            };
            err = new Error(info.errors.password.message);
            err.status = 401;
            err.redirectTo = req.session && req.session.lastPage || '/';
            return next(err);
          }
        } else {
          config.content.alerts.main = {
            msg: '401: Unknown authentication error',
            type: 'danger'
          };
          err = new Error('401: Unknown authentication error');
          err.status = 401;
          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }

      }
      // This is used to establish a login session. The code for this is in passport/lib/passport/http/request.js. It adds
      // a 'user' key to the session store. It also adds a user to the request object (the SessionStrategy handles
      // re-populating req.user on each request).
      //t0d0: Update this to use req.session.regenerate (so the session id changes when you log in).
          // You'll need to transfer any session values to the new session

      var sessionStore = req.session;
      req.session.regenerate(function(err) {
        if (err) {
          config.content.alerts.main = {
            msg: 'Oops! Something went wrong.',
            type: 'danger'
          };
          err.status = err.status || 500;
          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }
        _.defaults(req.session, sessionStore);
        req.logIn(user, function(err) {
          if (err) {
            config.content.alerts.main = {
              msg: 'Oops! Something went wrong.',
              type: 'danger'
            };
            err.status = err.status || 500;
            err.redirectTo = req.session && req.session.lastPage || '/';
            return next(err);
          }
          res.redirect('/');
        });
      });
      // passport.authenticate() actually returns a function, and normally that function is used as route middleware. It's
      // not done that way here, so we have to call it explicitly.
    })(req, res, next);
  };

  // Log the user out (in response to a post request).
  moduleExports.destroy = function (req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    if(req.isAuthenticated()) {
      // This ends the login session, which removes the user key from the session store. It also stops passport from
      // trying to deserialize the user on every request. Not sure if Passport would just stop doing that on its own
      // once the session store is destroyed, but since this is the only way I've seen this done, I'm leaving it in for
      // now.
      req.logout();
      req.session.destroy(function(err) {
        if (err) {
          config.content.alerts.main = {
            msg: 'Oops! Something went wrong.',
            type: 'danger'
          };
          err.status = err.status || 500;
          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }
        res.redirect('/');
      });
    } else {
      // Is this really necessary? Probably for logging purposes, since the logout form shouldn't even be exposed unless
      // you're logged in. I'll leave it in for now.
      var err = new Error('Not logged in');
      err.status = 401;
      err.redirectTo = req.session && req.session.lastPage || '/';
      next(err);
    }
  };

  return moduleExports;
};