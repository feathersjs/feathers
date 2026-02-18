import { describe, it, vi, afterEach } from 'vitest'
import assert from 'assert'
import { inherits } from 'util'
import { EventEmitter } from './event-emitter.js'

// ---------------------------------------------------------------------------
// Helpers (replaces common.js mustCall / mustNotCall)
// ---------------------------------------------------------------------------

class CallTracker {
  private checks: Array<{ count: () => number; expected: number }> = []

  mustCall<T extends (...args: any[]) => any>(fn?: T | number, exact?: number): T {
    let realFn: ((...args: any[]) => any) | undefined
    let expectedCount: number

    if (typeof fn === 'number') {
      expectedCount = fn
      realFn = undefined
    } else {
      expectedCount = exact ?? 1
      realFn = fn
    }

    let count = 0
    const wrapped = function (this: any, ...args: any[]) {
      count++
      return realFn ? realFn.apply(this, args) : undefined
    } as T

    this.checks.push({ count: () => count, expected: expectedCount })
    return wrapped
  }

  mustNotCall(msg?: string) {
    return function mustNotCall(..._args: any[]) {
      assert.fail(msg || 'function should not have been called')
    }
  }

  verify() {
    for (const { count, expected } of this.checks) {
      assert.strictEqual(count(), expected)
    }
  }
}

// ---------------------------------------------------------------------------
// add-listeners
// ---------------------------------------------------------------------------

describe('add-listeners', () => {
  it('emits newListener event and tracks listeners in order', () => {
    const ee = new EventEmitter()
    const events_new_listener_emitted: string[] = []
    const listeners_new_listener_emitted: Function[] = []

    assert.strictEqual(ee.addListener, ee.on)

    ee.on('newListener', function (event: string, listener: Function) {
      if (event === 'newListener') return
      events_new_listener_emitted.push(event)
      listeners_new_listener_emitted.push(listener)
    })

    let helloCalled = 0
    const hello = function (a: string, b: string) {
      helloCalled++
      assert.strictEqual('a', a)
      assert.strictEqual('b', b)
    }

    ee.once('newListener', function (this: typeof ee, name: string, listener: Function) {
      assert.strictEqual(name, 'hello')
      assert.strictEqual(listener, hello)
      const listeners = this.listeners('hello')
      assert.ok(Array.isArray(listeners))
      assert.strictEqual(listeners.length, 0)
    })

    ee.on('hello', hello)
    ee.once('foo', assert.fail)

    assert.ok(Array.isArray(events_new_listener_emitted))
    assert.strictEqual(events_new_listener_emitted.length, 2)
    assert.strictEqual(events_new_listener_emitted[0], 'hello')
    assert.strictEqual(events_new_listener_emitted[1], 'foo')

    assert.ok(Array.isArray(listeners_new_listener_emitted))
    assert.strictEqual(listeners_new_listener_emitted.length, 2)
    assert.strictEqual(listeners_new_listener_emitted[0], hello)
    assert.strictEqual(listeners_new_listener_emitted[1], assert.fail)

    ee.emit('hello', 'a', 'b')
    assert.strictEqual(helloCalled, 1)
  })

  it('setMaxListeners(0) does not throw', () => {
    const f = new EventEmitter()
    f.setMaxListeners(0)
  })

  it('newListener ordering with nested once listeners', () => {
    const listen1 = function () {}
    const listen2 = function () {}
    const ee = new EventEmitter()

    ee.once('newListener', function () {
      const listeners = ee.listeners('hello')
      assert.ok(Array.isArray(listeners))
      assert.strictEqual(listeners.length, 0)
      ee.once('newListener', function () {
        const listeners = ee.listeners('hello')
        assert.ok(Array.isArray(listeners))
        assert.strictEqual(listeners.length, 0)
      })
      ee.on('hello', listen2)
    })
    ee.on('hello', listen1)

    // The order of listeners on an event is not always the order in which the
    // listeners were added.
    const listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 2)
    assert.strictEqual(listeners[0], listen2)
    assert.strictEqual(listeners[1], listen1)
  })

  it('throws TypeError when listener is not a function', () => {
    assert.throws(function () {
      const ee = new EventEmitter()
      ee.on('foo', null as any)
    }, /^TypeError: The "listener" argument must be of type Function\. Received type object$/)
  })
})

// ---------------------------------------------------------------------------
// check-listener-leaks
// ---------------------------------------------------------------------------

