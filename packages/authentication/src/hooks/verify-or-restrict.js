import jwt from 'jsonwebtoken';
import errors from 'feathers-errors';

export default function(options = {}){
  return function(hook) {

    if (hook.type !== 'before') {
      throw new Error(`The 'verifyOrRestrict' hook should only be used as a 'before' hook.`);
    }

    if (hook.method !== 'find' && hook.method !== 'get') {
      throw new Error(`'verifyOrRestrict' should only be used in a find or get hook.`);
    }
    
    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    const token = hook.params.token;

    const authOptions = hook.app.get('auth') || {};

    // Grab the token options here
    options = Object.assign({}, authOptions, authOptions.token, options);

    if (!token) {

      // We have to always use find instead of get because we must not return id queries that are unrestricted and we don't want the developer to have to add after hooks.
      let query = Object.assign({}, hook.params.query, options.restrict);

      // Set provider as undefined so we avoid an infinite loop if this hook is
      // set on the resource we are requesting.
      const params = Object.assign({}, hook.params, { provider: undefined });

      if(hook.id !== null && hook.id !== undefined) {
        const id = {};
        id[options.idField] = hook.id;
        query = Object.assign(query, id);
      }

      return this.find({ query }, params).then(results => {
        if(hook.method === 'get' && Array.isArray(results) && results.length === 1) {
          hook.result = results[0];
          return hook;
        } else {
          hook.result = results;
          return hook;
        }
      }).catch(() => {
        throw new errors.NotFound(`No record found`);
      });

    } else {

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
            // If the user is trying to add a token then it is better to throw and error than let the request go through with a restriction
            return reject(new errors.NotAuthenticated(error));
          }

          // Attach our decoded token payload to the params
          hook.params.payload = payload;

          resolve(hook);
        });
      });
    }
  };
}
