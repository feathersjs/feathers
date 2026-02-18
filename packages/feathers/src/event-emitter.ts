// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Vendored from https://github.com/browserify/events (MIT)
// Converted to ESM TypeScript for cross-runtime compatibility.

export type Listener = (...args: any[]) => void

export interface EventEmitter {
  _events: Record<string, Listener | Listener[]> | undefined
  _eventsCount: number
  _maxListeners: number | undefined
  setMaxListeners(n: number): this
  getMaxListeners(): number
  emit(type: string, ...args: any[]): boolean
  addListener(type: string, listener: Listener): this
  on(type: string, listener: Listener): this
  prependListener(type: string, listener: Listener): this
  once(type: string, listener: Listener): this
  prependOnceListener(type: string, listener: Listener): this
  removeListener(type: string, listener: Listener): this
  off(type: string, listener: Listener): this
  removeAllListeners(type?: string): this
  listeners(type: string): Listener[]
  rawListeners(type: string): Listener[]
  listenerCount(type: string): number
  eventNames(): (string | symbol)[]
}

export interface EventEmitterConstructor {
  new (): EventEmitter
  prototype: EventEmitter
  init(this: EventEmitter): void
  listenerCount(emitter: EventEmitter, type: string): number
  defaultMaxListeners: number
  once(emitter: EventEmitter, name: string): Promise<any[]>
}

function checkListener(listener: unknown): void {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener)
  }
}

let defaultMaxListeners = 10

export const EventEmitter = function (this: EventEmitter) {
  EventEmitter.init.call(this)
} as unknown as EventEmitterConstructor

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get() {
    return defaultMaxListeners
  },
  set(arg: number) {
    if (typeof arg !== 'number' || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
          arg +
          '.'
      )
    }
    defaultMaxListeners = arg
  }
})

EventEmitter.init = function (this: EventEmitter) {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null)
    this._eventsCount = 0
  }

  this._maxListeners = this._maxListeners || undefined
}

EventEmitter.prototype.setMaxListeners = function setMaxListeners(n: number) {
  if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
    throw new RangeError(
      'The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.'
    )
  }
  this._maxListeners = n
  return this
}

function _getMaxListeners(that: EventEmitter): number {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners
  return that._maxListeners
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this)
}

EventEmitter.prototype.emit = function emit(type: string, ...args: any[]): boolean {
  const doError = type === 'error'
  const events = this._events

  // If there is no 'error' event listener then throw.
  if (doError && (events === undefined || events.error === undefined)) {
    const er = args.length > 0 ? args[0] : undefined
    if (er instanceof Error) {
      throw er // Unhandled 'error' event
    }
    const err = new Error('Unhandled error.' + (er ? ' (' + (er as Error).message + ')' : ''))
    ;(err as any).context = er
    throw err // Unhandled 'error' event
  }

  if (events === undefined) return false

  const handler = events[type]

  if (handler === undefined) return false

  if (typeof handler === 'function') {
    Reflect.apply(handler, this, args)
  } else {
    const len = handler.length
    const listeners = arrayClone(handler, len)
    for (let i = 0; i < len; ++i) {
      Reflect.apply(listeners[i], this, args)
    }
  }

  return true
}

function _addListener(
  target: EventEmitter,
  type: string,
  listener: Listener,
  prepend: boolean
): EventEmitter {
  let m: number
  let existing: Listener | Listener[] | undefined

  checkListener(listener)

  let events = target._events
  if (events === undefined) {
    events = target._events = Object.create(null)
    target._eventsCount = 0
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events!.newListener !== undefined) {
      target.emit('newListener', type, (listener as any).listener ? (listener as any).listener : listener)

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events
    }
    existing = events![type]
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events![type] = listener
    ++target._eventsCount
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events![type] = prepend ? [listener, existing] : [existing, listener]
    } else if (prepend) {
      existing.unshift(listener)
    } else {
      existing.push(listener)
    }

    // Check for listener leak
    m = _getMaxListeners(target)
    if (m > 0 && existing.length > m && !(existing as any).warned) {
      ;(existing as any).warned = true
      const w = new Error(
        'Possible EventEmitter memory leak detected. ' +
          existing.length +
          ' ' +
          String(type) +
          ' listeners added. Use emitter.setMaxListeners() to increase limit'
      )
      w.name = 'MaxListenersExceededWarning'
      ;(w as any).emitter = target
      ;(w as any).type = type
      ;(w as any).count = existing.length
      console.warn(w)
    }
  }

  return target
}

EventEmitter.prototype.addListener = function addListener(type: string, listener: Listener) {
  return _addListener(this, type, listener, false)
}

EventEmitter.prototype.on = EventEmitter.prototype.addListener

EventEmitter.prototype.prependListener = function prependListener(type: string, listener: Listener) {
  return _addListener(this, type, listener, true)
}

interface OnceWrapperState {
  fired: boolean
  wrapFn: Listener | undefined
  target: EventEmitter
  type: string
  listener: Listener
}

function onceWrapper(this: OnceWrapperState, ...args: any[]) {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn!)
    this.fired = true
    if (args.length === 0) return this.listener.call(this.target)
    return this.listener.apply(this.target, args)
  }
}

