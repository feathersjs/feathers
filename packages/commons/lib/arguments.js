const paramCounts = {
  find: 1,
  get: 2,
  create: 2,
  update: 3,
  patch: 3,
  remove: 2
};

function isObjectOrArray (value) {
  return typeof value === 'object' && value !== null;
}

exports.validateArguments = function validateArguments (method, args) {
  // Check if the last argument is a callback which are no longer supported
  if (typeof args[args.length - 1] === 'function') {
    throw new Error('Callbacks are no longer supported. Use Promises or async/await instead.');
  }

  const methodParamCount = paramCounts[method];

  // Check the number of arguments and throw an error if too many are provided
  if (methodParamCount && args.length > methodParamCount) {
    throw new Error(`Too many arguments for '${method}' method`);
  }

  // `params` is always the last argument
  const params = args[methodParamCount - 1];

  // Check if `params` is an object (can be undefined though)
  if (params !== undefined && !isObjectOrArray(params)) {
    throw new Error(`Params for '${method}' method must be an object`);
  }

  // Validate other arguments for each method
  switch (method) {
    case 'create':
      if (!isObjectOrArray(args[0])) {
        throw new Error(`A data object must be provided to the 'create' method`);
      }
      break;
    case 'get':
    case 'remove':
    case 'update':
    case 'patch':
      if (args[0] === undefined) {
        throw new Error(`An id must be provided to the '${method}' method`);
      }

      if ((method === 'update' || method === 'patch') && !isObjectOrArray(args[1])) {
        throw new Error(`A data object must be provided to the '${method}' method`);
      }
  }

  return true;
};
