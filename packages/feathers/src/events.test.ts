import { describe, it, expect, vi } from 'vitest'
import assert from 'assert'
import { EventEmitter } from '../src/events.js'
import { feathers } from '../src/index.js'

describe('EventEmitter', () => {
  it('on and emit', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.on('test', callback)
    emitter.emit('test', 'a', 'b')

    expect(callback).toHaveBeenCalledWith('a', 'b')
  })

  it('emit returns false when no listeners', () => {
    const emitter = new EventEmitter()
    expect(emitter.emit('test')).toBe(false)
  })

  it('emit returns true when listeners exist', () => {
    const emitter = new EventEmitter()
    emitter.on('test', () => {})
    expect(emitter.emit('test')).toBe(true)
  })

  it('addListener is an alias for on', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.addListener('test', callback)
    emitter.emit('test', 'data')

    expect(callback).toHaveBeenCalledWith('data')
  })

  it('once fires only once', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.once('test', callback)
    emitter.emit('test', 'first')
    emitter.emit('test', 'second')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
  })

  it('off removes a listener', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.on('test', callback)
    emitter.off('test', callback)
    emitter.emit('test')

    expect(callback).not.toHaveBeenCalled()
  })

  it('removeListener removes a listener', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.on('test', callback)
    emitter.removeListener('test', callback)
    emitter.emit('test')

    expect(callback).not.toHaveBeenCalled()
  })

  it('removeListener can remove a once listener by original reference', () => {
    const emitter = new EventEmitter()
    const callback = vi.fn()

    emitter.once('test', callback)
    emitter.removeListener('test', callback)
    emitter.emit('test')

    expect(callback).not.toHaveBeenCalled()
  })

  it('removeAllListeners for a specific event', () => {
    const emitter = new EventEmitter()
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const cb3 = vi.fn()

    emitter.on('a', cb1)
    emitter.on('a', cb2)
    emitter.on('b', cb3)

    emitter.removeAllListeners('a')
    emitter.emit('a')
    emitter.emit('b')

    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).not.toHaveBeenCalled()
    expect(cb3).toHaveBeenCalled()
  })

  it('removeAllListeners with no argument removes all', () => {
    const emitter = new EventEmitter()
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    emitter.on('a', cb1)
    emitter.on('b', cb2)

    emitter.removeAllListeners()
    emitter.emit('a')
    emitter.emit('b')

    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).not.toHaveBeenCalled()
  })

  it('listenerCount returns correct count', () => {
    const emitter = new EventEmitter()

    expect(emitter.listenerCount('test')).toBe(0)

    emitter.on('test', () => {})
    emitter.on('test', () => {})
    expect(emitter.listenerCount('test')).toBe(2)
  })

  it('listeners returns a copy of the listener array', () => {
    const emitter = new EventEmitter()
    const cb = () => {}

    emitter.on('test', cb)

    const result = emitter.listeners('test')
    expect(result).toEqual([cb])
    expect(result).not.toBe((emitter as any).__events['test'])
  })

  it('listeners returns empty array for unknown event', () => {
    const emitter = new EventEmitter()
    expect(emitter.listeners('nope')).toEqual([])
  })

  it('multiple listeners fire in order', () => {
    const emitter = new EventEmitter()
    const order: number[] = []

    emitter.on('test', () => order.push(1))
    emitter.on('test', () => order.push(2))
    emitter.on('test', () => order.push(3))
    emitter.emit('test')

    expect(order).toEqual([1, 2, 3])
  })

  it('removing a listener during emit does not skip others', () => {
    const emitter = new EventEmitter()
    const cb1 = vi.fn(() => emitter.removeListener('test', cb1))
    const cb2 = vi.fn()

    emitter.on('test', cb1)
    emitter.on('test', cb2)
    emitter.emit('test')

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('works as a base class', () => {
    class MyService extends EventEmitter {
      value = 42
    }

    const svc = new MyService()
    const callback = vi.fn()

    svc.on('created', callback)
    svc.emit('created', { id: 1 })

    expect(callback).toHaveBeenCalledWith({ id: 1 })
    expect(svc.value).toBe(42)
  })

  it('prototype methods can be mixed in via Object.assign', () => {
    const obj: any = {}
    Object.assign(obj, EventEmitter.prototype)

    const callback = vi.fn()
    obj.on('test', callback)
    obj.emit('test', 'hello')

    expect(callback).toHaveBeenCalledWith('hello')
  })

  it('chaining works on all mutating methods', () => {
    const emitter = new EventEmitter()
    const cb = () => {}

    const result = emitter
      .on('a', cb)
      .addListener('b', cb)
      .once('c', cb)
      .off('a', cb)
      .removeListener('b', cb)
      .removeAllListeners('c')

    expect(result).toBe(emitter)
  })
})

