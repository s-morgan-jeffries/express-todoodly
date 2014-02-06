'use strict';

var _ = require('lodash'),
  utils = require('../../lib/middleware/utils');

module.exports = function(Todo) {
  var moduleExports = {};

  moduleExports.home = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};
    config.template = 'staticPages/home';

    if (req.isAuthenticated()) {
      Todo.
        find({user: req.user}).
        sort('-createdAt').
        exec(function(err, todos) {
          if (err) {
            config.content.alerts.main = {
              msg: 'Oops! Something went wrong.',
              type: 'danger'
            };
            err.status = err.status || 500;
            err.redirectTo = req.session && req.session.lastPage || '/';
            return next(err);
          }
          config.content.todos = todos;
//          utils.sendResponse(req, res, next);
          return next();
        });
      // Technically, this else isn't necessary, but it's more explicit and makes the logic clearer.
    } else {
      return next();
//      utils.sendResponse(req, res, next);
    }
  };

  moduleExports.about = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.template = 'staticPages/about';
//    utils.sendResponse(req, res, next);
    next();
  };

  return moduleExports;
};