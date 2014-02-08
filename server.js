var express = require('express'),
  app = express(),
  http = require('http'),
  models = require('./app/models'),
  views = require('./app/views'),
  controllers = require('./app/controllers'),
  db = require('./config/db'),
  routes = require('./config/routes'),
  sessions = require('./config/sessions'),
  passport = require('./config/passport'),
  utils = require('./lib/middleware/utils'),
  errorHandler = require('./lib/middleware/errorHandler'),
  debug = require('./lib/middleware/debug');

// This should be as early as possible
app.use(express.logger('dev'));

// This doesn't have to be early, but it seems to fit here.
app.set('port', process.env.PORT || 3000);

// Initialize the db connection
db.init();

// Initialize models
models.init();

// Initialize controllers
controllers.init();

// Configure views
views.init(app);

// Body parsing and method override
app.use(express.json());
app.use(express.urlencoded());
// methodOverride looks for a key ('_method' by default) in the now parsed request body, and if it finds it, it
// replaces the request's method with the value of that property. I guess (?) browser's will only set the method to a
// restricted set of values, and those often don't include DELETE or PUT.
app.use(express.methodOverride());

// Initialize sessions
sessions.init(app);

// Initialize passport (has to come after sessions)
passport.init(app);

// CSRF (has to come after sessions)
app.use(express.csrf());

// Sets up responseConfig in the sessions store. This has to come after sessions and csrf.
app.use(utils.initResponseConfig);

// Configure the routes
routes.init(app);

// Error handling should come after almost everything else.
app.use(errorHandler());

// Create the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