describe('check-listener-leaks', () => {
  const savedDefault = EventEmitter.defaultMaxListeners

  afterEach(() => {
    EventEmitter.defaultMaxListeners = savedDefault
  })

  it('warns when listener count exceeds default max', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const e = new EventEmitter()

    for (let i = 0; i < 10; i++) {
      e.on('default', () => {})
    }
    assert.ok(!(e._events!['default'] as any).hasOwnProperty('warned'))
    e.on('default', () => {})
    assert.ok((e._events!['default'] as any).warned)

    // specific
    e.setMaxListeners(5)
    for (let i = 0; i < 5; i++) {
      e.on('specific', () => {})
    }
    assert.ok(!(e._events!['specific'] as any).hasOwnProperty('warned'))
    e.on('specific', () => {})
    assert.ok((e._events!['specific'] as any).warned)

    // only one
    e.setMaxListeners(1)
    e.on('only one', () => {})
    assert.ok(!(e._events!['only one'] as any).hasOwnProperty('warned'))
    e.on('only one', () => {})
    assert.ok((e._events!['only one'] as any).hasOwnProperty('warned'))

    // unlimited
    e.setMaxListeners(0)
    for (let i = 0; i < 1000; i++) {
      e.on('unlimited', () => {})
    }
    assert.ok(!(e._events!['unlimited'] as any).hasOwnProperty('warned'))

    vi.restoreAllMocks()
  })

  it('respects process-wide defaultMaxListeners', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    EventEmitter.defaultMaxListeners = 42
    const e = new EventEmitter()

    for (let i = 0; i < 42; ++i) {
      e.on('fortytwo', () => {})
    }
    assert.ok(!(e._events!['fortytwo'] as any).hasOwnProperty('warned'))
    e.on('fortytwo', () => {})
    assert.ok((e._events!['fortytwo'] as any).hasOwnProperty('warned'))
    delete (e._events!['fortytwo'] as any).warned

    EventEmitter.defaultMaxListeners = 44
    e.on('fortytwo', () => {})
    assert.ok(!(e._events!['fortytwo'] as any).hasOwnProperty('warned'))
    e.on('fortytwo', () => {})
    assert.ok((e._events!['fortytwo'] as any).hasOwnProperty('warned'))

    vi.restoreAllMocks()
  })

  it('instance _maxListeners takes precedence over defaultMaxListeners', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    EventEmitter.defaultMaxListeners = 42
    const e = new EventEmitter()
    e.setMaxListeners(1)
    e.on('uno', () => {})
    assert.ok(!(e._events!['uno'] as any).hasOwnProperty('warned'))
    e.on('uno', () => {})
    assert.ok((e._events!['uno'] as any).hasOwnProperty('warned'))

    // chainable
    assert.strictEqual(e, e.setMaxListeners(1))

    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------------------
// errors
// ---------------------------------------------------------------------------

describe('errors', () => {
  it('throws on unhandled error string', () => {
    const EE = new EventEmitter()
    assert.throws(function () {
      EE.emit('error', 'Accepts a string')
    }, 'Error: Unhandled error. (Accepts a string)')
  })

  it('throws on unhandled error object', () => {
    const EE = new EventEmitter()
    assert.throws(function () {
      EE.emit('error', { message: 'Error!' })
    }, 'Unhandled error. ([object Object])')
  })
})

// ---------------------------------------------------------------------------
// events-list
// ---------------------------------------------------------------------------

describe('events-list', () => {
  it('tracks event names as listeners are added and removed', () => {
    const EE = new EventEmitter()
    const m = function () {}
    EE.on('foo', function () {})
    assert.equal(1, EE.eventNames().length)
    assert.equal('foo', EE.eventNames()[0])
    EE.on('bar', m)
    assert.equal(2, EE.eventNames().length)
    assert.equal('foo', EE.eventNames()[0])
    assert.equal('bar', EE.eventNames()[1])
    EE.removeListener('bar', m)
    assert.equal(1, EE.eventNames().length)
    assert.equal('foo', EE.eventNames()[0])
  })

  it('includes symbol event names', () => {
    const EE = new EventEmitter()
    const m = function () {}
    EE.on('foo', function () {})
    const s = Symbol('s')
    EE.on(s as any, m)
    assert.equal(2, EE.eventNames().length)
    assert.equal('foo', EE.eventNames()[0])
    assert.equal(s, EE.eventNames()[1])
    EE.removeListener(s as any, m)
    assert.equal(1, EE.eventNames().length)
    assert.equal('foo', EE.eventNames()[0])
  })
})

// ---------------------------------------------------------------------------
// events-once
// ---------------------------------------------------------------------------

describe('events-once', () => {
  it('resolves with emitted value', async () => {
    const ee = new EventEmitter()
    process.nextTick(function () {
      ee.emit('myevent', 42)
    })
    const args = await EventEmitter.once(ee, 'myevent')
    const value = args[0]
    assert.strictEqual(value, 42)
    assert.strictEqual(ee.listenerCount('error'), 0)
    assert.strictEqual(ee.listenerCount('myevent'), 0)
  })

  it('resolves with multiple emitted values', async () => {
    const ee = new EventEmitter()
    process.nextTick(function () {
      ee.emit('myevent', 42, 24)
    })
    const value = await EventEmitter.once(ee, 'myevent')
    assert.strictEqual(value.length, 2)
    assert.strictEqual(value[0], 42)
    assert.strictEqual(value[1], 24)
  })

  it('rejects when error event is emitted', async () => {
    const ee = new EventEmitter()
    const expected = new Error('kaboom')
    process.nextTick(function () {
      ee.emit('error', expected)
    })
    await EventEmitter.once(ee, 'myevent').then(
      function () {
        throw new Error('should reject')
      },
      function (err) {
        assert.strictEqual(err, expected)
        assert.strictEqual(ee.listenerCount('error'), 0)
        assert.strictEqual(ee.listenerCount('myevent'), 0)
      }
    )
  })

  it('stops listening after catching error', async () => {
    const ee = new EventEmitter()
    const expected = new Error('kaboom')
    process.nextTick(function () {
      ee.emit('error', expected)
      ee.emit('myevent', 42, 24)
    })
    await EventEmitter.once(ee, 'myevent').then(
      function () {
        assert.fail('should not resolve')
      },
      function (err) {
        assert.strictEqual(err, expected)
        assert.strictEqual(ee.listenerCount('error'), 0)
        assert.strictEqual(ee.listenerCount('myevent'), 0)
      }
    )
  })

  it('resolves when listening to error event directly', async () => {
    const ee = new EventEmitter()
    const expected = new Error('kaboom')
    process.nextTick(function () {
      ee.emit('error', expected)
    })
    const promise = EventEmitter.once(ee, 'error')
    assert.strictEqual(ee.listenerCount('error'), 1)
    const args = await promise
    const err = args[0]
    assert.strictEqual(err, expected)
    assert.strictEqual(ee.listenerCount('error'), 0)
    assert.strictEqual(ee.listenerCount('myevent'), 0)
  })

  it('prioritizes EventEmitter interface over addEventListener', async () => {
    const ee = new EventEmitter()
    ;(ee as any).addEventListener = assert.fail
    ;(ee as any).removeAllListeners = assert.fail
    process.nextTick(function () {
      ee.emit('foo')
    })
    await EventEmitter.once(ee, 'foo')
  })

  it('resolves with EventTargetMock', async () => {
    class EventTargetMock {
      events: Record<string, { listeners: Function[]; options: any }> = {}

      addEventListener(name: string, listener: Function, options?: any) {
        if (!(name in this.events)) {
          this.events[name] = { listeners: [], options: options || {} }
        }
        this.events[name].listeners.push(listener)
      }

      removeEventListener(name: string, callback: Function) {
        if (!(name in this.events)) return
        const stack = this.events[name].listeners
        for (let i = 0; i < stack.length; i++) {
          if (stack[i] === callback) {
            stack.splice(i, 1)
            if (stack.length === 0) delete this.events[name]
            return
          }
        }
      }

      dispatchEvent(arg: { type: string; defaultPrevented?: boolean }) {
        if (!(arg.type in this.events)) return true
        const event = this.events[arg.type]
        const stack = event.listeners.slice()
        for (let i = 0; i < stack.length; i++) {
          stack[i].call(null, arg)
          if (event.options.once) this.removeEventListener(arg.type, stack[i])
        }
        return !arg.defaultPrevented
      }
    }

    const et = new EventTargetMock()
    const event = { type: 'myevent' }
    process.nextTick(function () {
      et.dispatchEvent(event)
    })
    const args = await EventEmitter.once(et as any, 'myevent')
    const value = args[0]
    assert.strictEqual(value, event)
    assert.ok(!Object.prototype.hasOwnProperty.call(et.events, 'myevent'))
  })
})

// ---------------------------------------------------------------------------
// listener-count
// ---------------------------------------------------------------------------

describe('listener-count', () => {
  it('counts listeners correctly', () => {
    const emitter = new EventEmitter()
    emitter.on('foo', function () {})
    emitter.on('foo', function () {})
    emitter.on('baz', function () {})
    // Allow any type
    emitter.on(123 as any, function () {})

    assert.strictEqual(EventEmitter.listenerCount(emitter, 'foo'), 2)
    assert.strictEqual(emitter.listenerCount('foo'), 2)
    assert.strictEqual(emitter.listenerCount('bar'), 0)
    assert.strictEqual(emitter.listenerCount('baz'), 1)
    assert.strictEqual(emitter.listenerCount(123 as any), 1)
  })
})

// ---------------------------------------------------------------------------
// listeners-side-effects
// ---------------------------------------------------------------------------

describe('listeners-side-effects', () => {
  it('listeners() does not modify internal state', () => {
    const e = new EventEmitter()

    let fl = e.listeners('foo')
    assert.ok(Array.isArray(fl))
    assert.strictEqual(fl.length, 0)
    assert.ok(!(e._events instanceof Object))
    assert.strictEqual(Object.keys(e._events!).length, 0)

    e.on('foo', assert.fail)
    fl = e.listeners('foo')
    assert.strictEqual(e._events!.foo, assert.fail)
    assert.ok(Array.isArray(fl))
    assert.strictEqual(fl.length, 1)
    assert.strictEqual(fl[0], assert.fail)

    e.listeners('bar')

    e.on('foo', assert.ok)
    fl = e.listeners('foo')

    assert.ok(Array.isArray(e._events!.foo))
    assert.strictEqual((e._events!.foo as Function[]).length, 2)
    assert.strictEqual((e._events!.foo as Function[])[0], assert.fail)
    assert.strictEqual((e._events!.foo as Function[])[1], assert.ok)

    assert.ok(Array.isArray(fl))
    assert.strictEqual(fl.length, 2)
    assert.strictEqual(fl[0], assert.fail)
    assert.strictEqual(fl[1], assert.ok)
  })
})

// ---------------------------------------------------------------------------
// listeners
// ---------------------------------------------------------------------------

describe('listeners', () => {
  function listener() {}
  function listener2() {}
  function listener3() {
    return 0
  }
  function listener4() {
    return 1
  }

  function TestStream(this: any) {}
  inherits(TestStream, EventEmitter as any)

  it('listeners() returns a copy that survives removeAllListeners', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener)
    const fooListeners = ee.listeners('foo')

    let listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener)

    ee.removeAllListeners('foo')
    listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)

    assert.ok(Array.isArray(fooListeners))
    assert.strictEqual(fooListeners.length, 1)
    assert.strictEqual(fooListeners[0], listener)
  })

  it('listeners() returns independent copy each call', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener)

    const eeListenersCopy = ee.listeners('foo')
    assert.ok(Array.isArray(eeListenersCopy))
    assert.strictEqual(eeListenersCopy.length, 1)
    assert.strictEqual(eeListenersCopy[0], listener)

    let listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener)

    eeListenersCopy.push(listener2)
    listeners = ee.listeners('foo')

    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener)

    assert.strictEqual(eeListenersCopy.length, 2)
    assert.strictEqual(eeListenersCopy[0], listener)
    assert.strictEqual(eeListenersCopy[1], listener2)
  })

  it('previously captured listeners() snapshot is not affected by later on()', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener)
    const eeListenersCopy = ee.listeners('foo')
    ee.on('foo', listener2)

    const listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 2)
    assert.strictEqual(listeners[0], listener)
    assert.strictEqual(listeners[1], listener2)

    assert.ok(Array.isArray(eeListenersCopy))
    assert.strictEqual(eeListenersCopy.length, 1)
    assert.strictEqual(eeListenersCopy[0], listener)
  })

  it('listeners() unwraps once listeners', () => {
    const ee = new EventEmitter()
    ee.once('foo', listener)
    const listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener)
  })

  it('listeners() returns both on and once listeners unwrapped', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener)
    ee.once('foo', listener2)

    const listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 2)
    assert.strictEqual(listeners[0], listener)
    assert.strictEqual(listeners[1], listener2)
  })

  it('listeners() returns empty array when _events is undefined', () => {
    const ee = new EventEmitter()
    ee._events = undefined
    const listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
  })

  it('listeners() returns empty array for subclass with no listeners', () => {
    const s = new (TestStream as any)()
    const listeners = s.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
  })

  it('rawListeners() returns wrapped once listeners with .listener property', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener)
    let wrappedListener = ee.rawListeners('foo')
    assert.strictEqual(wrappedListener.length, 1)
    assert.strictEqual(wrappedListener[0], listener)
    assert.notStrictEqual(wrappedListener, ee.rawListeners('foo'))
    ee.once('foo', listener)
    const wrappedListeners = ee.rawListeners('foo')
    assert.strictEqual(wrappedListeners.length, 2)
    assert.strictEqual(wrappedListeners[0], listener)
    assert.notStrictEqual(wrappedListeners[1], listener)
    assert.strictEqual((wrappedListeners[1] as any).listener, listener)
    assert.notStrictEqual(wrappedListeners, ee.rawListeners('foo'))
    ee.emit('foo')
    assert.strictEqual(wrappedListeners.length, 2)
    assert.strictEqual((wrappedListeners[1] as any).listener, listener)
  })

  it('rawListeners() can invoke once listener without removing it', () => {
    const ee = new EventEmitter()
    ee.once('foo', listener3)
    ee.on('foo', listener4)
    const rawListeners = ee.rawListeners('foo')
    assert.strictEqual(rawListeners.length, 2)
    assert.strictEqual(rawListeners[0](), 0)
    const rawListener = ee.rawListeners('foo')
    assert.strictEqual(rawListener.length, 1)
    assert.strictEqual(rawListener[0](), 1)
  })
})

