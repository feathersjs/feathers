import { HookFunction, LegacyHookFunction, LegacyHookMap } from '../declarations';
import { defaultServiceMethods } from '../service';

const runHook = <A, S> (hook: LegacyHookFunction<A, S>, context: any, type?: string) => {
  if (type) context.type = type;
  return Promise.resolve(hook.call(context.self, context))
    .then((res: any) => {
      if (type) context.type = null;
      if (res && res !== context) {
        Object.assign(context, res);
      }
    });
};

export function fromBeforeHook<A, S> (hook: LegacyHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return runHook(hook, context, 'before').then(next);
  };
}

export function fromAfterHook<A, S> (hook: LegacyHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return next().then(() => runHook(hook, context, 'after'));
  }
}

export function fromErrorHook<A, S> (hook: LegacyHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return next().catch((error: any) => {
      if (context.error !== error || context.result !== undefined) {
        (context as any).original = { ...context };
        context.error = error;
        delete context.result;
      }

      return runHook(hook, context, 'error').then(() => {
        if (context.result === undefined && context.error !== undefined) {
          throw context.error;
        }
      });
    });
  }
}

const RunHooks = <A, S> (hooks: LegacyHookFunction<A, S>[]) => (context: any) => {
  return hooks.reduce((promise, hook) => {
    return promise.then(() => runHook(hook, context))
  }, Promise.resolve(undefined));
};

export function fromBeforeHooks<A, S> (hooks: LegacyHookFunction<A, S>[]) {
  return fromBeforeHook(RunHooks(hooks));
}

export function fromAfterHooks<A, S> (hooks: LegacyHookFunction<A, S>[]) {
  return fromAfterHook(RunHooks(hooks));
}

export function fromErrorHooks<A, S> (hooks: LegacyHookFunction<A, S>[]) {
  return fromErrorHook(RunHooks(hooks));
}

export function collectLegacyHooks (target: any, method: string) {
  return target.__hooks.hooks[method] || [];
}

// Converts different hook registration formats into the
// same internal format
export function convertHookData (obj: any) {
  let hook: any = {};

  if (Array.isArray(obj)) {
    hook = { all: obj };
  } else if (typeof obj !== 'object') {
    hook = { all: [ obj ] };
  } else {
    for (const [key, value] of Object.entries(obj)) {
      hook[key] = !Array.isArray(value) ? [ value ] : value;
    }
  }

  return hook;
}

const types = ['before', 'after', 'error'];

const wrappers: any = {
  before: fromBeforeHooks,
  after: fromAfterHooks,
  error: fromErrorHooks,
};

// Add `.hooks` functionality to an object
export function enableLegacyHooks (
  obj: any,
  methods: string[] = defaultServiceMethods
) {
  const hookData: any = {hooks: {}};

  for (const type of types) {
    hookData[type] = {};
  }

  for (const method of methods) {
    hookData.hooks[method] = [];
  }

  // Add non-enumerable `__hooks` property to the object
  Object.defineProperty(obj, '__hooks', {
    configurable: true,
    value: hookData,
    writable: true
  });

  return function legacyHooks (this: any, allHooks: LegacyHookMap<any, any>) {
    const touched = new Set<string>();

    for (const [type, current] of Object.entries(allHooks)) {
      if (!types.includes(type)) {
        throw new Error(`'${type}' is not a valid hook type`);
      }

      const hooks = convertHookData(current);

      for (const method of Object.keys(hooks)) {
        if (method !== 'all' && !methods.includes(method)) {
          throw new Error(`'${method}' is not a valid hook method`);
        }
      }

      for (const method of methods) {
        if (!hooks.all?.length && !hooks[method]?.length) continue;

        const hook = this.__hooks[type][method] ||= (() => {
          const hooks: LegacyHookFunction[] = [];
          const hook = wrappers[type](hooks);
          hook.hooks = hooks;
          touched.add(method);
          return hook;
        })();

        hook.hooks.push(...(hooks.all || []), ...(hooks[method] || []));
      }
    }

    for (const method of touched) {
      const before = this.__hooks.before[method];
      const after = this.__hooks.after[method];
      const error = this.__hooks.error[method];

      const hooks: HookFunction[] = [];
      if (error) hooks.push(error);
      if (before) hooks.push(before);
      if (after) hooks.push(after);

      this.__hooks.hooks[method] = hooks;
    }

    return this;
  }
}
