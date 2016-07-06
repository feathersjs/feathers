import errors from 'feathers-errors';

/**
 * Populate the current user associated with the JWT
 */
const defaults = {
  userEndpoint: '/users',
  idField: '_id'
};

export default function(options = {}){
  return function(hook) {
    let id;

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    // If it's an after hook grab the id from the result
    if (hook.type !== 'before') {
      throw new Error(`The 'populateOrRestrict' hook should only be used as a 'before' hook.`);
    }

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    // If we don't have a payload we have to always use find instead of get because we must not return id queries that are unrestricted and we don't want the developer to have to add after hooks.
    let query = Object.assign({}, hook.params.query, options.restrict);

    // Set provider as undefined so we avoid an infinite loop if this hook is
    // set on the resource we are requesting.
    const params = Object.assign({}, hook.params, { provider: undefined });

    if(hook.id !== null && hook.id !== undefined) {
      const id = {};
      id[options.idField] = hook.id;
      query = Object.assign(query, id);
    }

    // Check to see if we have an id from a decoded JWT
    if (hook.params.payload) {
      id = hook.params.payload[options.idField];
    } else {
      if(hook.result) {
        return hook;
      }

      return this.find({ query }, params).then(results => {
        if(results.length >= 1) {
          if(hook.id !== undefined && hook.id !== null) {
            hook.result = results[0];
          } else {
            hook.result = results;
          }
          return hook;
        }
        throw new errors.NotFound(`No record found`);
      }).catch(() => {
        throw new errors.NotFound(`No record found`);
      });
    }

    // If we didn't find an id then just pass through
    if (id === undefined) {
      return Promise.resolve(hook);
    }

    return new Promise(function(resolve){
      hook.app.service(options.userEndpoint).get(id, {}).then(user => {
        // attach the user to the hook for use in other hooks or services
        hook.params.user = user;

        // If it's an after hook attach the user to the response
        if (hook.result) {
          hook.result.data = Object.assign({}, user = !user.toJSON ? user : user.toJSON());

          // remove the id field from the root, it already exists inside the user object
          delete hook.result[options.idField];
        }

        return resolve(hook);
      }).catch(() => {

        if(hook.result) {
          return hook;
        }

        return this.find({ query }, params).then(results => {
          if(results.length >= 1) {
            if(hook.id !== undefined && hook.id !== null) {
              hook.result = results[0];
            } else {
              hook.result = results;
            }
            return hook;
          }

          throw new errors.NotFound(`No record found`);
        }).catch(() => {
          throw new errors.NotFound(`No record found`);
        });
      });
    });
  };
}
