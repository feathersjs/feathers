const compose = require('koa-compose');

const defaultGetContext = data => args => Object.assign({ arguments: args }, data);

const hookFunction = (method, hooks, getContext = defaultGetContext({})) => {
  return function (...args) {
    const context = getContext.call(this, args);
    const hookChain = [
      async (ctx, next) => {
        await next();

        return ctx.result;
      },
      ...hooks,
      async (ctx, next) => {
        if (ctx.result === undefined) {
          const result = await Promise.resolve(method.apply(this, ctx.arguments));

          ctx.result = result;

          return next();
        }

        return next();
      }
    ];
    const composed = compose(hookChain);

    return composed(context);
  };
};

const hookObject = (object, hookMap, getContext = defaultGetContext) => {
  const keys = Object.keys(object).concat(Object.getOwnPropertySymbols(object));

  return keys.reduce((result, name) => {
    const value = object[name];
    const hooks = hookMap[name];

    if (hooks !== undefined) {
      if (typeof value !== 'function') {
        throw new Error(`Can not apply hooks. '${name}' is not a function`);
      }

      const fn = hookFunction(value, hooks, getContext({
        method: name
      }));

      result[name] = fn;
    } else {
      result[name] = value;
    }

    return result;
  }, {});
};

const hookDecorator = (hooks, getContext = defaultGetContext) => {
  return (target, method, descriptor) => {
    const fn = descriptor.value;

    if (typeof fn !== 'function') {
      throw new Error(`Can not apply hooks. '${method}' is not a function`);
    }

    descriptor.value = hookFunction(fn, hooks, getContext({ method }));

    return descriptor;
  };
};

module.exports = (...args) => {
  const [ target ] = args;

  if (Array.isArray(target)) {
    return hookDecorator(...args);
  } else if (typeof target === 'function') {
    return hookFunction(...args);
  }

  return hookObject(...args);
};
