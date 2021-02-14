import { HookContextData, HookManager, HookMap, hooks, Middleware } from '@feathersjs/hooks';
import { Service, ServiceOptions, HookContext, FeathersService } from '../declarations';
import { defaultServiceArguments } from '../service';
import { eventHook } from '../events';
import {
  collectLegacyHooks,
  enableLegacyHooks,
  fromAfterHook,
  fromBeforeHook,
  fromErrorHooks
} from './legacy';

export { fromAfterHook, fromBeforeHook, fromErrorHooks };

export function createContext (service: Service<any>, method: string, data: HookContextData = {}) {
  const createContext = (service as any)[method].createContext;

  if (typeof createContext !== 'function') {
    throw new Error(`Can not create context for method ${method}`);
  }
  
  return createContext(data) as HookContext;
}

export class FeathersHookManager<A> extends HookManager {
  constructor (public app: A, public method: string) {
    super();
  }

  collectMiddleware (self: any, args: any[]): Middleware[] {
    const mw = super.collectMiddleware(self, args);
    const legacyHooks = collectLegacyHooks(this.app, self, this.method);

    return mw.concat(legacyHooks);
  }
}

export function hookMixin<A> (
  this: A, service: FeathersService<A>, path: string, options: ServiceOptions
) {
  if (typeof service.hooks === 'function') {
    return service;
  }

  const app = this;
  const hookMap = options.methods.reduce((res, method) => {
    const params = (defaultServiceArguments as any)[method] || [ 'data', 'params' ];

    res[method] = new FeathersHookManager<A>(app, method)
      .params(...params)
      .props({
        app,
        path,
        method,
        service,
        event: null,
        type: null
      })
      .defaults(() => {
        return { params: {} }
      })
      .middleware([ eventHook ]);

    return res;
  }, {} as HookMap);

  const handleLegacyHooks = enableLegacyHooks(service);

  service.hooks = function (this: typeof service, hookMap: any) {
    if (hookMap.before || hookMap.after || hookMap.error) {
      return handleLegacyHooks.call(this, hookMap);
    }
    
    return hooks(this, hookMap);
  }

  service.hooks(hookMap);

  return service;
}
