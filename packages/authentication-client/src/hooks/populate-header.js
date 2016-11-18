/*
 * Sets the access token in the authorization header
 * under hook.params.header so that it can be picked
 * up by the client side REST libraries.
 */

export default function populateHeader (options = {}) {
  if (!options.header) {
    throw new Error(`You need to pass 'options.header' to the populateHeader() hook.`);
  }

  return function (hook) {
    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'populateHeader' hook should only be used as a 'before' hook.`));
    }

    if (hook.params.accessToken) {
      hook.params.headers = Object.assign({}, {
        [options.header]: options.prefix ? `${options.prefix} ${hook.params.accessToken}` : hook.params.accessToken
      }, hook.params.headers);
    }

    return Promise.resolve(hook);
  };
}