// ---------------------------------------------------------------------------
// max-listeners
// ---------------------------------------------------------------------------

describe('max-listeners', () => {
  const savedDefault = EventEmitter.defaultMaxListeners

  afterEach(() => {
    EventEmitter.defaultMaxListeners = savedDefault
  })

  it('setMaxListeners throws for invalid values', () => {
    const tracker = new CallTracker()
    const e = new EventEmitter()

    e.on('maxListeners', tracker.mustCall())

    e.setMaxListeners(42)

    const throwsObjs = [NaN, -1, 'and even this']
    const maxError = /^RangeError: The value of "n" is out of range\. It must be a non-negative number\./
    const defError =
      /^RangeError: The value of "defaultMaxListeners" is out of range\. It must be a non-negative number\./

    for (let i = 0; i < throwsObjs.length; i++) {
      const obj = throwsObjs[i]
      assert.throws(function () {
        e.setMaxListeners(obj as any)
      }, maxError)
      assert.throws(function () {
        EventEmitter.defaultMaxListeners = obj as any
      }, defError)
    }

    e.emit('maxListeners')
    tracker.verify()
  })
})

// ---------------------------------------------------------------------------
// method-names
// ---------------------------------------------------------------------------

describe('method-names', () => {
  it('prototype methods have correct names', () => {
    const E = EventEmitter.prototype
    assert.strictEqual(E.constructor.name, 'EventEmitter')
    assert.strictEqual(E.on, E.addListener) // Same method.
    assert.strictEqual(E.off, E.removeListener) // Same method.
    Object.getOwnPropertyNames(E).forEach(function (name) {
      if (name === 'constructor' || name === 'on' || name === 'off') return
      if (typeof (E as any)[name] !== 'function') return
      assert.strictEqual((E as any)[name].name, name)
    })
  })
})

