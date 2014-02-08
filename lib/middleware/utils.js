'use strict';

var _ = require('lodash');

module.exports = (function() {
  var moduleExports = {};

  moduleExports.saveAsLastPage = function (req, res, next) {
    req.session.lastPage = req.url;
    next();
  };

  moduleExports.initResponseConfig = function (req, res, next) {
    // This will take care of the flash. It will be carried over unless it is explicitly cleared.
    var responseConfig = req.session.responseConfig = (req.session.responseConfig || {}),
      env = process.env.NODE_ENV;
    responseConfig.content = responseConfig.content || {};
    responseConfig.content.alerts = responseConfig.content.alerts || {};
    responseConfig.content.csrfToken = req.csrfToken();
    responseConfig.content.isAuthenticated = req.isAuthenticated();
    responseConfig.content.user = _.pick(req.user, ['email', 'id']);
    responseConfig.content.isDevEnv = env === 'development';
//    console.log(responseConfig);

    // And continue
    next();
  };


  moduleExports.sendResponse = function(req, res, next) {
    var config = req.session.responseConfig;
    delete req.session.responseConfig;

    if (config.status) {
      res.status(config.status);
    }
    res.format({
      'text/html': function(){
//        console.log('sending text/html');
        res.render(config.template, config.content);
      },
      'application/json': function(){
//        console.log('sending application/json');
        res.send({'content': config.content, 'template': config.template});
      },
      'text/plain': function(){
//        console.log('sending text/plain');
        res.send(config.content);
      }
    });
  };

  return moduleExports;
})();