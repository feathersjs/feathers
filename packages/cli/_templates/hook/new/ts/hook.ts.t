---
to: "<%= h.lib %>/hooks/<%= name %>.js"
---
import { NextFunction } from '@feathersjs/hooks';
import { HookContext } from '../declarations';

export const <%= h._.camelCase(name) %> = async (context: HookContext, next: NextFunction) => {
  // Do things before
  await next();
  // Do things after
}
