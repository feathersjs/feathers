import errors from 'feathers-errors';

const defaults = {
  idField: '_id',
  ownerField: 'userId'
};

export default function(options = {}){
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'restrictToOwner' hook should only be used as a 'before' hook.`);
    }

    if (!hook.id) {
      throw new errors.MethodNotAllowed(`The 'restrictToOwner' hook should only be used on the 'get', 'update', 'patch' and 'remove' service methods.`);
    }

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    if (!hook.params.user) {
      // TODO (EK): Add a debugger call to remind the dev to check their hook chain
      // as they probably don't have the right hooks in the right order.
      throw new errors.NotAuthenticated(`The current user is missing. You must not be authenticated.`);
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);
    
    const id = hook.params.user[options.idField];

    if (id === undefined) {
      throw new Error(`'${options.idField} is missing from current user.'`);
    }

    // look up the document and throw a Forbidden error if the user is not an owner
    return new Promise((resolve, reject) => {
      // Set provider as undefined so we avoid an infinite loop if this hook is
      // set on the resource we are requesting.
      const params = Object.assign({}, hook.params, { provider: undefined });

      return this.get(hook.id, params).then(data => {
        if (data.toJSON) {
          data = data.toJSON();
        }
        else if (data.toObject) {
          data = data.toObject();
        }

        let field = data[options.ownerField];

        // Handle nested Sequelize or Mongoose models 
        if (typeof field === 'object') {
          field = field[options.idField];
        }

        if ( field === undefined || field.toString() !== id.toString() ) {
          reject(new errors.Forbidden('You do not have the permissions to access this.'));
        }

        resolve(hook);
      }).catch(reject);
    });
  };
}