function _onceWrap(target: EventEmitter, type: string, listener: Listener): Listener {
  const state: OnceWrapperState = {
    fired: false,
    wrapFn: undefined,
    target,
    type,
    listener
  }
  const wrapped = onceWrapper.bind(state) as Listener & { listener: Listener }
  wrapped.listener = listener
  state.wrapFn = wrapped
  return wrapped
}

EventEmitter.prototype.once = function once(type: string, listener: Listener) {
  checkListener(listener)
  this.on(type, _onceWrap(this, type, listener))
  return this
}

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type: string, listener: Listener) {
  checkListener(listener)
  this.prependListener(type, _onceWrap(this, type, listener))
  return this
}

EventEmitter.prototype.removeListener = function removeListener(type: string, listener: Listener) {
  checkListener(listener)

  const events = this._events
  if (events === undefined) return this

  const list = events[type]
  if (list === undefined) return this

  if (list === listener || (list as any).listener === listener) {
    if (--this._eventsCount === 0) {
      this._events = Object.create(null)
    } else {
      delete events[type]
      if (events.removeListener) this.emit('removeListener', type, (list as any).listener || listener)
    }
  } else if (typeof list !== 'function') {
    let position = -1
    let originalListener: Listener | undefined

    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || (list[i] as any).listener === listener) {
        originalListener = (list[i] as any).listener
        position = i
        break
      }
    }

    if (position < 0) return this

    if (position === 0) {
      list.shift()
    } else {
      spliceOne(list, position)
    }

    if (list.length === 1) events[type] = list[0]

    if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener)
  }

  return this
}

EventEmitter.prototype.off = EventEmitter.prototype.removeListener

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type?: string) {
  const events = this._events
  if (events === undefined) return this

  // not listening for removeListener, no need to emit
  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = Object.create(null)
      this._eventsCount = 0
    } else if (type !== undefined && events[type] !== undefined) {
      if (--this._eventsCount === 0) {
        this._events = Object.create(null)
      } else {
        delete events[type]
      }
    }
    return this
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    const keys = Object.keys(events)
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i]
      if (key === 'removeListener') continue
      this.removeAllListeners(key)
    }
    this.removeAllListeners('removeListener')
    this._events = Object.create(null)
    this._eventsCount = 0
    return this
  }

  const listeners = events[type!]

  if (typeof listeners === 'function') {
    this.removeListener(type!, listeners)
  } else if (listeners !== undefined) {
    // LIFO order
    for (let i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type!, listeners[i])
    }
  }

  return this
}

function _listeners(target: EventEmitter, type: string, unwrap: boolean): Listener[] {
  const events = target._events

  if (events === undefined) return []

  const evlistener = events[type]
  if (evlistener === undefined) return []

  if (typeof evlistener === 'function')
    return unwrap ? [(evlistener as any).listener || evlistener] : [evlistener]

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length)
}

EventEmitter.prototype.listeners = function listeners(type: string) {
  return _listeners(this, type, true)
}

EventEmitter.prototype.rawListeners = function rawListeners(type: string) {
  return _listeners(this, type, false)
}

EventEmitter.listenerCount = function (emitter: EventEmitter, type: string): number {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type)
  } else {
    return listenerCount.call(emitter, type)
  }
}

EventEmitter.prototype.listenerCount = listenerCount
function listenerCount(this: EventEmitter, type: string): number {
  const events = this._events

  if (events !== undefined) {
    const evlistener = events[type]

    if (typeof evlistener === 'function') {
      return 1
    } else if (evlistener !== undefined) {
      return evlistener.length
    }
  }

  return 0
}

EventEmitter.prototype.eventNames = function eventNames(): (string | symbol)[] {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events!) : []
}

function arrayClone(arr: Listener[], n: number): Listener[] {
  const copy = new Array(n)
  for (let i = 0; i < n; ++i) copy[i] = arr[i]
  return copy
}

function spliceOne(list: Listener[], index: number): void {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1]
  list.pop()
}

function unwrapListeners(arr: Listener[]): Listener[] {
  const ret = new Array(arr.length)
  for (let i = 0; i < ret.length; ++i) {
    ret[i] = (arr[i] as any).listener || arr[i]
  }
  return ret
}

EventEmitter.once = function once(emitter: EventEmitter, name: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const et = emitter as any
    const isEventEmitter = typeof et.on === 'function'

    function errorListener(err: Error) {
      if (isEventEmitter) {
        emitter.removeListener(name, resolver)
      } else if (typeof et.removeEventListener === 'function') {
        et.removeEventListener(name, resolver)
      }
      reject(err)
    }

    function resolver(...args: any[]) {
      if (isEventEmitter) {
        if (typeof emitter.removeListener === 'function') {
          emitter.removeListener('error', errorListener)
        }
      } else if (typeof et.removeEventListener === 'function') {
        et.removeEventListener('error', errorListener)
      }
      resolve(args)
    }

    if (isEventEmitter) {
      emitter.once(name, resolver)
      if (name !== 'error') {
        emitter.once('error', errorListener)
      }
    } else {
      et.addEventListener(name, resolver, { once: true })
      if (name !== 'error') {
        et.addEventListener('error', errorListener, { once: true })
      }
    }
  })
}
