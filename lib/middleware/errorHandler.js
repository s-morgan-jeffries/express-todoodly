var sendResponse = require('./utils').sendResponse,
  env = process.env.NODE_ENV || 'development';

exports = module.exports = function errorHandler(err, req, res, next){
  var config = req.session.responseConfig = (req.session.responseConfig || {});
  config.content = config.content || {};
  config.content.alerts = config.content.alerts || {};

  err.status = err.status || 500;
  // Logging should go here

  // If we're in development, add an alert to the page with the error stack.
  if (env === 'development') {
    config.content.alerts.debug = {
      msg: (err.stack || ''),
      type: 'info'
    };
  }

  // Unless we're in test mode, log the error to the console.
  if (env !== 'test') {
    console.error(err.stack);
  }

  if (err.template) {
    config.template = err.template;
    config.status = err.status;
    return sendResponse(req, res, next);
  }
  // Ideally, I would redirect with the error status code. Unfortunately, that leads to a very unhelpful status page
  // on Chrome. Alternatively, I could set the status code for the next response (to the redirect) to the error code.
  // However, it's sort of counterintuitive to have an error code in response to that (successful) request. So for
  // now, the client will only the default status codes.
  res.redirect(err.redirectTo || '/');
};