// ---------------------------------------------------------------------------
// modify-in-emit
// ---------------------------------------------------------------------------

describe('modify-in-emit', () => {
  it('modifying listeners during emit propagates correctly', () => {
    const callbacks_called: string[] = []
    const e = new EventEmitter()

    function callback1() {
      callbacks_called.push('callback1')
      e.on('foo', callback2)
      e.on('foo', callback3)
      e.removeListener('foo', callback1)
    }

    function callback2() {
      callbacks_called.push('callback2')
      e.removeListener('foo', callback2)
    }

    function callback3() {
      callbacks_called.push('callback3')
      e.removeListener('foo', callback3)
    }

    e.on('foo', callback1)
    assert.strictEqual(e.listeners('foo').length, 1)

    e.emit('foo')
    assert.strictEqual(e.listeners('foo').length, 2)
    assert.ok(Array.isArray(callbacks_called))
    assert.strictEqual(callbacks_called.length, 1)
    assert.strictEqual(callbacks_called[0], 'callback1')

    e.emit('foo')
    assert.strictEqual(e.listeners('foo').length, 0)
    assert.ok(Array.isArray(callbacks_called))
    assert.strictEqual(callbacks_called.length, 3)
    assert.strictEqual(callbacks_called[0], 'callback1')
    assert.strictEqual(callbacks_called[1], 'callback2')
    assert.strictEqual(callbacks_called[2], 'callback3')

    e.emit('foo')
    assert.strictEqual(e.listeners('foo').length, 0)
    assert.ok(Array.isArray(callbacks_called))
    assert.strictEqual(callbacks_called.length, 3)

    e.on('foo', callback1)
    e.on('foo', callback2)
    assert.strictEqual(e.listeners('foo').length, 2)
    e.removeAllListeners('foo')
    assert.strictEqual(e.listeners('foo').length, 0)
  })

  it('removing callbacks in emit still propagates to all listeners', () => {
    const callbacks_called: string[] = []
    const e = new EventEmitter()

    function callback2() {
      callbacks_called.push('callback2')
      e.removeListener('foo', callback2)
    }

    function callback3() {
      callbacks_called.push('callback3')
      e.removeListener('foo', callback3)
    }

    e.on('foo', callback2)
    e.on('foo', callback3)
    assert.strictEqual(2, e.listeners('foo').length)
    e.emit('foo')
    assert.ok(Array.isArray(callbacks_called))
    assert.strictEqual(callbacks_called.length, 2)
    assert.strictEqual(callbacks_called[0], 'callback2')
    assert.strictEqual(callbacks_called[1], 'callback3')
    assert.strictEqual(0, e.listeners('foo').length)
  })
})

