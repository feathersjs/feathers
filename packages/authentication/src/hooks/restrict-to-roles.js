import errors from 'feathers-errors';

const defaults = {
  fieldName: 'roles',
  idField: '_id',
  ownerField: 'userId',
  owner: false
};

export default function(options = {}){
  if (!options.roles || !options.roles.length) {
    throw new Error(`You need to provide an array of 'roles' to check against.`);
  }

  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'restrictToRoles' hook should only be used as a 'before' hook.`);
    }

    if (!hook.id) {
      throw new Error(`The 'restrictToRoles' hook should only be used on the 'get', 'update', 'patch' and 'remove' service methods.`);
    }

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    if (!hook.params.user) {
      // TODO (EK): Add a debugger call to remind the dev to check their hook chain
      // as they probably don't have the right hooks in the right order.
      throw new errors.NotAuthenticated();
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    let authorized = false;
    let roles = hook.params.user[options.fieldName];
    const id = hook.params.user[options.idField];
    const error = new errors.Forbidden('You do not have valid permissions to access this.');

    if (id === undefined) {
      throw new Error(`'${options.idField} is missing from current user.'`);
    }

    // If the user doesn't even have a `fieldName` field and we're not checking
    // to see if they own the requested resource return Forbidden error
    if (!options.owner && roles === undefined) {
      throw error;
    }

    // If the roles is not an array, normalize it
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    // Iterate through all the roles the user may have and check
    // to see if any one of them is in the list of permitted roles.
    authorized = roles.some(role => options.roles.indexOf(role) !== -1);

    // If we should allow users that own the resource and they don't already have
    // the permitted roles check to see if they are the owner of the requested resource
    if (options.owner && !authorized) {
      // look up the document and throw a Forbidden error if the user is not an owner
      return new Promise((resolve, reject) => {
        // Set provider as undefined so we avoid an infinite loop if this hook is
        // set on the resource we are requesting.
        const params = Object.assign({}, hook.params, { provider: undefined });

        this.get(hook.id, params).then(data => {
          if (data.toJSON) {
            data = data.toJSON();
          }
          else if (data.toObject) {
            data = data.toObject();
          }

          const field = data[options.ownerField];

          if ( field === undefined || field.toString() !== id.toString() ) {
            reject(new errors.Forbidden('You do not have the permissions to access this.'));
          }

          resolve(hook);
        }).catch(reject);
      });
    }

    if (!authorized) {
      throw error;
    }
  };
}