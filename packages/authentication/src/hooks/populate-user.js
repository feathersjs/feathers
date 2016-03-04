/**
 * Populate the current user associated with the JWT
 */
const defaults = {
  userEndpoint: '/users',
  passwordField: 'password',
  idField: '_id'
};

export default function(options = {}){
  return function(hook) {
    // Try to get auth options from the app config
    const authOptions = hook.app.get('auth');

    options = Object.assign({}, defaults, authOptions, options);

    // If we already have a current user just pass through
    if (hook.params.user) {
      return Promise.resolve(hook);
    }

    let id;

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

          // format response
          delete hook.result[options.idField];
          delete hook.result.data[options.passwordField];
        }

        return resolve(hook);
      }).catch(reject);
    });
  };
}
