module.exports = function (options = {}) {
  return function <%= camelName %>(req, res, next) {
    console.log('<%= name %> middleware is running');
    next();
  };
};
