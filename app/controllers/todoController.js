'use strict';

var _ = require('lodash');

//HTTP Verb	Path	Action	Used for
//  GET	/photos	index	display a list of all photos
//GET	/photos/new	new	return an HTML form for creating a new photo
//POST	/photos	create	create a new photo
//GET	/photos/:id	show	display a specific photo
//GET	/photos/:id/edit	edit	return an HTML form for editing a photo
//PATCH/PUT	/photos/:id	update	update a specific photo
//DELETE	/photos/:id	destroy	delete a specific photo

module.exports = function(todoModel) {
  var moduleExports = {};

  // Add a todo
  moduleExports.create = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};
    
    var todo = new todoModel;

    todo.content = req.body.content;
    todo.user = req.user;
    todo.save(function(err, savedTodo) {
      if (err) {
        config.content.alerts.main = {
          msg: err.message,
          type: 'danger'
        };
        err.status = err.status || 500;
        err.redirectTo = req.session && req.session.lastPage || '/';
        return next(err);
      }
      config.content.alerts.main = {
        msg: 'You created that shit!',
        type: 'success'
      };
      res.redirect(req.session.lastPage);
    });
  };

  // Update a todo (e.g. mark as done)
  moduleExports.update = function(req, res, next) {
    var paramWhitelist = ['isDone', 'content'],
      updateParams = _.pick(req.body, paramWhitelist);
    updateParams.isDone = !!updateParams.isDone;

    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    todoModel
      .update({_id: req.params.todoId}, updateParams, function(err, numberAffected, raw) {
        if (err) {
          config.content.alerts.main = {
            msg: err.message,
            type: 'danger'
          };
          err.status = err.status || 500;
          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }
        res.redirect(req.session.lastPage);
      });
  };

  // Delete a todo
  moduleExports.destroy = function(req, res, next) {
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    todoModel
      .findById(req.params.todoId)
      .remove(function(err, todo) {
        if (err) {
          config.content.alerts.main = {
            msg: err.message,
            type: 'danger'
          };
          err.status = err.status || 500;
          err.redirectTo = req.session && req.session.lastPage || '/';
          return next(err);
        }
        res.redirect(req.session.lastPage);
      });
  };

  return moduleExports;
};