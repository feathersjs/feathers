'use strict';

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

module.exports = function(options = {}) { // eslint-disable-line no-unused-vars
  return function(hook) {
    hook.<%= camelName %> = true;
    console.log('\'<%= name %>\' hook ran');

    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    return Promise.resolve(hook);
  };
};
