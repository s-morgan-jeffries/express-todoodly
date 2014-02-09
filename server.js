var express = require('express'),
  app = express(),
  http = require('http'),
  models = require('./app/models'),
  views = require('./app/views'),
  controllers = require('./app/controllers'),
  db = require('./config/db'),
  routes = require('./config/routes'),
  logger = require('./config/logger'),
  sessions = require('./config/sessions'),
  bodyParser = require('./config/bodyParser'),
  passport = require('./config/passport'),
  initResponseConfig = require('./lib/middleware/utils').initResponseConfig,
  errorHandler = require('./lib/middleware/errorHandler'),
  debug = require('./lib/middleware/debug'),
  DEFAULT_PORT = 3000;


//////////////////// Initialization/Configuration ////////////////////
// Initialize the db connection, models, and controllers
db.init();
models.init();
controllers.init();

// Configure views
views.config(app);

// Set the port
app.set('port', process.env.PORT || DEFAULT_PORT);
//////////////////// Initialization/Configuration ////////////////////


//////////////////// Middleware stack ////////////////////
// Logging (should be as early as possible). I've moved this into a config module in case I want to modify it later.
app.use(logger());

// Body parsing and method override
app.use(bodyParser());

// Session middleware (includes cookieParser and session)
app.use(sessions());

// CSRF (has to come after sessions)
app.use(express.csrf());

// Passport.js (has to come after sessions). Calling the function initializes Passport and returns a piece of middleware
// that internally delegates to passport.initialize() and passport.sessions().
app.use(passport());

// Sets up responseConfig in the sessions store. This has to come after sessions, csrf, and passport.
app.use(initResponseConfig);

// Configure the routes (dynamic routes are served preferentially over static content)
app.use(routes(app));

// Error handling should come at the bottom of the stack.
app.use(errorHandler);
//////////////////// Middleware stack ////////////////////


//////////////////// Server creation ////////////////////
// Create the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
//////////////////// Server creation ////////////////////