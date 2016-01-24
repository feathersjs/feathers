import errors from 'feathers-errors';

/**
 * Only authenticated users allowed, period! Stops the request from continuing
 * if there is no hook.params.user.
 *
 * find, get, create, update, remove
 */
export default function requireAuth() {
  return function(hook){
    if (!hook.params.user) {
      throw new errors.NotAuthenticated('Please include a valid auth token in the Authorization header.');
    }
  };
}
