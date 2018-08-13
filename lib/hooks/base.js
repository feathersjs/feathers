const { _ } = require('@feathersjs/commons');

const assignArguments = context => {
  const { service, method } = context;
  const parameters = service.methods[method];

  const argsObject = context.arguments.reduce((result, value, index) => {
    result[parameters[index]] = value;
    return result;
  }, { params: {} });

  Object.assign(context, argsObject);

  return context;
};

const validate = context => {
  const { service, method } = context;
  const parameters = service.methods[method];

  if (parameters.includes('id') && context.id === undefined) {
    throw new Error(`An id must be provided to the '${method}' method`);
  }

  if (parameters.includes('data') && !_.isObjectOrArray(context.data)) {
    throw new Error(`A data object must be provided to the '${method}' method`);
  }

  return context;
};

module.exports = [ assignArguments, validate ];
