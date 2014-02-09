'use strict';

var express = require('express'),
  mongoStore = require('connect-mongo')(express),
  db = require('./db');

module.exports = function() {
//  var moduleExports = {};

  var cookieParser = express.cookieParser();

  var session = express.session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      // Time from last request until expiration (in ms)
      maxAge: 3600000
    },
    // connect-mongo options:
    // db Database name OR fully instantiated node-mongo-native object
    // collection Collection (optional, default: sessions)
    // host MongoDB server hostname (optional, default: 127.0.0.1)
    // port MongoDB server port (optional, default: 27017)
    // username Username (optional)
    // password Password (optional)
    // auto_reconnect This is passed directly to the MongoDB Server constructor as the auto_reconnect option
    //    (optional, default: false).
    // ssl Use SSL to connect to MongoDB (optional, default: false).
    // url Connection url of the form: mongodb://user:pass@host:port/database/collection. If provided, information
    //    in the URL takes priority over the other options.
    // mongoose_connection in the form: someMongooseDb.connections[0] to use an existing mongoose connection.
    //    (optional)
    // stringify If true, connect-mongo will serialize sessions using JSON.stringify before setting them, and
    //    deserialize them with JSON.parse when getting them. (optional, default: true). This is useful if you are
    //    using types that MongoDB doesn't support.
    store: new mongoStore({
      url: db.url,
      collection: 'sessions'
    })
  });

  // This is a pattern for gluing together multiple middleware functions into a single piece of middleware.
  var fn = function(req, res, next) {
    cookieParser(req, res, function(err) {
      if (err) {
        return next(err);
      }
      session(req, res, next);
    });
  };

  return fn;

//  moduleExports.init = function(app) {
//    // cookieParser should be above session
//    // If a client sends a request with cookies, there will be a line like this in the header:
//    //    Cookie: name=value; name2=value2
//    // What cookieParser does is to add a property to the request object called 'cookies', which is itself an object with
//    // keys and values representing the ones in the unparsed header.
//    app.use(express.cookieParser());
//
//    // express/mongo session storage
//    // This sets up Connect sessions. The only thing passed to the client is a session identifier, and that's passed as
//    // a signed cookie. Not sure if there's any particular advantage to using MongoDB as opposed to Redis here, other
//    // than having fewer dependencies. Also not sure if there would be an advantage to using Redis.
//    app.use(express.session({
//      secret: process.env.SESSION_SECRET,
//      cookie: {
//        // Time from last request until expiration (in ms)
//        maxAge: 3600000
//      },
//      // connect-mongo options:
//        // db Database name OR fully instantiated node-mongo-native object
//        // collection Collection (optional, default: sessions)
//        // host MongoDB server hostname (optional, default: 127.0.0.1)
//        // port MongoDB server port (optional, default: 27017)
//        // username Username (optional)
//        // password Password (optional)
//        // auto_reconnect This is passed directly to the MongoDB Server constructor as the auto_reconnect option
//        //    (optional, default: false).
//        // ssl Use SSL to connect to MongoDB (optional, default: false).
//        // url Connection url of the form: mongodb://user:pass@host:port/database/collection. If provided, information
//        //    in the URL takes priority over the other options.
//        // mongoose_connection in the form: someMongooseDb.connections[0] to use an existing mongoose connection.
//        //    (optional)
//        // stringify If true, connect-mongo will serialize sessions using JSON.stringify before setting them, and
//        //    deserialize them with JSON.parse when getting them. (optional, default: true). This is useful if you are
//        //    using types that MongoDB doesn't support.
//      store: new mongoStore({
//        url: db.url,
//        collection: 'sessions'
//      })
//    }));
//  };
//
//  return moduleExports;
};