// ---------------------------------------------------------------------------
// num-args
// ---------------------------------------------------------------------------

describe('num-args', () => {
  it('passes correct number of arguments to listeners', () => {
    const e = new EventEmitter()
    const num_args_emitted: number[] = []

    e.on('numArgs', function () {
      const numArgs = arguments.length
      num_args_emitted.push(numArgs)
    })

    e.on('foo', function () {
      num_args_emitted.push(arguments.length)
    })

    e.on('foo', function () {
      num_args_emitted.push(arguments.length)
    })

    e.emit('numArgs')
    e.emit('numArgs', null)
    e.emit('numArgs', null, null)
    e.emit('numArgs', null, null, null)
    e.emit('numArgs', null, null, null, null)
    e.emit('numArgs', null, null, null, null, null)

    e.emit('foo', null, null, null, null)

    assert.ok(Array.isArray(num_args_emitted))
    assert.strictEqual(num_args_emitted.length, 8)
    assert.strictEqual(num_args_emitted[0], 0)
    assert.strictEqual(num_args_emitted[1], 1)
    assert.strictEqual(num_args_emitted[2], 2)
    assert.strictEqual(num_args_emitted[3], 3)
    assert.strictEqual(num_args_emitted[4], 4)
    assert.strictEqual(num_args_emitted[5], 5)
    assert.strictEqual(num_args_emitted[6], 4)
    assert.strictEqual(num_args_emitted[6], 4)
  })
})

// ---------------------------------------------------------------------------
// once
// ---------------------------------------------------------------------------

describe('once', () => {
  it('once listener fires only on first emit', () => {
    const tracker = new CallTracker()
    const e = new EventEmitter()

    e.once('hello', tracker.mustCall())

    e.emit('hello', 'a', 'b')
    e.emit('hello', 'a', 'b')
    e.emit('hello', 'a', 'b')
    e.emit('hello', 'a', 'b')

    tracker.verify()
  })

  it('removeListener before emit prevents once listener from firing', () => {
    const e = new EventEmitter()

    function remove() {
      assert.fail('once->foo should not be emitted')
    }

    e.once('foo', remove)
    e.removeListener('foo', remove)
    e.emit('foo')
  })

  it('once listener can trigger another emit of same event', () => {
    const tracker = new CallTracker()
    const e = new EventEmitter()

    e.once(
      'e',
      tracker.mustCall(function () {
        e.emit('e')
      })
    )

    e.once('e', tracker.mustCall())

    e.emit('e')
    tracker.verify()
  })

  it('throws TypeError when listener is not a function', () => {
    assert.throws(function () {
      const ee = new EventEmitter()
      ee.once('foo', null as any)
    }, /^TypeError: The "listener" argument must be of type Function\. Received type object$/)
  })

  it('once listener receives correct arguments for varying arg counts', () => {
    const tracker = new CallTracker()
    const maxArgs = 4

    for (let i = 0; i <= maxArgs; ++i) {
      const ee = new EventEmitter()
      const args: any[] = ['foo']

      for (let j = 0; j < i; ++j) args.push(j)

      ee.once(
        'foo',
        tracker.mustCall(function () {
          const params = Array.prototype.slice.call(arguments)
          const restArgs = args.slice(1)
          assert.ok(Array.isArray(params))
          assert.strictEqual(params.length, restArgs.length)
          for (let index = 0; index < params.length; index++) {
            assert.strictEqual(params[index], restArgs[index])
          }
        })
      )

      EventEmitter.prototype.emit.apply(ee, args as any)
    }

    tracker.verify()
  })
})

