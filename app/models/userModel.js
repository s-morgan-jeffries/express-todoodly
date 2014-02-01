'use strict';

// This makes our User model.

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  _ = require('lodash');

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
//  username: {
//    type: String,
//    unique: true,
//    required: true
//  },
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

var validationErrorStatusCode = 422;

var numRounds,
  seedLength;

if (process.env.NODE_ENV === 'production') {
  //t0d0: Figure out acceptable values for numRounds and seedLength
  numRounds = 20;
  seedLength = 50;
} else {
  numRounds = 5;
  seedLength = 10;
}

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

//// This is essentially just a convenience function.
//UserSchema
//  .virtual('userInfo')
//  .get(function () {
//    return { '_id': this._id, 'username': this.username, 'email': this.email };
//  });

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
      err.status = err.status || 500;
      return done(err);
    }
    if(user) {
      err = new Error('The specified email address is already in use');
      err.status = validationErrorStatusCode;
      return done(err);
    }
    done();
  });
};

//var validateUsernameAvailable = function(username, done) {
//  mongoose.models.User.findOne({username: username}, function(err, user) {
//    if(err) {
//      err.status = err.status || 500;
//      return done(err);
//    }
//    if(user) {
//      err = new Error('The specified username is already in use');
//      err.status = validationErrorStatusCode;
//      return done(err);
//    }
//    done();
//  });
//};

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
    err,
    minPasswordLen = 5;

  if (!this.isNew) {
    return next();
  }

//  if (!validatePresenceOf(this.username)) {
//    err = new Error('Missing username');
//    err.status = validationErrorStatusCode;
//    return next(err);
//  }
  if (!validatePresenceOf(this.email)) {
    err = new Error('Missing email');
    err.status = validationErrorStatusCode;
    return next(err);
  }
  if (!isEmail(this.email)) {
    err = new Error('The specified email is invalid.');
    err.status = validationErrorStatusCode;
    return next(err);
  }
  if (!validatePresenceOf(this.password)) {
    err = new Error('Missing password');
    // Give it a bad syntax status code
    err.status = validationErrorStatusCode;
    return next(err);
  }
//  if (!validateLengthOf(this.password, {min: minPasswordLen})) {
//    err = new Error('Password must be at least ' + minPasswordLen + ' characters');
//    // Give it a bad syntax status code
//    err.status = validationErrorStatusCode;
//    return next(err);
//  }
  if (!validatePresenceOf(this.passwordConfirmation)) {
    err = new Error('Missing password confirmation');
    // Give it a bad syntax status code
    err.status = validationErrorStatusCode;
    return next(err);
  }
  if (this.password !== this.passwordConfirmation) {
    err = new Error('Password confirmation does not match password');
    // Give it a bad syntax status code
    err.status = validationErrorStatusCode;
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

  console.log(this.email);
  console.log(this.password);
  console.log(this.passwordConfirmation);

  pendingValidations += 1;
  validateEmailAvailable(this.email, validationDone);
//  pendingValidations += 1;
//  validateUsernameAvailable(this.username, validationDone);
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
  // Authenticate - check if the passwords are the same
  authenticate: function(plainText, done) {
    bcrypt.compare(plainText, this.passwordHash, done);
  }
};

UserSchema.statics = {
  // function signature of done is function(err, salt, hash)
  createPasswordHash: function(password, passwordConfirmation, done) {
    if (password && password === passwordConfirmation) {
      bcrypt.genSalt(numRounds, seedLength, function(err, salt) {
        if (err) {
          err.status = err.status || 500;
          return done(err);
        }
        bcrypt.hash(password, salt, function(err, hash) {
          done(err, salt, hash);
        });
      });
    } else {
      done();
    }
  },

  // function signature of done is function(err, builtUser)
  buildUserFromRaw: function(userProps, done) {
    var User = this,
      password = userProps.password,
      passwordConfirmation = userProps.passwordConfirmation;

    this.createPasswordHash(password, passwordConfirmation, function(err, salt, hash) {
      var builtUser,
        userBuildProps = _.clone(userProps);

      if (err) {
        err.status = err.status || 500;
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