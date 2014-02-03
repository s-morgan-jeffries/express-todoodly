var express = require('express'),
  app = express(),
  http = require('http'),
  path = require('path'),
//  engine = require('ejs-locals'),
  expressHbs  = require('express3-handlebars'),
  fs = require('fs'),
  passport = require('passport'),
  // Connect middleware to interface with MongoDB
  mongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  locals = require('./config/middlewares/locals');

var config = {
  db: {
    url: 'mongodb://localhost/express-todo'
  }
};

// Sets up the db connection
require('./db');
// Bootstrap models
var modelsPath = path.join(__dirname, 'app/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  // Runs all the model files as scripts
  require(modelsPath + '/' + file);
});

// Even though this saved a variable, the variable didn't do anything. The trick here is that the script
// (./lib/config/pass) configures a module (passport) that's also required in this file. Node's module system preserves
// modules in memory, so the passport module referenced in that script is the same one referenced in this script (not a
// fresh, clean copy).
//var pass = require('./lib/config/pass');
require('./config/passport');

app.set('port', process.env.PORT || 3000);

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


app.use(express.logger('dev'));

// cookieParser should be above session
// If a client sends a request with cookies, there will be a line like this in the header:
//    Cookie: name=value; name2=value2
// What cookieParser does is to add a property to the request object called 'cookies', which is itself an object with
// keys and values representing the ones in the unparsed header.
app.use(express.cookieParser());
//app.use( express.cookieParser());
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
// methodOverride looks for a key ('_method' by default) in the now parsed request body, and if it finds it, it
// replaces the request's method with the value of that property. I guess (?) browser's will only set the method to a
// restricted set of values, and those often don't include DELETE or PUT.
app.use(express.methodOverride());
//app.use( todoController.current_user );


// express/mongo session storage
// This sets up Connect sessions. The only thing passed to the client is a session identifier, and that's passed as a
// signed cookie. Not sure if there's any particular advantage to using MongoDB as opposed to Redis here, other than
// having fewer dependencies. Also not sure if there would be an advantage to using Redis.
app.use(express.session({
  //backburner: Update secret for sessions
  secret: 'MEAN',
  store: new mongoStore({
    url: config.db.url,
    collection: 'sessions'
  })
}));

app.use(flash());


// use passport session
// Now we come to Passport.js.
// For now, the important thing to know is that passport has to be initialized before it's used...
app.use(passport.initialize());
// ... and that only after that initialization (and the configuration of sessions) can session support be enabled.
app.use(passport.session());

// Locals for use in templates
app.use(locals());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ( 'development' == app.get('env')) {
  app.use( express.errorHandler());
}

require('./config/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