// ---------------------------------------------------------------------------
// prepend
// ---------------------------------------------------------------------------

describe('prepend', () => {
  it('prependListener and prependOnceListener execute in prepended order', () => {
    const tracker = new CallTracker()
    const myEE = new EventEmitter()
    let m = 0

    // This one comes last.
    myEE.on(
      'foo',
      tracker.mustCall(function () {
        assert.strictEqual(m, 2)
      })
    )

    // This one comes second.
    myEE.prependListener(
      'foo',
      tracker.mustCall(function () {
        assert.strictEqual(m++, 1)
      })
    )

    // This one comes first.
    myEE.prependOnceListener(
      'foo',
      tracker.mustCall(function () {
        assert.strictEqual(m++, 0)
      })
    )

    myEE.emit('foo')
    tracker.verify()
  })

  it('throws TypeError when prependOnceListener listener is not a function', () => {
    assert.throws(function () {
      const ee = new EventEmitter()
      ee.prependOnceListener('foo', null as any)
    }, 'TypeError: The "listener" argument must be of type Function. Received type object')
  })
})

// ---------------------------------------------------------------------------
// remove-all-listeners
// ---------------------------------------------------------------------------

describe('remove-all-listeners', () => {
  it('removeAllListeners for specific events emits removeListener and preserves snapshots', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    const noop = tracker.mustNotCall()
    ee.on('foo', noop)
    ee.on('bar', noop)
    ee.on('baz', noop)
    ee.on('baz', noop)
    const fooListeners = ee.listeners('foo')
    const barListeners = ee.listeners('bar')
    const bazListeners = ee.listeners('baz')

    const actual: string[] = []
    ee.on(
      'removeListener',
      tracker.mustCall((name: string) => {
        actual.push(name)
      }, 3)
    )
    ee.removeAllListeners('bar')
    ee.removeAllListeners('baz')

    // Verify collected removeListener event names (order-independent)
    assert.deepStrictEqual([...actual].sort(), ['bar', 'baz', 'baz'].sort())

    let listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], noop)

    listeners = ee.listeners('bar')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
    listeners = ee.listeners('baz')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)

    // After calling removeAllListeners(), the old listeners array should stay unchanged.
    assert.strictEqual(fooListeners.length, 1)
    assert.strictEqual(fooListeners[0], noop)
    assert.strictEqual(barListeners.length, 1)
    assert.strictEqual(barListeners[0], noop)
    assert.strictEqual(bazListeners.length, 2)
    assert.strictEqual(bazListeners[0], noop)
    assert.strictEqual(bazListeners[1], noop)

    // After calling removeAllListeners(), new listeners arrays are different from the old.
    assert.notStrictEqual(ee.listeners('bar'), barListeners)
    assert.notStrictEqual(ee.listeners('baz'), bazListeners)

    tracker.verify()
  })

  it('removeAllListeners() with no args emits removeListener for all in LIFO order', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('foo', tracker.mustNotCall())
    ee.on('bar', tracker.mustNotCall())

    const actual1: string[] = []
    const actual2: string[] = []

    ee.on(
      'removeListener',
      tracker.mustCall((name: string) => {
        actual1.push(name)
      }, 3)
    )
    ee.on(
      'removeListener',
      tracker.mustCall((name: string) => {
        actual2.push(name)
      }, 2)
    )
    ee.removeAllListeners()

    assert.deepStrictEqual([...actual1].sort(), ['bar', 'foo', 'removeListener'].sort())
    assert.deepStrictEqual([...actual2].sort(), ['bar', 'foo'].sort())

    let listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
    listeners = ee.listeners('bar')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)

    tracker.verify()
  })

  it('removeAllListeners for nonexistent event with removeListener handler does not throw', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('removeListener', tracker.mustNotCall())
    assert.doesNotThrow(function () {
      ee.removeAllListeners(ee as any)
    })
    tracker.verify()
  })

  it('removeAllListeners fires removeListener with decreasing baz listener count', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    let expectLength = 2
    ee.on('removeListener', function (this: typeof ee) {
      assert.strictEqual(expectLength--, this.listeners('baz').length)
    })
    ee.on('baz', tracker.mustNotCall())
    ee.on('baz', tracker.mustNotCall())
    ee.on('baz', tracker.mustNotCall())
    assert.strictEqual(ee.listeners('baz').length, expectLength + 1)
    ee.removeAllListeners('baz')
    assert.strictEqual(ee.listeners('baz').length, 0)
    tracker.verify()
  })

  it('removeAllListeners() returns this', () => {
    const ee = new EventEmitter()
    assert.strictEqual(ee, ee.removeAllListeners())
  })

  it('removeAllListeners() returns this when _events is undefined', () => {
    const ee = new EventEmitter()
    ee._events = undefined
    assert.strictEqual(ee, ee.removeAllListeners())
  })
})

