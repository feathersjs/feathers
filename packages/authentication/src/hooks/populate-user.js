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
    if (hook.type === 'after') {
      id = hook.result[options.idField];
    }
    // Check to see if we have an id from a decoded JWT
    else if (hook.params.payload) {
      id = hook.params.payload[options.idField];
    }

    // If we didn't find an id then just pass through
    if (id === undefined) {
      return Promise.resolve(hook);
    }

    return new Promise(function(resolve, reject){
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
      }).catch(reject);
    });
  };
}
