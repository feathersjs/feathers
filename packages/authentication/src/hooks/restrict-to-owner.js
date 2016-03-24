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

    // NOTE (EK): This just scopes the query for the resource requested to the
    // current user, which will result in a 404 if they are not the owner.
    hook.params.query[options.ownerField] = id;
    
    // TODO (EK): Maybe look up the actual document in this hook and throw a Forbidden error
    // if (field && id && field.toString() !== id.toString()) {
    //   throw new errors.Forbidden('You do not have valid permissions to access this.');
    // }
  };
}