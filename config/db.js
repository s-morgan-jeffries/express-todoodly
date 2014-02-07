var mongoose = require('mongoose');

module.exports = (function() {
  var moduleExports = {};

  // Specifies the URL of the MongoDB server.
  moduleExports.url = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/express-todo';

  moduleExports.mongoOptions = {
    //t0d0: Disable auto-indexing in the production envionment
    // should be done in ../config/config.js
    // see these for details:
    //    http://mongoosejs.com/docs/guide.html#indexes
    //    http://docs.mongodb.org/manual/core/index-creation/
    db: {
      safe: true
    }
  };

  moduleExports.init = function() {
    mongoose.connect(moduleExports.url);
  };

  return moduleExports;
})();