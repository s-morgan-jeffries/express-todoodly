/*!
 * Connect - errorHandler
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils'),
  fs = require('fs'),
  sendResponse = require('./utils').sendResponse;

// environment

var env = process.env.NODE_ENV || 'development';

/**
 * Error handler:
 *
 * Development error handler, providing stack traces
 * and error message responses for requests accepting text, html,
 * or json.
 *
 * Text:
 *
 *   By default, and when _text/plain_ is accepted a simple stack trace
 *   or error message will be returned.
 *
 * JSON:
 *
 *   When _application/json_ is accepted, connect will respond with
 *   an object in the form of `{ "error": error }`.
 *
 * HTML:
 *
 *   When accepted connect will output a nice html stack trace.
 *
 * @return {Function}
 * @api public
 */


  // Anything that's an error (that you might want to log or debug) should be processed through this.
  // Individual controllers should still set their own alerts - done
  // Controllers will need to provide a redirect URL OR tell the errorHandler how to send the content - done
  // The error handler should log all errors.
  // In development mode, the error handler should add debugging text to the page content. In production mode, it
  // should not.
  // The error handler should finish by redirecting the request or sending the appropriate response.

// Need to set config.content.alerts.debug to this (actually, no, you need to have a template handle that):
//var stack = (err.stack || '')
//  .split('\n').slice(1)
//  .map(function(v){ return '<li>' + v + '</li>'; }).join('');

// Set config.status to err.status

// Still do this:
//if ('test' != env) console.error(err.stack);

// Finish by calling res.redirect(err.redirectTo);

//t0d0: Fix formatting of error messages
exports = module.exports = function errorHandler(){
  return function errorHandler(err, req, res, next){
    var config = req.session.responseConfig = (req.session.responseConfig || {});
    config.content = config.content || {};
    config.content.alerts = config.content.alerts || {};

    config.content.alerts.debug = {
      msg: (err.stack || ''),
      type: 'info'
    };
    config.status = err.status;
//    if (err.status) res.statusCode = err.status;
//    if (res.statusCode < 400) res.statusCode = 500;
    if ('test' != env) {
      console.error(err.stack);
    }
    res.redirect(err.redirectTo);
//    var accept = req.headers.accept || '';
//    // html
//    if (~accept.indexOf('html')) {
//      fs.readFile(__dirname + '/../public/style.css', 'utf8', function(e, style){
//        fs.readFile(__dirname + '/../public/error.html', 'utf8', function(e, html){
//          var stack = (err.stack || '')
//            .split('\n').slice(1)
//            .map(function(v){ return '<li>' + v + '</li>'; }).join('');
//          html = html
//            .replace('{style}', style)
//            .replace('{stack}', stack)
//            .replace('{title}', exports.title)
//            .replace('{statusCode}', res.statusCode)
//            .replace(/\{error\}/g, utils.escape(err.toString()));
//          res.setHeader('Content-Type', 'text/html; charset=utf-8');
//          res.end(html);
//        });
//      });
//      // json
//    } else if (~accept.indexOf('json')) {
//      var error = { message: err.message, stack: err.stack };
//      for (var prop in err) error[prop] = err[prop];
//      var json = JSON.stringify({ error: error });
//      res.setHeader('Content-Type', 'application/json');
//      res.end(json);
//      // plain text
//    } else {
//      res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
//      res.end(err.stack);
//    }
  };
};

/**
 * Template title, framework authors may override this value.
 */

//exports.title = 'Connect';
