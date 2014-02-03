'use strict';

var _ = require('lodash');

//HTTP Verb	Path	Action	Used for
//  GET	/photos	index	display a list of all photos
//GET	/photos/new	new	return an HTML form for creating a new photo
//POST	/photos	create	create a new photo
//GET	/photos/:id	show	display a specific photo
//GET	/photos/:id/edit	edit	return an HTML form for editing a photo
//PATCH/PUT	/photos/:id	update	update a specific photo
//DELETE	/photos/:id	destroy	delete a specific photo

module.exports = function(User, mongoose) {

  var moduleExports = {},
    ObjectId = mongoose.Types.ObjectId;

  moduleExports.neu = function(req, res, next) {
    res.render('user/new');
  };

  moduleExports.show = function(req, res, next) {
    var user = req.user;
    res.render('user/show', {
//      user: user,
//      flash: {
//        message: req.flash('message'),
//        alertType: req.flash('alertType')
//      }
    });
  };


//  moduleExports.create = function (req, res, next) {
//    var whitelistParams = ['username', 'password', 'passwordConfirmation'],
//      userParams = _.pick(req.body, whitelistParams),
//      newUser;
//
//    //temp for dealing with password confirmation
////    userParams.passwordConfirmation = userParams.password;
//
//  };
//  }
//  /**
//   * Create user
//   * requires: {username, password, email}
//   * returns: {email, password}
//   */
  moduleExports.create = function (req, res, next) {
    // When you go to create a new user, the parsed request body is passed as parameters. I'm introducing a whitelist here
    // for security.
    var whitelistParams = ['email', 'password', 'passwordConfirmation'],
      userParams = _.pick(req.body, whitelistParams),
      newUser;

    //temp for dealing with password confirmation
//    userParams.passwordConfirmation = userParams.password;

    User.buildUserFromRaw(userParams, function(err, builtUser) {
      if (err) {
        // Hmmm... could probably be a little smarter about error-handling here. I'm not sure this is necessarily a 400
        // (bad request) error.
//      return res.json(400, err);
        err.status = err.status || 500;
        return next(err);
      }
      newUser = builtUser;

//      newUser.provider = 'local';
      newUser.save(function(err) {
//    // If we made it this far, the listener has served its purpose
//    User.removeListener('error', errorHandler);
        if (err) {
          // Hmmm... could probably be a little smarter about error-handling here. I'm not sure this is necessarily a 400
          // (bad request) error.
//      return res.json(400, err);
          if (err.name === 'ValidationError') {
//            console.log(err);
            err.status = err.status || 422;
          }
          err.status = err.status || 500;
          return next(err);
        }
//        return res.send('Success!');
        // This method (logIn or login) is exposed by passport. It handles the assignment of the user to req.user.
        req.logIn(newUser, function(err) {
          if (err) {
            err.status = err.status || 500;
            return next(err);
          }
          req.flash('message', 'Account created successfully!');
          req.flash('alertType', 'success');
//          return res.json(newUser.id);
          res.redirect('/users/' + newUser.id);
        });
      });

    });
  };
//
//  /**
//   *  Show profile
//   *  returns {username, profile}
//   */
//// Hmmm... Okay, this was a version 0.0.0, so there's bound to be some stuff that doesn't quite make sense.
//  moduleExports.show = function (req, res, next) {
//    // req.params come from named route params.
//    var userId = req.params.userId;
//    // This explicitly converts the userId to an ObjectId object before executing the query.
//    User.findById(new ObjectId(userId), function (err, user) {
//      if (err) {
//        // Again, not sure about the way this is being handled. How does the client find out about this error? Should this
//        // be handled as a 404? Wait, no, that's below. This might be handled as a 500 (or 5xx), but it's still not clear
//        // to me where that happens.
//        err.status = err.status || 500;
//        return next(err);
//      }
//      //
//      if (!user) {
//        err = new Error('User not found');
//        err.status = 404;
//        return next(err);
//      }
//      res.send({username: user.username, profile: user.profile });
//      // This next line is not strictly identical to the one above, since if user.profile is undefined, it will return
//      // an object without a 'profile' property.
////      res.send(_.pick(user, ['username', 'profile']));
//      // This would be the same, though:
////      res.send(_.pick(_.defaults(user, {profile: undefined}), ['username', 'profile']));
//      // However, that would also modify user in place (as well as returning a copy).
//    });
//  };
//
//  /**
//   *  Username exists
//   *  returns {exists}
//   */
//// Not sure how this is used in the application. The only obvious time that you'd want to know about the existence of a
//// user without getting any other information is if you were creating a new user, but we already have a validation for
//// that (validating on the uniqueness of a new user's email effectively validates on the uniqueness of the user as a
//// whole).
////  It turns out that's exactly what this is for. I'll have to see how it's used when I get to the client code.
//  moduleExports.exists = function (req, res, next) {
//    var username = req.params.username;
////    console.log(req);
////    console.log(res);
//
//    User.findOne({ username : username }, function (err, user) {
//      if (err) {
//        err.status = err.status || 500;
//        return next(err);
//      }
//
//      if(user) {
//        res.json({exists: true});
//      } else {
//        res.json({exists: false});
//      }
//    });
//  };

  return moduleExports;
};