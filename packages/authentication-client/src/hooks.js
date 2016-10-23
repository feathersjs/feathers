export function populateParams () {
  return function (hook) {
    const app = hook.app;

    Object.assign(hook.params, {
      user: app.get('user'),
      token: app.get('token')
    });

    return Promise.resolve(hook);
  };
}

export function populateHeader (options = {}) {
  return function (hook) {
    if (hook.params.token) {
      hook.params.headers = Object.assign({}, {
        [options.header || 'authorization']: hook.params.token
      }, hook.params.headers);
    }

    return Promise.resolve(hook);
  };
}
