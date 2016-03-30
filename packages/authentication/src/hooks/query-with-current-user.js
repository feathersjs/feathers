const defaults = {
  idField: '_id',
  as: 'userId'
};

export default function(options = {}) {
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'associateCurrentUser' hook should only be used as a 'before' hook.`);
    }

    if (!hook.params.user) {
      if (!hook.params.provider) {
        return hook;
      }

      throw new Error('There is no current user to associate.');
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    const id = hook.params.user[options.idField];

    if (id === undefined) {
      throw new Error(`Current user is missing '${options.idField}' field.`);
    }

    hook.params.query[options.as] = id;
  };
}