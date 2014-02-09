'use strict';

var _ = require('lodash'),
  utils = require('../../lib/middleware/utils'),
  statusCodes = require('../../config/statusCodes');

//HTTP Verb	Path	Action	Used for
//  GET	/photos	index	display a list of all photos
//GET	/photos/new	new	return an HTML form for creating a new photo
//POST	/photos	create	create a new photo
//GET	/photos/:id	show	display a specific photo
//GET	/photos/:id/edit	edit	return an HTML form for editing a photo
//PATCH/PUT	/photos/:id	update	update a specific photo
//DELETE	/photos/:id	destroy	delete a specific photo


module.exports = function(User) {

  var moduleExports = {};

  // Render a signup form for creating a new user. The screwy name is because new is a reserved word in JavaScript.
  moduleExports.neu = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.template = 'user/new';
    next();
  };

  // User profile page
  moduleExports.show = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.template = 'user/show';
    next();
  };

  // Create a new user (via post request)
  moduleExports.create = function (req, res, next) {
    // When you go to create a new user, the parsed request body is passed as parameters. I'm introducing a whitelist here
    // for security.
    var whitelistParams = ['email', 'password', 'passwordConfirmation'],
      userParams = _.pick(req.body, whitelistParams),
      newUser;

    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    // buildUserFromRaw runs asynchronously, so we have to give a callback.
    User.buildUserFromRaw(userParams, function(err, builtUser) {
//        err = new Error('Fuck!');
      if (err) {
        config.content.alerts.main = {
          msg: 'Oops. Something went wrong. We\'re working on it!',
          type: 'danger'
        };
        err.template = req.session && req.session.lastTemplate || 'staticPages/home';
        err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
        return next(err);
      }
      newUser = builtUser;

      newUser.save(function(err) {
        if (err) {
          if (err.name === 'ValidationError' || err.status === statusCodes.VALIDATION_ERROR_STATUS) {
            config.content.alerts[err.field] = {
              msg: err.message,
              type: 'danger'
            };
            err.status = err.status || statusCodes.VALIDATION_ERROR_STATUS;
          } else {
            config.content.alerts.main = {
              msg: 'Oops. Something went wrong.',
              type: 'danger'
            };
            err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
          }
          err.template = req.session && req.session.lastTemplate || 'staticPages/home';
//          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }

        // This method (logIn or login) is exposed by passport. It establishes a login session.
        req.logIn(newUser, function(err) {
          if (err) {
            config.content.alerts.main = {
              msg: 'Oops. Something went wrong.',
              type: 'danger'
            };
            err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
            err.template = req.session && req.session.lastTemplate || 'staticPages/home';
//            err.redirectTo = req.session && req.session.lastPage || '/';
            return next(err);
          }
          // Send a message to the user that this worked
          config.content.alerts.main = {
            msg: 'Account created successfully!',
            type: 'success'
          };
          // Redirect to the user's home page.
          res.status(statusCodes.POST_REDIRECT_STATUS).redirect('/');
        });
      });

    });
  };

  return moduleExports;
};