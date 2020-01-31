const { _ } = require('@feathersjs/commons');

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

function beforeWrapper (hooks) {
  return firstHook
    .concat(hooks)
    .map(toBeforeHook);
}

function afterWrapper (hooks) {
  return [].concat(hooks)
    .reverse()
    .map(toAfterHook)
    .concat(lastHook);
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
  toBeforeHook,
  toAfterHook
};
