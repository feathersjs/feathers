import errors from 'feathers-errors';

/**
 * Only authenticated users allowed, period! Stops the request from continuing
 * if there is no hook.params.user. The request is allowed if there is no
 * `hook.params.provider` because that would mean the request was internal, and
 * didn't come across any of the providers.
 *
 * find, get, create, update, remove
 */
export default function requireAuth() {
  return function(hook){
    if (!hook.params.user && hook.params.provider) {
      throw new errors.NotAuthenticated('Please include a valid auth token in the Authorization header.');
    }
  };
}
