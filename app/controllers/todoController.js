var uid = require('express/node_modules/connect/node_modules/uid2');
//var mongoose = require( 'mongoose' );
//var Todo     = mongoose.model( 'Todo' );

module.exports = function(Todo, mongoose) {
  var moduleExports = {};



  moduleExports.index = function ( req, res, next ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;

    Todo.
      find({ user_id : user_id }).
      sort( '-updated_at' ).
      exec( function ( err, todos ){
//      console.log('Found todos');
        if( err ) return next( err );

        res.render( 'index', {
          title : 'Express Todo Example',
          todos : todos
        });
      });
  };

  moduleExports.create = function ( req, res, next ){
    new Todo({
      user_id    : req.cookies.user_id,
      content    : req.body.content,
      updated_at : Date.now()
    }).save( function ( err, todo, count ){
        if( err ) return next( err );

        res.redirect( '/' );
      });
  };

  moduleExports.destroy = function ( req, res, next ){
    Todo.findById( req.params.id, function ( err, todo ){
      var user_id = req.cookies ?
        req.cookies.user_id : undefined;

      if( todo.user_id !== req.cookies.user_id ){
        var err = new Error("Forbidden");
        err.statusCode = 403;
        return next(err);
      }

      todo.remove( function ( err, todo ){
        if( err ) return next( err );

        res.redirect( '/' );
      });
    });
  };

  moduleExports.edit = function( req, res, next ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;

    Todo.
      find({ user_id : user_id }).
      sort( '-updated_at' ).
      exec( function ( err, todos ){
        if( err ) return next( err );

        res.render( 'edit', {
          title   : 'Express Todo Example',
          todos   : todos,
          current : req.params.id
        });
      });
  };

  moduleExports.update = function( req, res, next ){
    Todo.findById( req.params.id, function ( err, todo ){
      var user_id = req.cookies ?
        req.cookies.user_id : undefined;

      if( todo.user_id !== user_id ){
//      return utils.forbidden( res );
        var err = new Error("Forbidden");
        err.statusCode = 403;
        return next(err);
      }

      todo.content    = req.body.content;
      todo.updated_at = Date.now();
      todo.save( function ( err, todo, count ){
        if( err ) return next( err );

        res.redirect( '/' );
      });
    });
  };

// ** express turns the cookie key to lowercase **
  moduleExports.current_user = function ( req, res, next ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;
    if( !user_id ){
      res.cookie( 'user_id', uid( 32 ));
    }
    next();
  };

  return moduleExports;
};