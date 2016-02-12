/**
 * restrictToSelf - users can't see other users.
 * USER service only!s
 * @param {String} idProp is the key where the user's id can be found. defaults
 * to '_id'.
 *
 * find, get, create, update, remove
 */
export default function restrictToSelf(options = {}) {
  const defaults = {idField: '_id'};
  options = Object.assign({}, defaults, options);

  return function(hook){
    if (hook.params.user) {
      hook.params.query[options.idField] = hook.params.user[options.idField];
    } else {
      throw new Error(`Could not find the user\'s ${options.idField} for the restrictToSelf hook.`);
    }
  };
}
