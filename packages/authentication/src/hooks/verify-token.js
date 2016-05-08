import jwt from 'jsonwebtoken';
import errors from 'feathers-errors';

export default function(options = {}){
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'verifyToken' hook should only be used as a 'before' hook.`);
    }

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    const token = hook.params.token;

    if (!token) {
      throw new errors.NotAuthenticated('Authentication token missing.');
    }

    const authOptions = hook.app.get('auth') || {};
    
    // Grab the token options here
    options = Object.assign({}, authOptions.token, options);

    const secret = options.secret;

    if (!secret) {
      throw new Error(`You need to pass 'options.secret' to the verifyToken() hook or set 'auth.token.secret' it in your config.`);
    }

    // Convert the algorithm value to an array
    if (options.algorithm) {
      options.algorithms = [options.algorithm];
      delete options.algorithm;
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
