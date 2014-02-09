'use strict';

var statusCodes = require('../../config/statusCodes'),
  ControllerHelper = require('../../lib/ControllerHelper');

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
    var controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.config.template = 'user/show';
    controllerHelper.sendResponse();
  };

  // Create a new user (via post request)
  moduleExports.create = function (req, res, next) {
    var controllerHelper,
      userParams;

    controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.successMessage = 'Account created successfully!';
    controllerHelper.successRedirect = '/';
    controllerHelper.paramConfig = {email: [], password: [], passwordConfirmation: []};
    userParams = controllerHelper.sanitizeParams();

    // buildUserFromRaw runs asynchronously, so we have to give a callback.
    User.buildUserFromRaw(userParams, function(err, newUser) {
      if (err) {
        return controllerHelper.sendServerError(err);
      }
      newUser.save(function(err) {
        if (err) {
          if (err.name === 'ValidationError' || err.status === statusCodes.VALIDATION_ERROR_STATUS) {
            return controllerHelper.sendValidationError(err);
          } else {
            return controllerHelper.sendServerError(err);
          }
        }
        // This method (logIn or login) is exposed by passport. It establishes a login session.
        req.logIn(newUser, function(err) {
          if (err) {
            return controllerHelper.sendServerError(err);
          }
          controllerHelper.success();
        });
      });

    });
  };

  return moduleExports;
};