import utils from './utils';

export let populateParams = function() {
  return function(hook) {
    hook.params.user = utils.getUser();
    hook.params.token = utils.getToken();
  };
};

export let populateHeader = function(options = {}) {
  const defaults = {
    header: 'Authorization'
  };

  options = Object.assign({}, defaults, options);

  return function(hook) {
    if (hook.params.token) {
      hook.params.headers = Object.assign({}, { [options.header]: hook.params.token }, hook.params.headers);
    }
  };
};

export default {
  populateParams,
  populateHeader
};
