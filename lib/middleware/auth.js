'use strict';

/*
 *  Generic require login routing middleware
 */

exports.isAuthenticated = function (req, res, next) {
//  console.log('In isAuthenticated');
  if (req.isAuthenticated()) {
    return next();
  }
  // t0d0: Figure out what req.originalUrl is
  // t0d0: Figure out how to route back to correct page on successful login
  var err = new Error('Unauthorized: Must login for access');
  err.status = 401;
  err.redirectTo = '/signin';
  if (req.method === 'GET') {
    req.session.postLoginRedirect = req.originalUrl;
  }
  next(err);
};

exports.isNotAuthenticated = function (req, res, next) {
  if (!(req.isAuthenticated())) {
    return next();
  }
  // t0d0: Figure out what req.originalUrl is
  // t0d0: Figure out how to route back to correct page on successful login
//  if (req.method == 'GET') {
//    req.session.returnTo = req.originalUrl;
//  }
  var err = new Error('Cannot create new account while logged in');
  err.status = 403;
  err.redirectTo = req.session && req.session.lastPage && (req.session.lastPage !== req.url) ? req.session.lastPage : '/';
  next(err);
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  isAuthorized: function (req, res, next) {
//    console.log('In isAuthorized');
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    if (req.params.userId !== req.user.id) {
      // This would be a 403 error, but we're going to handle it without sending an error.
//      req.flash('message', 'Just stop.');
//      req.flash('alertType', 'danger');
//      return res.redirect('/users/' + req.user.id);
//      config.content.alerts.main = {
//        msg: ''
//      };
      var err = new Error('Forbidden');
      err.status = 403;
      err.redirectTo = req.session && req.session.lastPage || '/';
//      return res.redirect(req.session.lastPage);
      return next(err);
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