const { _ } = require('@feathersjs/commons');

const assignArguments = (context, next) => {
  const { service, method } = context;
  const parameters = service.methods[method];
  const argsObject = context.arguments.reduce((result, value, index) => {
    result[parameters[index]] = value;
    return result;
  }, {});

  if (!argsObject.params) {
    argsObject.params = {};
  }

  Object.assign(context, argsObject);

  return next();
};

const validate = (context, next) => {
  const { service, method } = context;
  const parameters = service.methods[method];

  if (parameters.includes('id') && context.id === undefined) {
    return next(new Error(`An id must be provided to the '${method}' method`));
  }

  if (parameters.includes('data') && !_.isObjectOrArray(context.data)) {
    return next(new Error(`A data object must be provided to the '${method}' method`));
  }

  return next();
};

module.exports = [ assignArguments, validate ];
