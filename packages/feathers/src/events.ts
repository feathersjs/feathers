import { NextFunction } from '@feathersjs/hooks';
import { EventEmitter } from 'events';

import { Service, HookContext } from './declarations';
import { getServiceOptions } from './service';

export async function eventHook (context: HookContext, next: NextFunction) {
  const { methods, events } = getServiceOptions(context.service);
  const value = (methods as any)[context.method];

  // If there is one configured, set the event on the context
  // so actual emitting the event can be disabled within the hook chain
  if (value.event) {
    context.event = value.event;
  }

  await next();

  // Send the event only if the service does not do so already (indicated in the `events` option)
  // This is used for custom events and for client services receiving event from the server
  if (typeof context.event === 'string' && !events.includes(context.event)) {
    const results = Array.isArray(context.result) ? context.result : [ context.result ];

    results.forEach(element => context.service.emit(context.event, element, context));
  }
}

export function eventMixin (service: Service<any>, _path: string, _options?: any) {
  const isEmitter = typeof service.on === 'function' &&
    typeof service.emit === 'function';

  if (!isEmitter) {
    Object.assign(service, EventEmitter.prototype);
  }
  
  return service;
}
