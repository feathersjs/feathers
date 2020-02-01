const { _ } = require('@feathersjs/commons');

const noop = () => {};

async function handleError (hook, context, onError) {
  try {
    const result = await hook.call(context.self, context);
    Object.assign(context, _.omit(result, 'arguments'));
  } catch (errorError) {
    if (typeof onError === 'function') {
      onError(errorError, context);
    }
    throw errorError;
  }

  if (typeof context.error !== 'undefined') {
    throw context.error;
  }
}

function firstHook (context, next) {
  context.type = 'before';
  return next();
}

function lastHook (context, next) {
  context.type = 'after';
  return next();
}

function toBeforeHook (hook) {
  return async (context, next) => {
    const result = await hook.call(context.self, context);
    Object.assign(context, _.omit(result, 'arguments'));
    await next();
  };
}

function toAfterHook (hook) {
  return async (context, next) => {
    await next();
    const result = await hook.call(context.self, context);
    Object.assign(context, _.omit(result, 'arguments'));
  };
}

function toErrorHook (hook, onError, control) {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      if (typeof control === 'function') {
        control(context);
      }

      context.error = error;
      context.result = undefined;

      await handleError(hook, context, onError);
    }
  };
}

function toFinallyHook (hook, onError, control) {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      throw error;
    } finally {
      if (typeof control === 'function') {
        control(context);
      }

      await handleError(hook, context, onError);
    }
  };
}

function beforeWrapper (hooks) {
  return [firstHook, ...[].concat(hooks).map(toBeforeHook)];
}

function afterWrapper (hooks) {
  return [...[].concat(hooks).reverse().map(toAfterHook), lastHook];
}

function finallyWrapper (hooks) {
  let errorInFinally;

  const onError = (error, context) => {
    errorInFinally = error;
    context.error = error;
    context.result = undefined;
  };
  const control = () => {
    if (errorInFinally) {
      throw errorInFinally;
    }
  };

  return [].concat(hooks).reverse().map(hook => toFinallyHook(hook, onError, control));
}

function errorWrapper (hooks) {
  let errorInError;

  const onError = (error, context) => {
    errorInError = error;
    context.error = error;
    context.result = undefined;
  };
  const control = context => {
    if (!context.original) {
      context.original = { ...context };
    }
    if (errorInError) {
      throw errorInError;
    }
    context.type = 'error';
  };

  return [noop].concat(hooks).reverse().map(hook => toErrorHook(hook, onError, control));
}

function wrap ({ async = [], before = [], after = [] } = {}) {
  return [
    ...[].concat(async),
    ...beforeWrapper(before),
    ...afterWrapper(after)
  ];
}

module.exports = {
  wrap,
  beforeWrapper,
  afterWrapper,
  errorWrapper,
  finallyWrapper,
  toBeforeHook,
  toAfterHook,
  toErrorHook,
  toFinallyHook
};
