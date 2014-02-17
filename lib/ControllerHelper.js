'use strict';

var validator = require('./validator'),
  _ = require('lodash'),
  statusCodes = require('../config/statusCodes');

module.exports = (function() {

  var ControllerHelper = function(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.session = req.session || {};
    this.config = req.session.responseConfig = (req.session.responseConfig || {});
    this.config.content = this.config.content || {};
    this.config.content.alerts = this.config.content.alerts || {};
  };

  ControllerHelper.prototype.sendError = function(err) {
    this.config.content.alerts[err.field || 'main'] = {
      msg: err.userMsg || 'Oops. Something went wrong. We\'re working on it!',
      type: 'danger'
    };
    err.template = this.errorTemplate || (req.session && req.session.lastTemplate) || 'staticPages/home';
    err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
    this.next(err);
  };

  ControllerHelper.prototype.sendServerError = function(err) {
    var req = this.req;

    this.config.content.alerts.main = {
      msg: 'Oops. Something went wrong. We\'re working on it!',
      type: 'danger'
    };
    err.template = this.errorTemplate || (req.session && req.session.lastTemplate) || 'staticPages/home';
    err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
    this.next(err);
  };

  ControllerHelper.prototype.sendValidationError = function(err) {
    var req = this.req;

    this.config.content.alerts[err.field] = {
      msg: err.message,
      type: 'danger'
    };
    err.status = err.status || statusCodes.VALIDATION_ERROR_STATUS;
    err.template = this.errorTemplate || (req.session && req.session.lastTemplate) || 'staticPages/home';
    this.next(err);
  };

  ControllerHelper.prototype.success = function() {
    if (this.successMessage) {
      this.config.content.alerts.main = {
        msg: this.successMessage,
        type: 'success'
      };
    }
    this.res.status(statusCodes.POST_REDIRECT_STATUS).redirect(this.successRedirect);
  };

  // When you go to create a new user, the parsed request body is passed as parameters. I'm introducing a whitelist here
  // for security.
//  ControllerHelper.prototype.validateParams = function() {
//    var params = _.pick(this.req.body, _.keys(this.paramConfig)),
//      err,
//      field,
//      i,
//      valFn,
//      valConfig;
//
//    for (field in params) {
//      for (valFn in this.paramConfig[k].validate) {
//        valConfig = this.paramConfig[k].validate[valFn];
//        if (!validator[fn](params[k])) {
//          err = new Error('An error');
//          err.field = valConfig.field || field;
//          err.status = valConfig.status;
//          return err;
//        }
//      }
//    }
//  };
//
//  ControllerHelper.prototype.sanitizeParams = function() {
//    var params = _.pick(this.req.body, _.keys(this.paramConfig));
//    return params;
//  };
//  ControllerHelper.prototype.filterParams = function() {
//    return _.pick(this.req.body, this.paramWhitelist);
//  };

  ControllerHelper.prototype.sendResponse = function() {
    var config = this.config;
    var res = this.res;
    delete this.req.session.responseConfig;
    this.req.session.lastTemplate = config.template;

    if (config.status) {
      res.status(config.status);
    }
    res.format({
      'text/html': function(){
//        console.log('sending text/html');
        res.render(config.template, config.content);
      },
      'application/json': function(){
//        console.log('sending application/json');
        res.send({'content': config.content, 'template': config.template});
      },
      'text/plain': function(){
//        console.log('sending text/plain');
        res.send(config.content);
      }
    });
  };

  return ControllerHelper;
}());