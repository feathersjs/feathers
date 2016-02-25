/**
 * Add the current user's id to the query params.
 *
 * find, get, update
 */
const defaults = {
  id: '_id',
  idOnResource: 'userId'
};

export default function queryWithUserId(options = {}) {
  options = Object.assign({}, defaults, options);

  return function(hook) {

    if (hook.params.user) {
      hook.params.query[options.idOnResource] = hook.params.user[options.id];
    }

  };
}
