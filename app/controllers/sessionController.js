'use strict';

var utils = require('../../lib/utils'),
  _ = require('lodash'),
  statusCodes = require('../../config/statusCodes');

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

    // I found I was repeating this pattern a lot, so I abstracted it into this function. This takes an Error instance
    // (that has optionally been modified with additional properties) and uses it to construct an alert (which will
    // ultimately be rendered as part of the signin form). It then passes the error to next().
    var alertAndReturnErr = function(e) {
      config.content.alerts[e.field || 'main'] = {
        msg: e.userMsg || e.message,
        type: 'danger'
      };
      e.template = req.session && req.session.lastTemplate || 'staticPages/home';
      return next(e);
    };

    // Validation of our parameters has to happen before the call to passport.authenticate (otherwise, we just get a
    // relatively uninformative error that the credentials are missing).
    var valErr,
      email = req.body.email,
      password = req.body.password;
    // No email address provided
    if (!email) {
      valErr = new Error('No email provided');
      valErr.status = statusCodes.UNAUTHORIZED_STATUS;
      valErr.field = 'email';
      valErr.userMsg = 'Must provide a valid email.';
      return alertAndReturnErr(valErr);
    }
    // Invalid email address
    if (!utils.isEmail(email)) {
      valErr = new Error('Invalid email provided');
      valErr.status = statusCodes.UNAUTHORIZED_STATUS;
      valErr.field = 'email';
      valErr.userMsg = 'Must provide a valid email.';
      return alertAndReturnErr(valErr);
    }
    // No password provided
    if (!password) {
      valErr = new Error('No password provided');
      valErr.status = statusCodes.UNAUTHORIZED_STATUS;
      valErr.field = 'password';
      valErr.userMsg = 'Must provide a password.';
      return alertAndReturnErr(valErr);
    }

    // This will authenticate using the LocalStrategy defined in the passport configuration module. The 'local' argument
    // tells it to use that strategy. The callback that follows is invoked once authentication is complete (it's the
    // done callback).
    passport.authenticate('local', function(err, user, info) {
      // This means there was a server error.
      if (err) {
        err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
        err.userMsg = 'Oops! Something went wrong.';
        return alertAndReturnErr(err);
      }
      // This means there was an authentication error. This will need to be handled differently when I start doing AJAX
      // requests.
      if (!user) {
        // If we have info on what went wrong, send the user back to the signin page with a flash message.
        if (info) {
          return alertAndReturnErr(info);
        } else {
          err = new Error('Unknown authentication error');
          err.status = statusCodes.UNAUTHORIZED_STATUS;
          return alertAndReturnErr(err);
        }
      }
      // This is used to establish a login session. The code for this is in passport/lib/passport/http/request.js. It adds
      // a 'user' key to the session store. It also adds a user to the request object (the SessionStrategy handles
      // re-populating req.user on each request).
      var sessionStore = req.session;
      req.session.regenerate(function(err) {
        if (err) {
          err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
          err.userMsg = 'Oops! Something went wrong.';
          return alertAndReturnErr(err);
        }
        _.defaults(req.session, sessionStore);
        req.logIn(user, function(err) {
          if (err) {
            err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
            err.userMsg = 'Oops! Something went wrong.';
            return alertAndReturnErr(err);
          }
          // This is a successful login
          res.status(statusCodes.POST_REDIRECT_STATUS).redirect(req.session.postLoginRedirect || '/');
          delete req.session.postLoginRedirect;
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
          err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
          err.template = 'staticPages/home';
          return next(err);
        }
        res.status(statusCodes.POST_REDIRECT_STATUS).redirect('/');
      });
    } else {
      // Is this really necessary? Probably for logging purposes, since the logout form shouldn't even be exposed unless
      // you're logged in. I'll leave it in for now.
      var err = new Error('Not logged in');
      err.status = statusCodes.UNAUTHORIZED_STATUS;
      err.template = 'staticPages/home';
      next(err);
    }
  };

  return moduleExports;
};