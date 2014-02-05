'use strict';

var fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require('passport');

module.exports = (function() {
  var moduleExports = {};

  moduleExports.staticPagesController = require('./staticPagesController')(mongoose.model('Todo'));

  moduleExports.sessionController = require('./sessionController')(passport);

  moduleExports.userController = require('./userController')(mongoose.model('User'), mongoose);

  moduleExports.todoController = require('./todoController')(mongoose.model('Todo'));

  return moduleExports;
})();