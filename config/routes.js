var path = require('path'),
  express = require('express'),
  controllers = require('../app/controllers'),
  auth = require('../lib/middleware/auth'),
  utils = require('../lib/middleware/utils');


var redirectTo = function(url) {
  return function(req, res, next) {
    res.redirect(url);
  };
};

var configRoutes = function(app) {
  app.get('/', redirectTo('/home'));

  // Static pages
  app.get('/home', utils.saveAsLastPage, controllers.staticPagesController.home, utils.sendResponse);
  app.get('/about', utils.saveAsLastPage, controllers.staticPagesController.about, utils.sendResponse);

  // Session controller actions
  app.get('/signin', auth.isNotAuthenticated, utils.saveAsLastPage, controllers.sessionController.neu, utils.sendResponse);
  app.get('/sessions', redirectTo('/signin'));
  app.post('/sessions', auth.isNotAuthenticated, controllers.sessionController.create);
  app.delete('/signout', controllers.sessionController.destroy);

  // User controller actions
  app.get('/signup', auth.isNotAuthenticated, utils.saveAsLastPage, controllers.userController.neu, utils.sendResponse);
  app.post('/users', controllers.userController.create);
  app.get('/users/:userId', auth.isAuthenticated, auth.user.isAuthorized, utils.saveAsLastPage, controllers.userController.show, utils.sendResponse);

  // Todo controller actions
  app.all('/users/:userId/todos*', auth.isAuthenticated, auth.user.isAuthorized);
  app.get('/users/:userId/todos*', redirectTo('/home'));
  app.post('/users/:userId/todos', controllers.todoController.create);
  app.patch('/users/:userId/todos/:todoId', controllers.todoController.update);
  app.delete('/users/:userId/todos/:todoId', controllers.todoController.destroy);
};

module.exports = function(app) {
  var router = app.router;

  // If we don't match any of the routes, serve static content
  var static = express.static(path.resolve(__dirname, '../public'));


  // This is a pattern for gluing together multiple middleware functions into a single piece of middleware.
  var fn = function(req, res, next) {
    router(req, res, function(err) {
      if (err) {
        return next(err);
      }
      static(req, res, next);
    });
  };

  configRoutes(app);
  return fn;
};