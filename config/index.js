'use strict';

module.exports = (function() {
  var moduleExports = {};

  moduleExports.db = require('./db');

  return moduleExports;
})();