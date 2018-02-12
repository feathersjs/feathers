const errors = require('./index');

module.exports = function ({ verbose = false } = {}) {
  return function (req, res, next) {
    const { url } = req;
    const message = `Page not found${verbose ? ': ' + url : ''}`;
    next(new errors.NotFound(message, { url }));
  };
};
