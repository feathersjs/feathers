import jwt from 'jsonwebtoken';
import errors from 'feathers-errors';

/**
 * Verifies that a JWT token is valid
 * 
 * @param  {Object} options - An options object
 * @param {String} options.secret - The JWT secret
 */
export default function(options = {}){
  let secret = options.secret;

  return function(hook) {
    const token = hook.params.token;

    if (!token) {
      return Promise.resolve(hook);
    }

    if (!secret) {
      // Try to get the secret from the app config
      const authOptions = hook.app.get('auth');

      if (authOptions && authOptions.token && authOptions.token.secret) {
        secret = authOptions.token.secret;
      }
      else {
        throw new Error('You need to pass `options.secret` to the verifyToken() hook or set `auth.token.secret` it in your config.');
      }
    }

    return new Promise(function(resolve, reject){
      jwt.verify(token, secret, options, function (error, payload) {
        if (error) {
          // Return a 401 if the token has expired or is invalid.
          return reject(new errors.NotAuthenticated(error));
        }
        
        // Attach our decoded token payload to the params
        hook.params.payload = payload;

        resolve(hook);
      });
    });
  };
}