// ---------------------------------------------------------------------------
// remove-listeners
// ---------------------------------------------------------------------------

describe('remove-listeners', () => {
  const listener1 = function listener1() {}
  const listener2 = function listener2() {}

  it('emits removeListener event when removing a listener', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('hello', listener1)
    ee.on(
      'removeListener',
      tracker.mustCall(function (name: string, cb: Function) {
        assert.strictEqual(name, 'hello')
        assert.strictEqual(cb, listener1)
      })
    )
    ee.removeListener('hello', listener1)
    const listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
    tracker.verify()
  })

  it('removeListener does not emit when listener not found', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('hello', listener1)
    ee.on('removeListener', tracker.mustNotCall())
    ee.removeListener('hello', listener2)

    const listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener1)
    tracker.verify()
  })

  it('removeListener updates listeners list and emits correct event', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('hello', listener1)
    ee.on('hello', listener2)

    let listeners: Function[]
    ee.once(
      'removeListener',
      tracker.mustCall(function (name: string, cb: Function) {
        assert.strictEqual(name, 'hello')
        assert.strictEqual(cb, listener1)
        listeners = ee.listeners('hello')
        assert.ok(Array.isArray(listeners))
        assert.strictEqual(listeners.length, 1)
        assert.strictEqual(listeners[0], listener2)
      })
    )
    ee.removeListener('hello', listener1)
    listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 1)
    assert.strictEqual(listeners[0], listener2)

    ee.once(
      'removeListener',
      tracker.mustCall(function (name: string, cb: Function) {
        assert.strictEqual(name, 'hello')
        assert.strictEqual(cb, listener2)
        listeners = ee.listeners('hello')
        assert.ok(Array.isArray(listeners))
        assert.strictEqual(listeners.length, 0)
      })
    )
    ee.removeListener('hello', listener2)
    listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)

    tracker.verify()
  })

  it('removeListener inside removeListener handler works correctly', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()

    function remove1() {
      assert.fail('remove1 should not have been called')
    }

    function remove2() {
      assert.fail('remove2 should not have been called')
    }

    ee.on(
      'removeListener',
      tracker.mustCall(function (this: typeof ee, name: string, cb: Function) {
        if (cb !== remove1) return
        this.removeListener('quux', remove2)
        this.emit('quux')
      }, 2)
    )
    ee.on('quux', remove1)
    ee.on('quux', remove2)
    ee.removeListener('quux', remove1)
    tracker.verify()
  })

  it('nested removeListener in removeListener handler', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.on('hello', listener1)
    ee.on('hello', listener2)

    let listeners: Function[]
    ee.once(
      'removeListener',
      tracker.mustCall(function (name: string, cb: Function) {
        assert.strictEqual(name, 'hello')
        assert.strictEqual(cb, listener1)
        listeners = ee.listeners('hello')
        assert.ok(Array.isArray(listeners))
        assert.strictEqual(listeners.length, 1)
        assert.strictEqual(listeners[0], listener2)
        ee.once(
          'removeListener',
          tracker.mustCall(function (name: string, cb: Function) {
            assert.strictEqual(name, 'hello')
            assert.strictEqual(cb, listener2)
            listeners = ee.listeners('hello')
            assert.ok(Array.isArray(listeners))
            assert.strictEqual(listeners.length, 0)
          })
        )
        ee.removeListener('hello', listener2)
        listeners = ee.listeners('hello')
        assert.ok(Array.isArray(listeners))
        assert.strictEqual(listeners.length, 0)
      })
    )
    ee.removeListener('hello', listener1)
    listeners = ee.listeners('hello')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 0)
    tracker.verify()
  })

  it('listener removed inside emit is still called for that emit', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    const listener3 = tracker.mustCall(function (this: typeof ee) {
      ee.removeListener('hello', listener4)
    }, 2)
    const listener4 = tracker.mustCall()

    ee.on('hello', listener3)
    ee.on('hello', listener4)

    // listener4 will still be called although it is removed by listener3.
    ee.emit('hello')
    // Internal listener array [listener3]
    ee.emit('hello')
    tracker.verify()
  })

  it('once listener emits removeListener with original listener', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    ee.once('hello', listener1)
    ee.on(
      'removeListener',
      tracker.mustCall(function (eventName: string, listener: Function) {
        assert.strictEqual(eventName, 'hello')
        assert.strictEqual(listener, listener1)
      })
    )
    ee.emit('hello')
    tracker.verify()
  })

  it('removeListener returns this', () => {
    const ee = new EventEmitter()
    assert.strictEqual(ee, ee.removeListener('foo', function () {}))
  })

  it('throws TypeError when removed listener is not a function', () => {
    assert.throws(function () {
      const ee = new EventEmitter()
      ee.removeListener('foo', null as any)
    }, /^TypeError: The "listener" argument must be of type Function\. Received type object$/)
  })

  it('removeListener returns this when _events is undefined', () => {
    const ee = new EventEmitter()
    const listener = function () {}
    ee._events = undefined
    const e = ee.removeListener('foo', listener)
    assert.strictEqual(e, ee)
  })

  it('removeListener collapses array to single value after removing', () => {
    const ee = new EventEmitter()
    ee.on('foo', listener1)
    ee.on('foo', listener2)
    let listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 2)
    assert.strictEqual(listeners[0], listener1)
    assert.strictEqual(listeners[1], listener2)

    ee.removeListener('foo', listener1)
    assert.strictEqual(ee._events!.foo, listener2)

    ee.on('foo', listener1)
    listeners = ee.listeners('foo')
    assert.ok(Array.isArray(listeners))
    assert.strictEqual(listeners.length, 2)
    assert.strictEqual(listeners[0], listener2)
    assert.strictEqual(listeners[1], listener1)

    ee.removeListener('foo', listener1)
    assert.strictEqual(ee._events!.foo, listener2)
  })
})

