function isObjectOrArray (value) {
  return typeof value === 'object' && value !== null;
}

exports.validateArguments = function validateArguments (argsOrders, method, args) {
  // Check if the last argument is a callback which are no longer supported
  if (typeof args[args.length - 1] === 'function') {
    throw new Error('Callbacks are no longer supported. Use Promises or async/await instead.');
  }

  const methodArgs = argsOrders[method] || ['params'];
  const methodParamCount = methodArgs.length;

  // Check the number of arguments and throw an error if too many are provided
  if (methodParamCount && args.length > methodParamCount) {
    throw new Error(`Too many arguments for '${method}' method`);
  }

  // Validate other arguments for each method
  return methodArgs.every((argName, index) => {
    switch (argName) {
      case 'id':
        if (args[index] === undefined) {
          throw new Error(`An id must be provided to the '${method}' method`);
        }
        break;
      case 'data':
        if (!isObjectOrArray(args[index])) {
          throw new Error(`A data object must be provided to the '${method}' method`);
        }
        break;
      case 'params':
        if (args[index] !== undefined && !isObjectOrArray(args[index])) {
          throw new Error(`Params for '${method}' method must be an object`);
        }
        break;
    }

    return true;
  });
};
