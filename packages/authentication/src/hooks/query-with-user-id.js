/**
 * Add the current user's id to the query params.
 *
 * find, get, update
 */
export default function queryWithUserId(id = '_id', idOnResource = 'userId') {
  return function(hook) {
    if (hook.params.user) {
      hook.params.query[idOnResource] = hook.params.user[id];
    } else {
      throw new Error('There is no user logged in.');
    }
  };
}