describe('Service events', () => {
  it('app is an event emitter', async () => {
    const app = feathers()

    assert.strictEqual(typeof app.on, 'function')

    await new Promise<void>((resolve) => {
      app.on('test', (data: any) => {
        assert.deepStrictEqual(data, { message: 'app' })
        resolve()
      })
      app.emit('test', { message: 'app' })
    })
  })

  it('works with service that is already an EventEmitter', async () => {
    const app = feathers()
    const service: any = new EventEmitter()

    service.create = async function (data: any) {
      return data
    }

    const promise = new Promise<void>((resolve) => {
      service.on('created', (data: any) => {
        assert.deepStrictEqual(data, {
          message: 'testing'
        })
        resolve()
      })
    })

    app.use('/emitter', service)

    await app.service('emitter').create({
      message: 'testing'
    })

    await promise
  })

  describe('emits event data on a service', () => {
    it('.create and created', async () => {
      const app = feathers().use('/creator', {
        async create(data: any) {
          return data
        }
      })

      const service = app.service('creator')

      const promise = new Promise<void>((resolve) => {
        service.on('created', (data: any) => {
          assert.deepStrictEqual(data, { message: 'Hello' })
          resolve()
        })
      })

      await service.create({ message: 'Hello' })
      await promise
    })

    it('allows to skip event emitting', async () => {
      const app = feathers().use('/creator', {
        async create(data: any) {
          return data
        }
      })

      const service = app.service('creator')

      service.hooks({
        before: {
          create(context: any) {
            context.event = null
            return context
          }
        }
      })

      let eventFired = false
      service.on('created', () => {
        eventFired = true
      })

      await service.create({ message: 'Hello' })
      assert.strictEqual(eventFired, false)
    })

    it('.update and updated', async () => {
      const app = feathers().use('/creator', {
        async update(id: any, data: any) {
          return Object.assign({ id }, data)
        }
      })

      const service = app.service('creator')

      const promise = new Promise<void>((resolve) => {
        service.on('updated', (data: any) => {
          assert.deepStrictEqual(data, { id: 10, message: 'Hello' })
          resolve()
        })
      })

      await service.update(10, { message: 'Hello' })
      await promise
    })

    it('.patch and patched', async () => {
      const app = feathers().use('/creator', {
        async patch(id: any, data: any) {
          return Object.assign({ id }, data)
        }
      })

      const service = app.service('creator')

      const promise = new Promise<void>((resolve) => {
        service.on('patched', (data: any) => {
          assert.deepStrictEqual(data, { id: 12, message: 'Hello' })
          resolve()
        })
      })

      await service.patch(12, { message: 'Hello' })
      await promise
    })

    it('.remove and removed', async () => {
      const app = feathers().use('/creator', {
        async remove(id: any) {
          return { id }
        }
      })

      const service = app.service('creator')

      const promise = new Promise<void>((resolve) => {
        service.on('removed', (data: any) => {
          assert.deepStrictEqual(data, { id: 22 })
          resolve()
        })
      })

      await service.remove(22)
      await promise
    })
  })

  describe('emits event data arrays on a service', () => {
    it('.create and created with array', async () => {
      const app = feathers().use('/creator', {
        async create(data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current) => (this as any).create(current)))
          }

          return data
        }
      })

      const service = app.service('creator')
      const createItems = [{ message: 'Hello 0' }, { message: 'Hello 1' }]

      const events = Promise.all(
        createItems.map((element, index) => {
          return new Promise<void>((resolve) => {
            service.on('created', (data: any) => {
              if (data.message === element.message) {
                assert.deepStrictEqual(data, { message: `Hello ${index}` })
                resolve()
              }
            })
          })
        })
      )

      await service.create(createItems)
      await events
    })

    it('.update and updated with array', async () => {
      const app = feathers().use('/creator', {
        async update(id: any, data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current, index) => (this as any).update(index, current)))
          }
          return Object.assign({ id }, data)
        }
      })

      const service = app.service('creator')
      const updateItems = [{ message: 'Hello 0' }, { message: 'Hello 1' }]

      const events = Promise.all(
        updateItems.map((element, index) => {
          return new Promise<void>((resolve) => {
            service.on('updated', (data: any) => {
              if (data.message === element.message) {
                assert.deepStrictEqual(data, {
                  id: index,
                  message: `Hello ${index}`
                })
                resolve()
              }
            })
          })
        })
      )

      await service.update(null, updateItems)
      await events
    })

    it('.patch and patched with array', async () => {
      const app = feathers().use('/creator', {
        async patch(id: any, data: any) {
          if (Array.isArray(data)) {
            return Promise.all(data.map((current, index) => (this as any).patch(index, current)))
          }
          return Object.assign({ id }, data)
        }
      })

      const service = app.service('creator')
      const patchItems = [{ message: 'Hello 0' }, { message: 'Hello 1' }]

      const events = Promise.all(
        patchItems.map((element, index) => {
          return new Promise<void>((resolve) => {
            service.on('patched', (data: any) => {
              if (data.message === element.message) {
                assert.deepStrictEqual(data, {
                  id: index,
                  message: `Hello ${index}`
                })
                resolve()
              }
            })
          })
        })
      )

      await service.patch(null, patchItems)
      await events
    })

    it('.remove and removed with array', async () => {
      const removeItems = [{ message: 'Hello 0' }, { message: 'Hello 1' }]

      const app = feathers().use('/creator', {
        async remove(id: any, data: any) {
          if (id === null) {
            return Promise.all(removeItems.map((current, index) => (this as any).remove(index, current)))
          }
          return Object.assign({ id }, data)
        }
      })

      const service = app.service('creator')

      const events = Promise.all(
        removeItems.map((element, index) => {
          return new Promise<void>((resolve) => {
            service.on('removed', (data: any) => {
              if (data.message === element.message) {
                assert.deepStrictEqual(data, {
                  id: index,
                  message: `Hello ${index}`
                })
                resolve()
              }
            })
          })
        })
      )

      await service.remove(null)
      await events
    })
  })

  describe('event format', () => {
    it('also emits the actual hook object', async () => {
      const app = feathers().use('/creator', {
        async create(data: any) {
          return data
        }
      })

      const service = app.service('creator')

      service.hooks({
        after(hook: any) {
          hook.number = 42
        }
      })

      const promise = new Promise<void>((resolve, reject) => {
        service.on('created', (data: any, hook: any) => {
          try {
            assert.deepStrictEqual(data, { message: 'Hi' })
            assert.strictEqual(hook.number, 42)
            resolve()
          } catch (error: any) {
            reject(error)
          }
        })
      })

      await service.create({ message: 'Hi' })
      await promise
    })

    it('events indicated by the service are not sent automatically', async () => {
      class Creator {
        events = ['created']
        async create(data: any) {
          return data
        }
      }
      const app = feathers().use('/creator', new Creator())
      const service = app.service('creator')

      const promise = new Promise<void>((resolve) => {
        service.on('created', (data: any) => {
          assert.deepStrictEqual(data, { message: 'custom event' })
          resolve()
        })
      })

      await service.create({ message: 'hello' })
      service.emit('created', { message: 'custom event' })
      await promise
    })
  })
})
