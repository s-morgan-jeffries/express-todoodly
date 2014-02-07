'use strict';

var fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require('passport');

module.exports = (function() {
  var moduleExports = {};

  moduleExports.init = function() {
    this.sessionController = require('./sessionController')(passport);
    this.staticPagesController = require('./staticPagesController')(mongoose.model('Todo'));
    this.todoController = require('./todoController')(mongoose.model('Todo'));
    this.userController = require('./userController')(mongoose.model('User'), mongoose);
  };

  return moduleExports;
})();