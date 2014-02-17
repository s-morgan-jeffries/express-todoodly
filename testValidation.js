'use strict';

var express = require('express'),
  app = express(),
  http = require('http'),
  models = require('./app/models'),
  views = require('./app/views'),
  controllers = require('./app/controllers'),
  db = require('./config/db'),
  routes = require('./config/routes'),
  logger = require('./config/logger'),
  sessions = require('./config/sessions'),
  bodyParser = require('./config/bodyParser'),
  passport = require('./config/passport'),
  initResponseConfig = require('./lib/middleware/utils').initResponseConfig,
  errorHandler = require('./lib/middleware/errorHandler'),
//  debug = require('./lib/middleware/debug'),
  DEFAULT_PORT = 3000,
  mongoose = require('mongoose');


//////////////////// Initialization/Configuration ////////////////////
// Initialize the db connection, models, and controllers
db.init();
models.init();

module.exports = (function() {
  var moduleExports = {};


  var User = moduleExports.User = mongoose.model('User');

//  var user = moduleExports.user = new User({email: '', color: 'blue'});

//  var err, cb = function(e) {err = e;}, user;
//  testVal.User.buildUserFromRaw({email: 's.morgan.jeffries@gmail', password: 'poop'}, function(e,u) {user=u;});
  User.findOne({email: 'poopface@mon.key'}, function(err, user) {
    moduleExports.user = user;
  });

  return moduleExports;
}());

//
//var Toy = mongoose.model('Toy');
//
//var toy1 = new Toy({name: 'monkeybutt', color: 'blue'});
//toy1.save(function(err, toy) {
//  console.log(err);
////  var toy2 = new Toy({name: 'monkeybutt', color: 'red'});
////  toy2.save(function(err) {
////    console.log(err);
////  });
//});