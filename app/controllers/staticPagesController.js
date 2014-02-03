'use strict';

module.exports = function(Todo) {
  var moduleExports = {};

  moduleExports.home = function(req, res, next) {
    var context = {};

    if (req.isAuthenticated()) {
      Todo.
        find({user: req.user}).
        sort('-createdAt').
        exec(function(err, todos) {
          if (err) {
            return next(err);
          }
          context.todos = todos;
          console.log(todos);
          context.todoCreateSuccessRedirect = '/';
          context.todoCreateFailureRedirect = '/';
          context.todoUpdateSuccessRedirect = '/';
          context.todoUpdateeFailureRedirect = '/';
          context.todoDestroySuccessRedirect = '/';
          context.todoDestroyFailureRedirect = '/';
          res.render('staticPages/home', context);
        });
    // Technically, this else isn't necessary, but it's more explicit and makes the logic clearer.
    } else {
      // Also leaving out the context argument here for clarity.
      res.render('staticPages/home');
    }
  };

  moduleExports.about = function(req, res, next) {
    res.render('staticPages/about');
  };

  return moduleExports;
};