import { HookManager, HookMap, hooks, Middleware } from '@feathersjs/hooks';
import { Service, ServiceOptions, Application } from '../declarations';
import { defaultServiceArguments } from '../service';
import { eventHook } from '../events';
import { collectLegacyHooks, enableLegacyHooks } from './legacy';

export class FeathersHookManager extends HookManager {
  constructor (public app: Application, public method: string) {
    super();
  }

  collectMiddleware (self: any, args: any[]): Middleware[] {
    const mw = super.collectMiddleware(self, args);
    const legacyHooks = collectLegacyHooks(this.app, self, this.method);

    return mw.concat(legacyHooks);
  }
}

export function hookMixin (
  this: Application, service: Service<any>, path: string, options: ServiceOptions
) {
  if (typeof service.hooks === 'function') {
    return service;
  }

  const app = this;
  const hookMap = options.methods.reduce((res, method) => {
    const params = (defaultServiceArguments as any)[method] || [ 'data', 'params' ];

    res[method] = new FeathersHookManager(app, method)
      .params(...params)
      .props({
        app,
        path,
        method,
        service,
        event: null
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
