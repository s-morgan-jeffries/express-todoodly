var express = require('express'),
  app = express(),
  http = require('http'),
  path = require('path'),
  expressHbs  = require('express3-handlebars'),
  fs = require('fs'),
  passport = require('passport'),
  // Connect middleware to interface with MongoDB
  mongoStore = require('connect-mongo')(express),
//  flash = require('connect-flash'),
  config = require('./config'),
  utils = require('./lib/middleware/utils'),
  errorHandler = require('./lib/middleware/errorHandler'),
  debug = require('./lib/middleware/debug');

// This should be as early as possible
app.use(express.logger('dev'));

// This doesn't have to be early, but it seems to fit here.
app.set('port', process.env.PORT || 3000);

// cookieParser and session middleware should also come early.
// cookieParser should be above session
// If a client sends a request with cookies, there will be a line like this in the header:
//    Cookie: name=value; name2=value2
// What cookieParser does is to add a property to the request object called 'cookies', which is itself an object with
// keys and values representing the ones in the unparsed header.
app.use(express.cookieParser());

// express/mongo session storage
// This sets up Connect sessions. The only thing passed to the client is a session identifier, and that's passed as a
// signed cookie. Not sure if there's any particular advantage to using MongoDB as opposed to Redis here, other than
// having fewer dependencies. Also not sure if there would be an advantage to using Redis.
app.use(express.session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    // Time from last request until expiration (in ms)
    maxAge: 3600000
  },
//connect-mongo options:
//db Database name OR fully instantiated node-mongo-native object
//collection Collection (optional, default: sessions)
//host MongoDB server hostname (optional, default: 127.0.0.1)
//port MongoDB server port (optional, default: 27017)
//username Username (optional)
//password Password (optional)
//auto_reconnect This is passed directly to the MongoDB Server constructor as the auto_reconnect option (optional, default: false).
//ssl Use SSL to connect to MongoDB (optional, default: false).
//url Connection url of the form: mongodb://user:pass@host:port/database/collection. If provided, information in the URL takes priority over the other options.
///////////////////// USE THIS /////////////////////
//  mongoose_connection in the form: someMongooseDb.connections[0] to use an existing mongoose connection. (optional)
///////////////////// USE THIS /////////////////////
//stringify If true, connect-mongo will serialize sessions using JSON.stringify before setting them, and deserialize them with JSON.parse when getting them. (optional, default: true). This is useful if you are using types that MongoDB doesn't support.
  store: new mongoStore({
    url: config.db.url,
    collection: 'sessions'
  })
}));


//app.use(debug.showHeaders);
app.use(debug.showSessionStore);


// Sets up the db connection
require('./config/db');
// Bootstrap models
// Runs all the model files as scripts
var modelsPath = path.join(__dirname, 'app/models');
require(modelsPath);
//fs.readdirSync(modelsPath).forEach(function (file) {
//  // Runs all the model files as scripts
//  require(modelsPath + '/' + file);
//});

// Even though this saved a variable, the variable didn't do anything. The trick here is that the script
// (./lib/config/pass) configures a module (passport) that's also required in this file. Node's module system preserves
// modules in memory, so the passport module referenced in that script is the same one referenced in this script (not a
// fresh, clean copy).
//var pass = require('./lib/config/pass');
require('./config/passport');
// use passport session
// Now we come to Passport.js.
// For now, the important thing to know is that passport has to be initialized before it's used...
app.use(passport.initialize());
// ... and that only after that initialization (and the configuration of sessions) can session support be enabled.
app.use(passport.session());


// Views
app.set('views', __dirname + '/app/views');
var hbs = expressHbs.create({
  // Specify helpers which are only registered on this instance.
//  helpers: {
//    isLoggedIn: function () {
//      return 'FOO!';
//    }
//  },
  defaultLayout: 'layout',
  layoutsDir: 'app/views/layouts',
  partialsDir: 'app/views/partials',
  extname: '.hbs'
});
//app.engine('ejs', engine);
app.engine('hbs', hbs.engine);
//app.set('view engine', 'ejs');
app.set('view engine', 'hbs');
//app.use(express.favicon());

// Body parsing and method override
app.use(express.json());
app.use(express.urlencoded());
// methodOverride looks for a key ('_method' by default) in the now parsed request body, and if it finds it, it
// replaces the request's method with the value of that property. I guess (?) browser's will only set the method to a
// restricted set of values, and those often don't include DELETE or PUT.
app.use(express.methodOverride());

// Flash
// This has to come after sessions.
app.use(express.csrf());

// Sets up responseConfig in the sessions store. This has to come after sessions and csrf.
app.use(utils.initResponseConfig);

// This comes near the end, but still before the static middleware.
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// Error handling should come after almost everything else.
// development only
//if ( 'development' == app.get('env')) {
//  app.use( express.errorHandler());
//}
app.use(errorHandler());

require('./config/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
