'use strict';

var mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = mongoose.model('User');

// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });
});

// Use local strategy
// When you give passport a strategy, you're telling it how to behave when authenticate is called
passport.use(new LocalStrategy({
    // These options let you use other names to specify the username and password fields
    usernameField: 'email',
    passwordField: 'password'
  },
  // This is the verify callback. This is what gets invoked by passport.authenticate(). The done callback is, in this
  // case, the custom callback defined in lib/controllers/session.js. Note that done's function signature is:
  //    Done(error, user, info)
  // where error indicates an internal error, user is the user, and info is a object with info about an authentication
  // failure.
  function(email, password, done) {
    // We try to find a user whose email (username) matches the one provided.
    User.findOne({ email: email }, function (err, user) {
      // If there's an error, we do this. This is just the pattern that Passport.js uses.
      if (err) {
        err.status = err.status || 500;
        return done(err);
      }
      // I've read some recommendations that if authentication fails, you shouldn't even tell the client that the user
      // exists. Unclear, but might need to change this to reflect that. Anyway, this is for the situation where the
      // user just wasn't found.
      if (!user) {
        return done(null, false, {
          'errors': {
            'email': { type: 'Email is not registered.' }
          }
        });
      }
      // If the user was found, we can call the authenticate method. If it returns true, we have a match. If not, it's
      // an authetication failure.
      // NB: If you switch to an asynchronous authentication method (like the one in pwd), you'll need to rewrite this
      // to account for that.
      user.authenticate(password, function(err, isAuthenticated) {
        if (!isAuthenticated) {
          return done(null, false, {
            'errors': {
              'password': { type: 'Password is incorrect.' }
            }
          });
        }
        // Authentication failures would have returned by this point, so we must have a good username/password pair.
        return done(null, user);
      });
    });
  }
));
