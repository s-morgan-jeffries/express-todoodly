'use strict';

/*
 *  Generic require login routing middleware
 */

exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  if (req.method == 'GET') {
    req.session.returnTo = req.originalUrl;
  }
  res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  isAuthorized: function (req, res, next) {
    if (req.params.id !== req.user.id) {
      // This would be a 403 error, but we're going to handle it without sending an error.
      req.flash('message', 'You are not authorized');
      req.flash('alertType', 'danger');
//      console.log(req.flash);
      return res.redirect('/users/' + req.user.id);
    }
    next();
  }
};
//
///*
// *  Article authorization routing middleware
// */
//
//exports.article = {
//  hasAuthorization: function (req, res, next) {
//    if (req.article.user.id != req.user.id) {
//      req.flash('info', 'You are not authorized')
//      return res.redirect('/articles/' + req.article.id)
//    }
//    next()
//  }
//}
//
///**
// * Comment authorization routing middleware
// */
//
//exports.comment = {
//  hasAuthorization: function (req, res, next) {
//    // if the current user is comment owner or article owner
//    // give them authority to delete
//    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
//      next()
//    } else {
//      req.flash('info', 'You are not authorized')
//      res.redirect('/articles/' + req.article.id)
//    }
//  }
//}