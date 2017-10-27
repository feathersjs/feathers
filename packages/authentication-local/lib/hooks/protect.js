const omit = require('lodash.omit');

module.exports = function (...fields) {
  return function protect (hook) {
    const result = hook.dispatch || hook.result;
    const o = current => omit(current, fields);

    if (!result) {
      return hook;
    }

    if (Array.isArray(result)) {
      hook.dispatch = result.map(o);
    } else if (result.data) {
      hook.dispatch = Object.assign({}, result, {
        data: result.data.map(o)
      });
    } else {
      hook.dispatch = o(result);
    }

    return hook;
  };
};
