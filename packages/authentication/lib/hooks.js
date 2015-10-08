var bcrypt = require('bcrypt');
var Errors = require('feathers').errors.types;

/**
 * A function that generates a feathers hook that replaces a password located
 * at the provided passwordField with a hash of the password.
 * @param  {String} passwordField  The field containing the password.
 * @return {function}   The hashPassword feathers hook.
 */
exports.hashPassword = function(passwordField){
  // If it's called directly as a hook, assume the passwordField was 'password'.
  if(typeof arguments[0] === 'object'){
    console.log('Running hashPassword hook assuming passwordField of "password"');
    var hook = arguments[0];
    var next = arguments[1];
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(hook.data.password, salt, function(err, hash) {
        hook.data.password = hash;
        return next();
      });
    });

  // otherwise it was run as a function at execution.
  } else {
    passwordField = passwordField || 'password';
    return function(hook, next) {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(hook.data[passwordField], salt, function(err, hash) {
          hook.data[passwordField] = hash;
          return next();
        });
      });
    };  
  }
};

/**
 * Only authenticated users allowed, period!
 *
 * find, get, create, update, remove
 */
exports.requireAuth = function (hook, next) {
  // Allow user to view records without a userID.
  if (!hook.params.user) {
    return next(new Errors.NotAuthenticated('Please include a valid auth token in the Authorization header.'));
  } else {
    return next(null, hook);
  }
};


/**
 * Set the userID as the owner.
 *
 * find, get, create, update, remove
 */
exports.setOwner = function (hook, next) {
  hook.params.query.userID = hook.params.user._id;
  return next(null, hook);
};


/**
 * Checks that the action is performed by an admin or owner of the userID.
 *
 * find, get, create, update, remove
 */
exports.verifyOwnership = function (hook, next) {
  if (hook.params.user.admin) {
    hook.params.query.userID = hook.params.user._id;
  }
  return next(null, hook);
};


/**
 * Set the userID as the owner.
 *
 * find, get, create, update, remove
 */
exports.setOwnerIfNotAdmin = function (hook, next) {
  if (!hook.params.user.admin) {
    hook.params.query.userID = hook.params.user._id;
  }
  return next(null, hook);
};


/**
 * restrictToSelf - non-admins can't see other users.
 * USER service only!
 *
 * find, get, create, update, remove
 */
exports.restrictToSelf = function (hook, next) {
  if (!hook.params.user.admin) {
    hook.params.query._id = hook.params.user._id;
  }
  return next(null, hook);
};


/**
 * Stop
 *
 * find, get, create, update, remove
 */
exports.stop = function (hook, next) {
  return next(new Errors.Forbidden('Safety check. We just stopped you from blowing things up.'));
};

/**
 * lowercaseEmail
 * If email is passed in, lowercase it for consistent logins.
 *
 * update
 */
exports.lowercaseEmail = function (hook, next) {

  // Allow user to view records without a userID.
  if (hook.data.email) {
    hook.data.email = hook.data.email.toLowerCase();
  }
  return next(null, hook);
};


/**
 * Authenticated users can have their own records (with userID),
 * and non-authenticated users can view records without a userID.
 *
 * find, get, create, update, remove
 */
exports.requireAuthForPrivate = function(hook, next){

  // If no user, limit to public records (no userID)
  if (!hook.params.user) {
    hook.params.query.userID = null;
    return next();
  }

  return next(null, hook);
};


/**
 * Set up the userID on data.
 *
 * create
 */
exports.setUserID = function(hook, next){

  // If a user is logged in, set up the userID on the data.
  if (hook.params && hook.params.user && !hook.data.userID) {
    hook.data.userID = hook.params.user._id;
  }
  return next(null, hook);
};


/**
 * If the user is not an admin, remove any admin attribute.  This prevents
 * unauthorized users from setting other users up as administrators.
 * This typically would be used on a user-type service.
 *
 * create, update
 */
exports.requireAdminToSetAdmin = function(hook, next){

  // If not logged in or logged in but not an admin,
  if (hook.params.user && !hook.params.user.admin) {

    // delete admin before save.
    delete hook.data.admin;
  }

  return next(null, hook);
};

/**
 * Log a hook to the console for debugging.
 * before or after
 *
 * find, get, create, update, delete
 */
exports.log = function(hook, next){
  console.log(hook);
  return next(null, hook);
};
exports.logData = function(hook, next){
  console.log(hook.data);
  return next(null, hook);
};
exports.logParams = function(hook, next){
  console.log(hook.params);
  return next(null, hook);
};
