'use strict';

var validator = require('validator');

module.exports = (function() {
  var moduleExports = {};

  var ControllerHelper = moduleExports.ControllerHelper = function(req) {
    this.session = req.session || {};
  };


//  var config = req.session.responseConfig = (req.session.responseConfig || {});
//  config.content = config.content || {};
//  config.content.alerts = config.content.alerts || {};

//  var alertAndReturnErr = function(e) {
//    config.content.alerts[e.field || 'main'] = {
//      msg: e.userMsg || e.message,
//      type: 'danger'
//    };
//    e.template = req.session && req.session.lastTemplate || 'staticPages/home';
//    return next(e);
//  };

  return moduleExports;
}());