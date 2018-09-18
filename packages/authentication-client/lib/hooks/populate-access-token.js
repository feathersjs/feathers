module.exports = function populateAccessToken () {
  return function (hook) {
    const app = hook.app;
    
    if (hook.type !== 'before') {
      return Promise.reject(new Error(`The 'populateAccessToken' hook should only be used as a 'before' hook.`));
    }
    
    if (hook.params === 'undefined') {
      hook.params = {}
    }
    
    if (typeof hook.params !== 'object') {
      return Promise.reject(new Error(`Invalid hook parameters were passed to the 'populateAccessToken' hook`));
    }

    Object.assign(hook.params, { accessToken: app.get('accessToken') });

    return Promise.resolve(hook);
  };
};