// ---------------------------------------------------------------------------
// set-max-listeners-side-effects
// ---------------------------------------------------------------------------

describe('set-max-listeners-side-effects', () => {
  it('setMaxListeners does not add entries to _events', () => {
    const e = new EventEmitter()
    assert.ok(!(e._events instanceof Object))
    assert.strictEqual(Object.keys(e._events!).length, 0)
    e.setMaxListeners(5)
    assert.strictEqual(Object.keys(e._events!).length, 0)
  })
})

// ---------------------------------------------------------------------------
// special-event-names
// ---------------------------------------------------------------------------

describe('special-event-names', () => {
  it('supports special property names as event names', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    const handler = function () {}

    assert.strictEqual(ee.eventNames().length, 0)

    assert.strictEqual((ee._events as any).hasOwnProperty, undefined)
    assert.strictEqual((ee._events as any).toString, undefined)

    ee.on('__defineGetter__', handler)
    ee.on('toString', handler)
    ee.on('__proto__', handler)

    assert.strictEqual(ee.eventNames()[0], '__defineGetter__')
    assert.strictEqual(ee.eventNames()[1], 'toString')

    assert.strictEqual(ee.listeners('__defineGetter__').length, 1)
    assert.strictEqual(ee.listeners('__defineGetter__')[0], handler)
    assert.strictEqual(ee.listeners('toString').length, 1)
    assert.strictEqual(ee.listeners('toString')[0], handler)

    // Only run __proto__ tests if that property can actually be set
    if (({ __proto__: 'ok' } as any).__proto__ === 'ok') {
      assert.strictEqual(ee.eventNames().length, 3)
      assert.strictEqual(ee.eventNames()[2], '__proto__')
      assert.strictEqual(ee.listeners('__proto__').length, 1)
      assert.strictEqual(ee.listeners('__proto__')[0], handler)

      ee.on(
        '__proto__',
        tracker.mustCall(function (val: number) {
          assert.strictEqual(val, 1)
        })
      )
      ee.emit('__proto__', 1)

      process.on(
        '__proto__' as any,
        tracker.mustCall(function (val: number) {
          assert.strictEqual(val, 1)
        })
      )
      process.emit('__proto__' as any, 1)

      tracker.verify()
    }
  })
})

// ---------------------------------------------------------------------------
// subclass
// ---------------------------------------------------------------------------

describe('subclass', () => {
  it('subclass can call once/emit/removeAllListeners before EventEmitter.call', () => {
    const tracker = new CallTracker()

    function MyEE(this: any, cb: Function) {
      this.once(1 as any, cb)
      this.emit(1 as any)
      this.removeAllListeners()
      ;(EventEmitter as any).call(this)
    }
    inherits(MyEE, EventEmitter as any)

    const myee = new (MyEE as any)(tracker.mustCall()) as any

    assert.throws(function () {
      function ErrorEE(this: any) {
        this.emit('error', new Error('blerg'))
      }
      inherits(ErrorEE, EventEmitter as any)
      new (ErrorEE as any)()
    }, /blerg/)

    assert.ok(!(myee._events instanceof Object))
    assert.strictEqual(Object.keys(myee._events).length, 0)

    tracker.verify()
  })

  it('two instances of a subclass do not share listeners', () => {
    function MyEE2(this: any) {
      ;(EventEmitter as any).call(this)
    }
    ;(MyEE2 as any).prototype = new EventEmitter()

    const ee1 = new (MyEE2 as any)()
    const ee2 = new (MyEE2 as any)()

    ee1.on('x', function () {})

    assert.strictEqual(ee2.listenerCount('x'), 0)
  })
})

// ---------------------------------------------------------------------------
// symbols
// ---------------------------------------------------------------------------

describe('symbols', () => {
  it('supports Symbol event names', () => {
    const tracker = new CallTracker()
    const ee = new EventEmitter()
    const foo = Symbol('foo')
    const listener = tracker.mustCall()

    ee.on(foo as any, listener)
    assert.strictEqual(ee.listeners(foo as any).length, 1)
    assert.strictEqual(ee.listeners(foo as any)[0], listener)

    ee.emit(foo as any)

    ee.removeAllListeners()
    assert.strictEqual(ee.listeners(foo as any).length, 0)

    ee.on(foo as any, listener)
    assert.strictEqual(ee.listeners(foo as any).length, 1)
    assert.strictEqual(ee.listeners(foo as any)[0], listener)

    ee.removeListener(foo as any, listener)
    assert.strictEqual(ee.listeners(foo as any).length, 0)

    tracker.verify()
  })
})
