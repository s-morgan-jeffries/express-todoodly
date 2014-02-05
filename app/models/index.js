'use strict';

var fs = require('fs'),
  path = require('path');

var modelsPath = path.resolve(__dirname);
fs.readdirSync(modelsPath).forEach(function (file) {
  // Runs all the model files as scripts
  if (!(file === 'index.js')) {
    require(modelsPath + '/' + file);
  }
});