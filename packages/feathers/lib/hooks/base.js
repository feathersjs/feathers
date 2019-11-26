const { _ } = require('@feathersjs/commons');

const assignArguments = context => {
  const { service, method } = context;
  const parameters = service.methods[method];

  context.arguments.forEach((value, index) => {
    context[parameters[index]] = value;
  });

  if (!context.params) {
    context.params = {};
  }

  return context;
};

const validate = context => {
  const { service, method, path } = context;
  const parameters = service.methods[method];

  if (parameters.includes('id') && context.id === undefined) {
    throw new Error(`An id must be provided to the '${path}.${method}' method`);
  }

  if (parameters.includes('data') && !_.isObjectOrArray(context.data)) {
    throw new Error(`A data object must be provided to the '${path}.${method}' method`);
  }

  return context;
};

module.exports = [ assignArguments, validate ];
