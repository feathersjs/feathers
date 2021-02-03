import { HookManager, hooks, Middleware, HookContext, NextFunction } from '@feathersjs/hooks';
import { Service, ServiceOptions, Application } from '../declarations';
import { defaultServiceArguments } from '../service';
import { eventHook } from '../events';

export class FeathersHookManager<A> extends HookManager {
  app: A;

  constructor (app: A) {
    super();
    this.app = app;
  }
}

export function getFeathersHook ({ app, service, method, path }: {
  service: Service<any>;
  app: Application;
  method: string;
  path: string;
}) {
  const args = defaultServiceArguments[method] || defaultServiceArguments.default;
  // The base properties to define on the context
  const baseProperties: PropertyDescriptorMap = {
    app: {
      value: app
    },
    service: {
      value: service
    },
    method: {
      enumerable: true,
      writable: true,
      value: method
    },
    path: {
      enumerable: true,
      value: path
    }
  };
  // Add method arguments (based on `arguments` array)
  const properties = args.reduce((result, name, index) => {
    result[name] = {
      enumerable: true,
      get (this: any) {
        return this?.arguments[index];
      },
      set (this: any, value: any) {
        if (!this.arguments) {
          this.arguments = new Array(args.length);
        }

        this.arguments[index] = value;
      }
    }

    return result;
  }, baseProperties);

  return async function feathersHook (context: HookContext, next: NextFunction) {
    Object.defineProperties(context, properties);
    context.params = context.params || {};
    await next();
  }
}

export const protectedMethods = [
  'all', 'hooks', 'publish', 'on', 'emit', 'removeListener', 'removeAllListeners'
];

export function hookMixin (
  this: Application, service: Service<any>, path: string, options: ServiceOptions<any>
) {
  if (typeof service.hooks === 'function') {
    return service;
  }

  const app = this;
  const hookMap = Object.keys(options.methods).reduce((res, method) => {
    if (protectedMethods.includes(method)) {
      throw new Error(`'${method}' is not a valid service method name`);
    }
    
    const feathersHook = getFeathersHook({ app, service, method, path });

    res[method] = new FeathersHookManager(app, [
      feathersHook,
      eventHook
    ]);

    return res;
  }, {} as any);

  hooks(service, hookMap);

  return service;
}
