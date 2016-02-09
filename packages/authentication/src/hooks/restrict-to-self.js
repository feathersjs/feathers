/**
 * restrictToSelf - users can't see other users.
 * USER service only!s
 * @param {String} idProp is the key where the user's id can be found. defaults
 * to '_id'.
 *
 * find, get, create, update, remove
 */
export default function restrictToSelf(idProp = '_id') {
  return function(hook){

    if (hook.params.user) {
      hook.params.query[idProp] = hook.params.user[idProp];
    }

  };
}
