'use strict';

module.exports = (function() {
  var moduleExports = {};

  moduleExports.db = {
    url: 'mongodb://localhost/express-todo'
  };

  return moduleExports;
})();