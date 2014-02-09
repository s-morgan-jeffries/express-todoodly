'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  _ = require('lodash'),
  statusCodes = require('../../config/statusCodes'),
  minPasswordLen = 5,
  numRounds,
  seedLength,
  UserSchema;

if (process.env.NODE_ENV === 'production') {
  //t0d0: Figure out acceptable values for numRounds and seedLength
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
    required: true,
    lowercase: true
  },
  passwordHash: {
    type: String
//    required: true
  },
  passwordSalt: {
    type: String
//    required: true
  }
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


UserSchema
  .virtual('passwordConfirmation')
  .set(function(passwordConfirmation) {
    this._passwordConfirmation = passwordConfirmation;
  })
  .get(function() {
    return this._passwordConfirmation;
  });

/**
 * Validations
 */

// Validations are explained here: http://mongoosejs.com/docs/validation.html
var validatePresenceOf = function (value) {
  return value && value.length;
};

var validateLengthOf = function (value, len) {
  return value && (len.min ? value.length >= len.min : true) && (value.max ? value.length <= len.max : true);
};

var isEmail = function(email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
};

var validateEmailAvailable = function(email, done) {
  mongoose.models.User.findOne({email: email}, function(err, user) {
    if(err) {
      err.status = err.status || statusCodes.SERVER_ERROR_STATUS;
      return done(err);
    }
    if(user) {
      err = new Error('The specified email address is already in use');
      err.status = statusCodes.VALIDATION_ERROR_STATUS;
      err.field = 'email';
      return done(err);
    }
    done();
  });
};

/**
 * Pre-save hook
 */
// Hooking capabilities provided by hooks-js (https://github.com/bnoguchi/hooks-js). There's no pre-defined set of
// events to hook on; it's determined by the methods in your object.

// This checks to see if the password exists. It doesn't check whether the password is long enough.
UserSchema.pre('validate', function(next) {
  var pendingValidations = 0,
    allValidationsSubmitted = false,
    isInvalid = false,
    err;

  // backburner: Figure out the deal with not validating unless this.isNew
  if (!this.isNew) {
    return next();
  }

  if (!validatePresenceOf(this.email)) {
    err = new Error('Missing email');
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'email';
    return next(err);
  }
  if (!isEmail(this.email)) {
    err = new Error('The specified email is invalid.');
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'email';
    return next(err);
  }
  if (!validatePresenceOf(this.password)) {
    err = new Error('Missing password');
    // Give it a bad syntax status code
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'password';
    return next(err);
  }
  if (!validateLengthOf(this.password, {min: minPasswordLen})) {
    err = new Error('Password must be at least ' + minPasswordLen + ' characters');
    // Give it a bad syntax status code
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'password';
    return next(err);
  }
  if (!validatePresenceOf(this.passwordConfirmation)) {
    err = new Error('Missing password confirmation');
    // Give it a bad syntax status code
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'passwordConfirmation';
    return next(err);
  }
  if (this.password !== this.passwordConfirmation) {
    err = new Error('Password confirmation does not match password');
    // Give it a bad syntax status code
    err.status = statusCodes.VALIDATION_ERROR_STATUS;
    err.field = 'passwordConfirmation';
    return next(err);
  }
  // asynchronous validations
  var validationDone = function(err) {
    pendingValidations -= 1;
    if (isInvalid) {
      return;
    }
    if (err) {
      return next(err);
    }
    if (allValidationsSubmitted && !pendingValidations) {
      return next();
    }
  };

  pendingValidations += 1;
  validateEmailAvailable(this.email, validationDone);
  allValidationsSubmitted = true;

  if (allValidationsSubmitted && !pendingValidations) {
    return next();
  }
});

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
      password = userProps.password,
      passwordConfirmation = userProps.passwordConfirmation;

    // NB: I'm not comparing password to passwordConfirmation here because I think it's slightly clearer to have all the
    // validations done in one place (the pre-save hook, above).

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