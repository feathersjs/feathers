import { NextFunction } from './hooks/index.js'
import { HookContext, FeathersService } from './declarations.js'
import { getServiceOptions, defaultEventMap } from './service.js'

export type Listener = (...args: any[]) => void

function getEvents(self: any): Record<string, Listener[]> {
  if (!self.__events) {
    self.__events = {}
  }
  return self.__events
}

export class EventEmitter {
  __events: Record<string, Listener[]> = {}
}

export interface EventEmitter {
  on(event: string, listener: Listener): this
  addListener(event: string, listener: Listener): this
  once(event: string, listener: Listener): this
  off(event: string, listener: Listener): this
  removeListener(event: string, listener: Listener): this
  removeAllListeners(event?: string): this
  emit(event: string, ...args: any[]): boolean
  listenerCount(event: string): number
  listeners(event: string): Listener[]
}

EventEmitter.prototype.on = function (event: string, listener: Listener) {
  const events = getEvents(this)
  if (!events[event]) {
    events[event] = []
  }
  events[event].push(listener)
  return this
}

EventEmitter.prototype.addListener = function (event: string, listener: Listener) {
  return this.on(event, listener)
}

EventEmitter.prototype.once = function (event: string, listener: Listener) {
  const wrapped = (...args: any[]) => {
    this.removeListener(event, wrapped)
    listener.apply(this, args)
  }
  wrapped.listener = listener
  return this.on(event, wrapped)
}

EventEmitter.prototype.off = function (event: string, listener: Listener) {
  return this.removeListener(event, listener)
}

EventEmitter.prototype.removeListener = function (event: string, listener: Listener) {
  const events = getEvents(this)
  const listeners = events[event]
  if (listeners) {
    events[event] = listeners.filter((l: any) => l !== listener && l.listener !== listener)
    if (events[event].length === 0) {
      delete events[event]
    }
  }
  return this
}

EventEmitter.prototype.removeAllListeners = function (event?: string) {
  const events = getEvents(this)
  if (event) {
    delete events[event]
  } else {
    this.__events = {}
  }
  return this
}

EventEmitter.prototype.emit = function (event: string, ...args: any[]): boolean {
  const listeners = getEvents(this)[event]
  if (!listeners || listeners.length === 0) {
    return false
  }
  for (const listener of [...listeners]) {
    listener.apply(this, args)
  }
  return true
}

EventEmitter.prototype.listenerCount = function (event: string): number {
  const listeners = getEvents(this)[event]
  return listeners ? listeners.length : 0
}

EventEmitter.prototype.listeners = function (event: string): Listener[] {
  const listeners = getEvents(this)[event]
  return listeners ? [...listeners] : []
}

export async function eventHook(context: HookContext, next: NextFunction) {
  const { events } = getServiceOptions((context as any).self)
  const defaultEvent = (defaultEventMap as any)[context.method] || null

  context.event = defaultEvent

  await next()

  // Send the event only if the service does not do so already (indicated in the `events` option)
  // This is used for custom events and for client services receiving event from the server
  if (typeof context.event === 'string' && !events.includes(context.event)) {
    const results = Array.isArray(context.result) ? context.result : [context.result]

    results.forEach((element) => (context as any).self.emit(context.event, element, context))
  }
}

export function eventMixin<A>(service: FeathersService<A>) {
  const isEmitter = typeof service.on === 'function' && typeof service.emit === 'function'

  if (!isEmitter) {
    Object.assign(service, EventEmitter.prototype)
  }

  return service
}
