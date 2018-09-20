module.exports = function populateAccessToken () {
  return function (hook) {
    const app = hook.app;

    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'populateAccessToken' hook should only be used as a 'before' hook.`));
    }
    
    hook.params = hook.params || {}

    Object.assign(hook.params, { accessToken: app.get('accessToken') });

    return Promise.resolve(hook);
  };
};
