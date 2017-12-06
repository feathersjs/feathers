const omit = require('lodash.omit');

module.exports = function (...fields) {
  return function protect (context) {
    const result = context.dispatch || context.result;
    const o = current => omit(current, fields);

    if (!result) {
      return context;
    }

    if (Array.isArray(result)) {
      context.dispatch = result.map(o);
    } else if (result.data) {
      context.dispatch = Object.assign({}, result, {
        data: result.data.map(o)
      });
    } else {
      context.dispatch = o(result);
    }

    if (context.params && context.params.provider) {
      context.result = context.dispatch;
    }

    return context;
  };
};
