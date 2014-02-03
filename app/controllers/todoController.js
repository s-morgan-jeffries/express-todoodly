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

  moduleExports.create = function(req, res, next) {
    var todo = new todoModel,
      successRedirect = req.body.successRedirect || '/',
      failureRedirect = req.body.failureRedirect || '/';

    todo.content = req.body.content;
    todo.user = req.user;
    todo.save(function(err, savedTodo) {
      if (err) {
        req.flash('message', err.message);
        req.flash('alertType', 'danger');
        res.redirect(failureRedirect);
      }
//      req.flash('message', 'You added that shit!');
//      req.flash('alertType', 'success');
      res.redirect(successRedirect);
    });
  };

  moduleExports.update = function(req, res, next) {
    var successRedirect = req.body.successRedirect || '/',
      failureRedirect = req.body.failureRedirect || '/',
      paramWhitelist = ['isDone', 'content'],
      updateParams = _.pick(req.body, paramWhitelist);

    updateParams.isDone = !!updateParams.isDone;
    todoModel
      .update({_id: req.params.todoId}, updateParams, function(err, numberAffected, raw) {
        if (err) {
          req.flash('message', err.message);
          req.flash('alertType', 'danger');
          res.redirect(failureRedirect);
        }
//        console.log('The number of updated documents was %d', numberAffected);
//        console.log('The raw response from Mongo was ', raw);
//        req.flash('message', 'You updated that shit!');
//        req.flash('alertType', 'success');
        res.redirect(successRedirect);
      });
  };

  moduleExports.destroy = function(req, res, next) {
    var successRedirect = req.body.successRedirect || '/',
      failureRedirect = req.body.failureRedirect || '/';

    todoModel
      .findById(req.params.todoId)
      .remove(function(err, todo) {
        if (err) {
          req.flash('message', err.message);
          req.flash('alertType', 'danger');
          res.redirect(failureRedirect);
        }
//        req.flash('message', 'You deleted that shit!');
//        req.flash('alertType', 'success');
        res.redirect(successRedirect);
      });
  };

  return moduleExports;
};