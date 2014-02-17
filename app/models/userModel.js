'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  _ = require('lodash'),
  statusCodes = require('../../config/statusCodes'),
  validator = require('../../lib/validator'),
  minPasswordLen = 5,
  numRounds,
  seedLength,
  UserSchema,
  TodoModel;

if (process.env.NODE_ENV === 'production') {
  numRounds = 10;
  seedLength = 20;
} else {
  numRounds = 5;
  seedLength = 10;
}

UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: 'Must provide an email',
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  todos: [{
    type: Schema.ObjectId,
    ref: 'Todo'
  }]
//  name: String,
//  admin: Boolean,
//  guest: Boolean,
//  provider: String
});

/**
 * Virtuals
 */
// Under the hood, virtuals are properties of a model constructor's prototype (so User.prototype in this case). Can't
// remember how to set property descriptors, but you can get them via Object.getOwnPropertyDescriptor(obj, prop).

// This creates a virtual 'password' property. Because of how the setter works, passing an object with a 'password'
// property to the User constructor will automatically give you a hash and salt. Since it's virtual, though, this won't
// be persisted in the database.
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
  })
  .get(function() {
    return this._password;
  });

/**
 * Validations
 */


// Email
// Required (built-in)
// Is email
UserSchema.path('email').validate(function(val) {
  return validator.isEmail(val);
}, 'Must provide a valid email');
// Is not registered
UserSchema.path('email').validate(function(val, done) {
  mongoose.models.User.findOne({email: val}, function(err, user) {
    // If a user is found, the email is taken, and this email is invalid
    done(!user);
  });
}, 'Provided email is in use');
// Password
UserSchema.path('passwordHash').validate(function(val) {
  // Minimum length
  if (this._password) {
    if (!validator.isLength(this._password, minPasswordLen)) {
      this.invalidate('password', 'Password must be at least ' + minPasswordLen + ' characters.');
    }
  }
  // Required
//  // backburner: Figure out the deal with not validating unless this.isNew
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Must provide a password');
  }
}, null);

/**
 * Methods
 */

// See these:
// http://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage
// http://en.wikipedia.org/wiki/Scrypt
// https://npmjs.org/package/scrypt
//https://npmjs.org/package/passport-local-mongoose
// These are instance methods. Class methods can be created with Schema#statics.
UserSchema.methods = {
  // Check if the supplied password matches the stored one
  checkPassword: function(plainText, done) {
    bcrypt.compare(plainText, this.passwordHash, done);
  }
};
// Just for practice, this is a self-defining function
UserSchema.methods.findTodos = function(done) {
  // Set the value of TodoModel if it doesn't exist
  if (!TodoModel) {
    TodoModel = mongoose.model('Todo');
  }
  // Redefine the function
  this.findTodos = function(done) {
    return TodoModel.find({user: this._id}, done);
  };
  // Call the function
  return this.findTodos(done);
};

UserSchema.statics = {
  // function signature of done is function(err, salt, hash)
  createPasswordHash: function(password, done) {
    // Creating the hash requires two steps, performed asynchronously. First we generate a salt.
    bcrypt.genSalt(numRounds, seedLength, function(err, salt) {
      if (err) {
        err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
        return done(err);
      }
      // Then we hash the password with the salt.
      bcrypt.hash(password, salt, function(err, hash) {
        done(err, salt, hash);
      });
    });
  },

  // function signature of done is function(err, builtUser)
  buildUserFromRaw: function(userProps, done) {
    var User = this,
      password = userProps.password;

    this.createPasswordHash(password, function(err, salt, hash) {
      var builtUser,
        userBuildProps = _.clone(userProps);

      if (err) {
        err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
        return done(err);
      }
      userBuildProps.passwordSalt = salt;
      userBuildProps.passwordHash = hash;
      builtUser = new User(userBuildProps);
      done(null, builtUser);
    });
  }
};

mongoose.model('User', UserSchema);