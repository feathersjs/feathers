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
      hook.params.headers = {
        [options.header]: hook.params.token
      }; 
    }
  };
};

export let populateSocketParams = function() {
  return function(hook) {
    if (hook.params.token) {
      hook.params.query = {
        token: hook.params.token
      };
    }
  };
};

export default {
  populateParams,
  populateHeader,
  populateSocketParams
};