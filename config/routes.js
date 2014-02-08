var path = require('path'),
  express = require('express'),
  controllers = require('../app/controllers'),
  auth = require('../lib/middleware/auth'),
  utils = require('../lib/middleware/utils');

module.exports = (function() {
  var moduleExports = {};

  var redirectTo = function(url) {
    return function(req, res, next) {
      res.redirect(url);
    };
  };

  moduleExports.init = function(app) {

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
//    app.post('/users/:userId/todos', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.create);
//    app.patch('/users/:userId/todos/:todoId', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.update);
//    app.delete('/users/:userId/todos/:todoId', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.destroy);
    app.post('/users/:userId/todos', controllers.todoController.create);
    app.patch('/users/:userId/todos/:todoId', controllers.todoController.update);
    app.delete('/users/:userId/todos/:todoId', controllers.todoController.destroy);

    // If we don't match any of the routes, serve static content
    app.use(express.static(path.resolve(__dirname, '../public')));
  };

  return moduleExports;
})();