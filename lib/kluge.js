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

  var userProps = {
    email: 's.morgan.jeffries@gmail.com',
    password: 'password',
    passwordConfirmation: 'password'
  };

  moduleExports.mongoose = mongoose;
  var User = moduleExports.User = mongoose.model('User');
  var Todo = moduleExports.Todo = mongoose.model('Todo');

  var getUser = moduleExports.getUser = function(done) {
    User.findOne({email: userProps.email}, function(e, u) {
      if (e) {
        moduleExports.err = e;
        console.log(e);
      }
      moduleExports.user = u;
      if (done) {
        done(e, u);
      }
    });
  };

  moduleExports.addTodo = function(todoContent, options, done) {
    var todo, user;

    if (typeof options === 'function') {
      done = options;
      options = undefined;
    }
    options = options || {};

    var addTodoForUser = function() {
      todo = new Todo;
      todo.content = todoContent;
      todo.user = user;
      todo.save(function(e, t) {
        if (e) {
          moduleExports.err = e;
          console.log(e);
        }
        moduleExports.todo = t;
        if (done) {
          done(e, t);
        }
      });
    };

    user = options.user || moduleExports.user;
    if (!(user && user.id)) {
      if (!user) {
        user = userProps;
      }
      getUser(function(e, u) {
        user = u;
        addTodoForUser();
      });
    } else {
      addTodoForUser();
    }
  };

  var findTodos = moduleExports.findTodos = function(user) {

    var findTodosForUser = function() {
      Todo.
        find({ user : user }).
        sort( '-createdAt' ).
        exec(function(err, todos) {
          if (err) {
            console.log(err);
            moduleExports.err = err;
          }
          console.log(todos);
        });
    };

    user = user || moduleExports.user;
    if (!(user && user.id)) {
      if (!user) {
        user = userProps;
      }
      getUser(function(e, u) {
        user = u;
        findTodosForUser();
      });
    } else {
      findTodosForUser();
    }
  };

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