'use strict';

// Fields you need:
  // Template
  // Status (defaults to 200)
  // Content - MUST NOT CONTAIN INSECURE DATA (will be going to client)
    // Anything currently in content
    // Anything in locals
      // res.locals.isAuthenticated = req.isAuthenticated();
          // req.session.responseConfig =
          // SPA client shouldn't need this, AJAX might(?), but should be okay to send
      // res.locals.user = req.user;
          // If you're going to make an SPA, you'll have to send this regardless.
      // res.locals.flash
          // Rename this to alerts and break it down a little more:
              // alerts = {location: {msg: 'message', type: 'alertType'}}
      // res.locals.csrfToken = req.csrfToken();

//// This will take care of the flash. It will be carried over unless it is explicitly cleared.
//var responseConfig = req.session.responseConfig = (req.session.responseConfig || {});
//responseConfig.content.csrfToken = req.csrfToken();
//responseConfig.content.isAuthenticated = req.isAuthenticated();
//responseConfig.content.user = req.user;

module.exports = (function() {
  var moduleExports = {};

  moduleExports.isEmail = function(email) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
  };

  return moduleExports;

})();