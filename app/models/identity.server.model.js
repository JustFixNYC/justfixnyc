'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    rollbar = require('rollbar');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
  return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * Identity Schema
 */
var IdentitySchema = new Schema({
  phone: {
    type: String,
    unique: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your phone number'],
    match: [/[0-9]{7}/, 'Please fill a valid phone number'],
    required: true
  },
  password: {
    type: String,
    default: '',
    validate: [validateLocalStrategyPassword, 'Password should be longer']
  },
  salt: {
    type: String
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['tenant', 'advocate', 'admin']
    }],
    default: ['tenant']
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});



/**
 * Hook a pre save method to hash the password, and do user updating things
 * This is pretty nice to have in one spot!
 */
IdentitySchema.pre('save', function(next) {

  // this.fullName = this.firstName + ' ' + this.lastName;

  if (this.password && this.password.length > 6) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();

});

/**
 * Create instance method for hashing a password
 */
IdentitySchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
IdentitySchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
// IdentitySchema.statics.findUniqueUsername = function(username, suffix, callback) {
//   var _this = this;
//   var possibleUsername = username + (suffix || '');
//
//   _this.findOne({
//     username: possibleUsername
//   }, function(err, user) {
//     if (!err) {
//       if (!user) {
//         callback(possibleUsername);
//       } else {
//         return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
//       }
//     } else {
//       callback(null);
//     }
//   });
// };

mongoose.model('Identity', IdentitySchema);
