const errors = require('./index');

module.exports = function () {
  return function (req, res, next) {
    next(new errors.NotFound('Page not found'));
  };
};
