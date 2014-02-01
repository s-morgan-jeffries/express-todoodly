var mongoose = require('mongoose'),
  passport = require('passport'),
  auth = require('./middlewares/authorization');

module.exports = function(app) {

  app.get('/', function(req, res, next) {
    res.redirect('/home');
  });

  // Static pages
  var staticPagesController = require('../app/controllers/staticPagesController');
  app.get('/home', staticPagesController.home);
  app.get('/about', staticPagesController.about);

  // Session controller actions
  var sessionController = require('../app/controllers/sessionController')(passport);
  app.get('/signin', sessionController.neu);
  app.post('/sessions', sessionController.create);
  app.delete('/signout', sessionController.destroy);

  // User controller actions
  var userController = require('../app/controllers/userController')(mongoose.model('User'), mongoose);
  app.get('/signup', userController.neu);
  app.post('/users', userController.create);
  app.get('/users/:id', auth.isAuthenticated, auth.user.isAuthorized, userController.show);

  // Todo controller actions
  var todoController = require('../app/controllers/todoController')(mongoose.model('Todo'), mongoose);
//  app.get('/', todoController.index);
  app.post('/create', todoController.create);
  app.get( '/edit/:id', todoController.edit );
  app.post( '/update/:id', todoController.update );
  app.get( '/destroy/:id', todoController.destroy );
};