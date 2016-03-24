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
      // NOTE (EK): This just scopes the query for the resource requested to the
      // current user, which will result in a 404 if they are not the owner.
      hook.params.query[options.ownerField] = id;
      authorized = true;
      
      // TODO (EK): Maybe look up the actual document in this hook and throw a Forbidden error
      // if (field && id && field.toString() !== id.toString()) {
      //   throw new errors.Forbidden('You do not have valid permissions to access this.');
      // }
    }

    if (!authorized) {
      throw error;
    }
  };
}