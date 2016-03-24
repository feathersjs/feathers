const defaults = {
  idField: '_id',
  as: 'userId'
};

export default function(options = {}){
  return function(hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'associateCurrentUser' hook should only be used as a 'before' hook.`);
    }

    if (!hook.params.user) {
      throw new Error('There is no current user to associate.');
    }

    options = Object.assign({}, defaults, hook.app.get('auth'), options);

    const id = hook.params.user[options.idField];

    if (id === undefined) {
      throw new Error(`Current user is missing '${options.idField}' field.`);
    }

    function setId(obj){
      obj[options.as] = id;
    }

    // Handle arrays.
    if (Array.isArray(hook.data)) {
      hook.data.forEach(setId);
    }
    // Handle single objects.
    else {
      setId(hook.data);
    }
  };
}