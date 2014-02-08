'use strict';

var mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  utils = require('../lib/utils');

module.exports = (function() {
  var moduleExports = {};


  moduleExports.init = function(app) {

    var User = mongoose.model('User');

    // This is the verify callback. This is what gets invoked by passport.authenticate(). The done callback is, in this
    // case, the custom callback defined in the session controller. Note that done's function signature is:
    //    Done(error, user, info)
    // where error indicates an internal error, user is the user, and info is a object with info about an authentication
    // failure.
    // NB: Passport will call done(null, false, info) *before* calling the verifyCallback if there are missing
    // credentials. I'm getting around this by doing basic validation in the sessionsController.
    var verifyCallback = function(email, password, done) {
      var info;

      // We try to find a user whose email (username) matches the one provided.
      User.findOne({email: email}, function (err, user) {
        // If there's an error, pass it to the done callback.
        if (err) {
          err.status = err.status || 500;
          return done(err);
        }
        // I've read some recommendations that if authentication fails, you shouldn't even tell the client that the user
        // exists. Unclear, but might need to change this to reflect that. Anyway, this is for the situation where the
        // user just wasn't found.
        if (!user) {
          info = new Error('User not found');
          info.status = 401;
          info.field = 'email';
          return done(null, false, info);
        }
        // If the user was found, we can check the password to see if it matches.
        user.checkPassword(password, function(err, passwordMatches) {
          if (err) {
            err.status = err.status || 500;
            return done(err);
          }
          if (!passwordMatches) {
            info = new Error('Incorrect password');
            info.status = 401;
            info.field = 'password';
            return done(null, false, info);
          }
          // If we've gotten this far, it means we have a good username/password pair.
          return done(null, user);
        });
      });
    };

    // Passport keeps track of the user as part of the session. On each new request, it adds the user to the request object.
    // These two functions tell it how to store the user and how to retrieve it.
    // Just put the id in the session store...
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    //... and on the next request, find the user with that id.
    passport.deserializeUser(function(id, done) {
      User.findOne({ _id: id }, function (err, user) {
        done(err, user);
      });
    });

    // Use local strategy
    // When you give passport a strategy, you're telling it how to behave when authenticate is called
    passport.use(new LocalStrategy({
        // Passport will grab these two fields from the request and pass them on as the username (1st) and password (2nd)
        // arguments to the verify callback.
        usernameField: 'email',
        passwordField: 'password'
      },
      // See above.
      verifyCallback
    ));

    // Initialize passport
    app.use(passport.initialize());
    // Enable login sessions
    app.use(passport.session());
  };

  return moduleExports;
})();

