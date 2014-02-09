'use strict';

var _ = require('lodash'),
  utils = require('../../lib/middleware/utils'),
  statusCodes = require('../../config/statusCodes');

module.exports = function(Todo) {
  var moduleExports = {};

  moduleExports.home = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};
    config.template = 'staticPages/home';

    // This is going to need to change
    if (req.isAuthenticated()) {
      Todo.
        find({user: req.user}).
        sort('-createdAt').
        exec(function(err, todos) {
          if (err) {
            config.content.alerts.main = {
              msg: 'Oops! Something went wrong. We\'re working on it!',
              type: 'danger'
            };
            err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
            err.template = req.session && req.session.lastTemplate || 'staticPages/home';
            return next(err);
          }
          config.content.todos = todos;
          return next();
        });
      // Technically, this else isn't necessary, but it's more explicit and makes the logic clearer.
    } else {
      return next();
    }
  };

  moduleExports.about = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.template = 'staticPages/about';
    next();
  };

  return moduleExports;
};