import { NextFunction } from '@feathersjs/hooks';
import { EventEmitter } from 'events';

import { HookContext, FeathersService } from './declarations';
import { getServiceOptions, defaultEventMap } from './service';

export async function eventHook (context: HookContext, next: NextFunction) {
  const { events } = getServiceOptions((context as any).self);
  const defaultEvent = (defaultEventMap as any)[context.method] || null;

  context.event = defaultEvent;

  await next();

  // Send the event only if the service does not do so already (indicated in the `events` option)
  // This is used for custom events and for client services receiving event from the server
  if (typeof context.event === 'string' && !events.includes(context.event)) {
    const results = Array.isArray(context.result) ? context.result : [ context.result ];

    results.forEach(element => (context as any).self.emit(context.event, element, context));
  }
}

export function eventMixin<A> (service: FeathersService<A>) {
  const isEmitter = typeof service.on === 'function' &&
    typeof service.emit === 'function';

  if (!isEmitter) {
    Object.assign(service, EventEmitter.prototype);
  }
  
  return service;
}
