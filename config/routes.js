var controllers = require('../app/controllers'),
  auth = require('../lib/middleware/auth'),
  utils = require('../lib/middleware/utils');

module.exports = function(app) {

//  app.get('/', utils.carryFlash, function(req, res, next) {
  app.get('/', function(req, res, next) {
    res.redirect('/home');
  });

  // Static pages
  app.get('/home', utils.saveAsLastPage, controllers.staticPagesController.home);
  app.get('/about', utils.saveAsLastPage, controllers.staticPagesController.about);

  // Session controller actions
  app.get('/signin', utils.saveAsLastPage, controllers.sessionController.neu);
  app.post('/sessions', controllers.sessionController.create);
  app.delete('/signout', controllers.sessionController.destroy);

  // User controller actions
  app.get('/signup', utils.saveAsLastPage, controllers.userController.neu);
  app.post('/users', controllers.userController.create);
  app.get('/users/:userId', auth.isAuthenticated, auth.user.isAuthorized, utils.saveAsLastPage, controllers.userController.show);

  // Todo controller actions
  app.post('/users/:userId/todos', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.create);
  app.patch('/users/:userId/todos/:todoId', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.update);
  app.delete('/users/:userId/todos/:todoId', auth.isAuthenticated, auth.user.isAuthorized, controllers.todoController.destroy);
};