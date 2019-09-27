const compose = require('koa-compose');

const HOOKS = Symbol('@feathersjs/hooks');
const ORIGINAL = Symbol('@feathersjs/hooks/original');
const RETURN = Symbol('@feathersjs/hooks/return');

const defaultGetContext = data => args => Object.assign({ arguments: args }, data);

function hookFunction (method, _hooks, getContext = defaultGetContext({})) {
  if (typeof method !== 'function') {
    throw new Error('Can not apply hooks to non-function');
  }

  const hooks = (method[HOOKS] || []).concat(_hooks);
  const original = method[ORIGINAL] || method;
  const fn = function (...args) {
    const returnHook = args[args.length - 1] === RETURN ? !!args.pop() : false;
    const context = getContext.call(this, args);
    const hookChain = [
      // Return `ctx.result` or the context
      (ctx, next) => {
        return next().then(() => returnHook ? ctx : ctx.result);
      },
      // The hook chain attached to this function
      ...fn[HOOKS],
      // Runs the actual original method if `ctx.result` is not set
      (ctx, next) => {
        if (ctx.result === undefined) {
          return Promise.resolve(original.apply(this, ctx.arguments)).then(result => {
            ctx.result = result;

            return next();
          });
        }

        return next();
      }
    ];
    const composed = compose(hookChain);

    return composed.call(this, context);
  };

  return Object.assign(fn, {
    [HOOKS]: hooks,
    [ORIGINAL]: original
  });
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

const main = (...args) => {
  const [ target ] = args;

  if (Array.isArray(target)) {
    return hookDecorator(...args);
  } else if (typeof target === 'object') {
    return hookObject(...args);
  }

  return hookFunction(...args);
};

Object.assign(main, {
  HOOKS,
  ORIGINAL,
  RETURN,
  default: main
});

module.exports = main;
