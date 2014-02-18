'use strict';

var statusCodes = require('../../config/statusCodes'),
  ControllerHelper = require('../../lib/ControllerHelper'),
  _ = require('lodash'),
  Promise = require('../../lib/Promise');

//HTTP Verb	Path	Action	Used for
//  GET	/photos	index	display a list of all photos
//GET	/photos/new	new	return an HTML form for creating a new photo
//POST	/photos	create	create a new photo
//GET	/photos/:id	show	display a specific photo
//GET	/photos/:id/edit	edit	return an HTML form for editing a photo
//PATCH/PUT	/photos/:id	update	update a specific photo
//DELETE	/photos/:id	destroy	delete a specific photo


module.exports = function(UserModel) {

  var moduleExports = {};

  // Render a signup form for creating a new user. The screwy name is because new is a reserved word in JavaScript.
  moduleExports.neu = function(req, res, next) {
    var controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.config.template = 'user/new';
    controllerHelper.sendResponse();
  };

  // Create a new user (via post request)
  moduleExports.create = function (req, res, next) {
    var controllerHelper,
      userParams,
      validationErrors;

    var appendToValidationErrors = function(valErr) {
      // valErr is a ValidationError returned by mongoose. It contains an errors object (not an array, at least
      // until v4) that contains a property for each parameter that failed validation. Here's where application
      // logic meets business logic, because you have to design the model validations so that they build on each
      // other (e.g. check for the existence of a required parameter before you check to see that it's formatted
      // correctly).
      // If it exists, we have to get the relevant values into an object and add that to validationErrors
      if (valErr) {
        // Get the validation errors from the UserModel, append them to validationErrors
        _.forOwn(valErr.errors, function(val, key, col) {
          validationErrors[key] = {
            param: key,
            msg: val.message,
            value: userParams[key]
          };
        });
      }
    };

    var reRenderFormWithErrors = function() {
      // Here's where you set the status code, assign values to the parameters, and re-render the form template
      controllerHelper.config.template = controllerHelper.session.lastTemplate;
      controllerHelper.config.status = statusCodes.VALIDATION_ERROR_STATUS;
      _.forIn(validationErrors, function(val, key) {
        controllerHelper.config.content.alerts[key] = { msg: val.msg, type: 'danger' };
      });
      controllerHelper.config.content.email = req.param('email');
      controllerHelper.sendResponse();
    };

    controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.successMessage = 'Account created successfully!';
    controllerHelper.successRedirect = '/';

    // VERY IMPORTANT: FOR EACH PARAMETER, THE LAST TEST THAT FAILS WINS
    req.checkBody('passwordConfirmation', 'Password confirmation must match password').equals(req.param('password'));
    req.checkBody('passwordConfirmation', 'Must provide a password confirmation').notEmpty();

    // This is the validationErrors object returned from express-validator
    validationErrors = req.validationErrors(true) || {};

    // Since we're already using express-validator, we can use it for whitelisting.
    userParams = {
      email: req.param('email'),
      password: req.param('password')
    };

    // buildUserFromRaw runs asynchronously, so we have to give a callback.
    UserModel.buildUserFromRaw(userParams, function(err, user) {
      // An err at this point is just a server error.
      if (err) {
        // I'm going to need to refactor these errors
        return controllerHelper.sendServerError(err);
      }

      // If we've gotten validation errors from express-validator, we already know we're going to return the form, so we
      // use user.validate instead of user.save.
      if (!_.isEmpty(validationErrors)) {
        user.validate(function(valErr) {
          appendToValidationErrors(valErr);
          return reRenderFormWithErrors();
        });
      } else {
        user.save(function(err) {
          if (err) {
            // This has to deal with any type of error.
            if (err.name === 'ValidationError') {
//              console.log(err);
              appendToValidationErrors(err);
              return reRenderFormWithErrors();
            } else {
              return controllerHelper.sendServerError(err);
            }
          }
          // This method (logIn or login) is exposed by passport. It establishes a login session.
          req.logIn(user, function(err) {
            if (err) {
              return controllerHelper.sendServerError(err);
            }
            controllerHelper.success();
          });
        });
      }
    });
  };

  // Render user profile page
  moduleExports.show = function(req, res, next) {
    var controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.config.template = 'user/show';
    controllerHelper.sendResponse();
  };

  // Render user edit page
  moduleExports.edit = function(req, res, next) {
    var controllerHelper = new ControllerHelper(req, res, next);

    controllerHelper.config.content.email = req.user.email;
    controllerHelper.config.template = 'user/edit';
    controllerHelper.sendResponse();
  };

  // Update user and redirect
  moduleExports.update = function(req, res, next) {
    var controllerHelper,
      userParams,
      validationErrors = {},
      user,
      password,
      valErrBlacklist = ['Provided email is in use'];

//    var valErr = { message: 'Validation failed', name: 'ValidationError', errors: { email: { message: 'Provided email is in use', name: 'ValidatorError', path: 'email', type: 'user defined', value: 's.morgan.jeffries@gmail.com' }, password: { message: 'Password does not match', name: 'ValidatorError', path: 'password', type: 'user defined', value: 'pass' } } };

    var filterValErrs = function(valErr) {
      valErr = _.cloneDeep(valErr);
      valErr.errors = _.omit(valErr.errors, function(err) {
        return _.contains(valErrBlacklist, err.message);
      });
      return valErr;
    };

//    var filterValErrs = function(valErr) { valErr = lodash.cloneDeep(valErr); valErr.errors = lodash.omit(valErr.errors, function(err) { return lodash.contains(valErrBlacklist, err.message); }); return valErr; };

    var appendToValidationErrors = function(valErr) {
      if (valErr) {
        _.forOwn(valErr.errors, function(val, key, col) {
          validationErrors[key] = {
            param: key,
            msg: val.message,
            value: userParams[key]
          };
        });
      }
    };

    var reRenderFormWithErrors = function() {
      // Here's where you set the status code, assign values to the parameters, and re-render the form template
      controllerHelper.config.template = controllerHelper.session.lastTemplate;
      controllerHelper.config.status = statusCodes.VALIDATION_ERROR_STATUS;
      _.forIn(validationErrors, function(val, key) {
        controllerHelper.config.content.alerts[key] = { msg: val.msg, type: 'danger' };
      });
      controllerHelper.config.content.email = req.param('email');
      controllerHelper.sendResponse();
    };

    controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.successMessage = 'Account updated successfully!';
    controllerHelper.successRedirect = '/users/' + req.user.id;

    userParams = {
      email: req.param('email')
    };

    user = req.user;
    password = req.param('password');

    user.checkPassword(password, function(err, passwordMatches) {
      if (err) {
        return controllerHelper.sendServerError(err);
      }
      if (!passwordMatches) {
        validationErrors.password = {
          param: 'password',
          msg: 'Password does not match',
          value: password
        };
      }
      _.extend(user, userParams);
      // This uses user.validate to check validation errors, then ignores the one for a non-unique email, then uses
      // user.update to make the changes.
      user.validate(function(err) {
        if (err.name === 'ValidationError') {
          appendToValidationErrors(filterValErrs(err));
        } else {
          return controllerHelper.sendServerError(err);
        }

        if (!_.isEmpty(validationErrors)) {
          return reRenderFormWithErrors();
        }
        user.update(userParams, function(err) {
          if (err) {
            return controllerHelper.sendServerError(err);
          }
          controllerHelper.success();
        });
      });
    });
  };

  // Delete user and redirect
  moduleExports.destroy = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    var returnSuccess = function() {
      res.status(statusCodes.POST_REDIRECT_STATUS).redirect('/');
    };

    var returnErr = function(err) {
      config.content.alerts.main = {
        msg: 'Oops. Something went wrong.',
        type: 'danger'
      };
      err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
      err.template = req.session && req.session.lastTemplate || 'staticPages/home';
      next(err);
    };

    UserModel
      .findById(req.params.userId)
      .exec()
      // Remove todos
      .then(function(user) {
        var promise = new Promise();
        user.findTodos().remove().exec(function(err) {
          promise.resolve(err, user);
        });
        return promise;
      })
      // Remove user
      .then(function(user) {
        var promise = new Promise();
        user.remove(function(err) {
          promise.resolve(err, null);
        });
        return promise;
      })
      // Log out and destroy session
      .then(function() {
        var promise = new Promise();
        req.logout();
        req.session.destroy(function(err) {
          promise.resolve(err, null);
        });
        return promise;
      })
      // Render the response
      .then(returnSuccess, returnErr);
  };

  moduleExports.confirmDelete = function(req, res, next) {
    var controllerHelper = new ControllerHelper(req, res, next);
    controllerHelper.config.template = 'user/confirmDelete';
    controllerHelper.sendResponse();
  };

  return moduleExports;
};