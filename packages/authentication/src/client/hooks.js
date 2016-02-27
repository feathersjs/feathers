export function populateParams(options) {
  return function(hook) {
    const storage = hook.app.service(options.storage);
    
    // We can not run this hook on the storage service itself
    if(this !== storage) {
      return Promise.all([
        storage.get('user'),
        storage.get('token')
      ]).then(([ user, token ]) => {
        Object.assign(hook.params, { user, token });
        return hook;
      });
    }
  };
}

export function populateHeader(options = {}) {
  return function(hook) {
    if (hook.params.token) {
      hook.params.headers = Object.assign({}, { 
        [options.header || 'Authorization']: hook.params.token
      }, hook.params.headers);
    }
  };
}
