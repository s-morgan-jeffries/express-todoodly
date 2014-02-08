var expressHbs  = require('express3-handlebars');

module.exports = (function() {
  var moduleExports = {};

  moduleExports.init = function(app) {
    app.set('views', __dirname);
    var hbs = expressHbs.create({
      // Specify helpers which are only registered on this instance.
//      helpers: {
//        isLoggedIn: function () {
//          return 'FOO!';
//        }
//      },
      defaultLayout: 'layout',
      layoutsDir: 'app/views/layouts',
      partialsDir: 'app/views/partials',
      extname: '.hbs'
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
  };

  return moduleExports;
})();