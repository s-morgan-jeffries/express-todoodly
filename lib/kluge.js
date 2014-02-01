'use strict';

var mongoose = require('mongoose'),
  fs = require('fs'),
  path = require('path');

//mongoose.connect('mongodb://localhost/express-todo');
// Sets up the db connection
require('../db');
// Bootstrap models
var modelsPath = path.resolve(__dirname, '../app/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  // Runs all the model files as scripts
  require(modelsPath + '/' + file);
});


module.exports = function() {
  var moduleExports = {};

  moduleExports.mongoose = mongoose;
  moduleExports.User = mongoose.model('User');
  moduleExports.emptyCollection = function(collectionName) {
    mongoose.model(collectionName).find({}).remove(function() {
        console.log(collectionName + ' emptied');
    },
    function(err) {
      console.log(err);
    });
  };
  moduleExports.dropCollection = function(collectionName) {
    mongoose.connection.collections[collectionName].drop(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(collectionName + ' dropped');
      }
    });
  };

  return moduleExports;
}();