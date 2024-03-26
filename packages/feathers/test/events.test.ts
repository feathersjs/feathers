import assert from 'assert'
import { EventEmitter } from 'events'

import { feathers } from '../src'

describe('Service events', () => {
  it('app is an event emitter', () =>
    new Promise<void>((resolve) => {
      const app = feathers()

      assert.strictEqual(typeof app.on, 'function')

      app.on('test', (data: any) => {
        assert.deepStrictEqual(data, { message: 'app' })
        resolve()
      })
      app.emit('test', { message: 'app' })
    }))

  it('works with service that is already an EventEmitter', () =>
    new Promise<void>((resolve) => {
      const app = feathers()
      const service: any = new EventEmitter()

      service.create = async function (data: any) {
        return data
      }

      service.on('created', (data: any) => {
        assert.deepStrictEqual(data, {
          message: 'testing'
        })
        resolve()
      })

      app.use('/emitter', service)

      app.service('emitter').create({
        message: 'testing'
      })
    }))

  describe('emits event data on a service', () => {
    it('.create and created', () =>
      new Promise<void>((resolve) => {
        const app = feathers().use('/creator', {
          async create(data: any) {
            return data
          }
        })

        const service = app.service('creator')

        service.on('created', (data: any) => {
          assert.deepStrictEqual(data, { message: 'Hello' })
          resolve()
        })

        service.create({ message: 'Hello' })
      }))

    it('allows to skip event emitting', () =>
      new Promise<void>((resolve, reject) => {
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

        service.on('created', () => {
          reject(new Error('Should never get here'))
        })

        service.create({ message: 'Hello' }).then(() => resolve())
      }))

    it('.update and updated', () =>
      new Promise<void>((resolve) => {
        const app = feathers().use('/creator', {
          async update(id: any, data: any) {
            return Object.assign({ id }, data)
          }
        })

        const service = app.service('creator')

        service.on('updated', (data: any) => {
          assert.deepStrictEqual(data, { id: 10, message: 'Hello' })
          resolve()
        })

        service.update(10, { message: 'Hello' })
      }))

    it('.patch and patched', () =>
      new Promise<void>((resolve) => {
        const app = feathers().use('/creator', {
          async patch(id: any, data: any) {
            return Object.assign({ id }, data)
          }
        })

        const service = app.service('creator')

        service.on('patched', (data: any) => {
          assert.deepStrictEqual(data, { id: 12, message: 'Hello' })
          resolve()
        })

        service.patch(12, { message: 'Hello' })
      }))

    it('.remove and removed', () =>
      new Promise<void>((resolve) => {
        const app = feathers().use('/creator', {
          async remove(id: any) {
            return { id }
          }
        })

        const service = app.service('creator')

        service.on('removed', (data: any) => {
          assert.deepStrictEqual(data, { id: 22 })
          resolve()
        })

        service.remove(22)
      }))
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
    it('also emits the actual hook object', () =>
      new Promise<void>((resolve, reject) => {
        const app = feathers().use('/creator', {
          async create(data: any) {
            return data
          }
        })

        const service = app.service('creator')

        service.hooks({
          after(hook: any) {
            hook.changed = true
          }
        })

        service.on('created', (data: any, hook: any) => {
          try {
            assert.deepStrictEqual(data, { message: 'Hi' })
            assert.ok(hook.changed)
            assert.strictEqual(hook.service, service)
            assert.strictEqual(hook.method, 'create')
            assert.strictEqual(hook.type, 'around')
            resolve()
          } catch (error: any) {
            reject(error)
          }
        })

        service.create({ message: 'Hi' })
      }))

    it('events indicated by the service are not sent automatically', () =>
      new Promise<void>((resolve) => {
        class Creator {
          events = ['created']
          async create(data: any) {
            return data
          }
        }
        const app = feathers().use('/creator', new Creator())
        const service = app.service('creator')

        service.on('created', (data: any) => {
          assert.deepStrictEqual(data, { message: 'custom event' })
          resolve()
        })

        service.create({ message: 'hello' })
        service.emit('created', { message: 'custom event' })
      }))
  })
})
