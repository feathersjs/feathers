/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'assert'
import { feathers, Application, HookContext } from '@feathersjs/feathers'
import { channels } from '../../src/channels'
import { Channel } from '../../src/channels/channel/base'
import { CombinedChannel } from '../../src/channels/channel/combined'

class TestService {
  events = ['foo']

  async create(payload: any) {
    return payload
  }
}

describe('app.publish', () => {
  let app: Application

  beforeEach(() => {
    app = feathers().configure(channels())
  })

  it('throws an error if service does not send the event', () => {
    try {
      app.use('/test', {
        create(data: any) {
          return Promise.resolve(data)
        }
      })

      app.service('test').registerPublisher('created', function () {})
      app.service('test').registerPublisher('bla', function () {})
      assert.ok(false, 'Should never get here')
    } catch (e: any) {
      assert.strictEqual(e.message, "'bla' is not a valid service event")
    }
  })

  describe('registration and `dispatch` event', () => {
    const c1 = { id: 1, test: true }
    const c2 = { id: 2, test: true }
    const data = { message: 'This is a test' }

    beforeEach(() => {
      app.use('/test', new TestService())
    })

    it('error in publisher is handled gracefully (#1707)', async () => {
      app.service('test').publish('created', () => {
        throw new Error('Something went wrong')
      })

      try {
        await app.service('test').create({ message: 'something' })
      } catch (error: any) {
        assert.fail('Should never get here')
      }
    })

    it('simple event registration and dispatching', () =>
      new Promise<void>((resolve, reject) => {
        app.channel('testing').join(c1)

        app.service('test').registerPublisher('created', () => app.channel('testing'))

        app.once('publish', (event: string, channel: Channel, hook: HookContext) => {
          try {
            assert.strictEqual(event, 'created')
            assert.strictEqual(hook.path, 'test')
            assert.deepStrictEqual(hook.result, data)
            assert.deepStrictEqual(channel.connections, [c1])
            resolve()
          } catch (error: any) {
            reject(error)
          }
        })

        app.service('test').create(data).catch(reject)
      }))

    it('app and global level dispatching and precedence', () =>
      new Promise<void>((resolve, reject) => {
        app.channel('testing').join(c1)
        app.channel('other').join(c2)

        app.registerPublisher('created', () => app.channel('testing'))
        app.registerPublisher(() => app.channel('other'))

        app.once('publish', (_event: string, channel: Channel) => {
          assert.ok(channel.connections.indexOf(c1) !== -1)
          resolve()
        })

        app.service('test').create(data).catch(reject)
      }))

    it('promise event dispatching', () =>
      new Promise<void>((resolve, reject) => {
        app.channel('testing').join(c1)
        app.channel('othertest').join(c2)

        app
          .service('test')
          .registerPublisher(
            'created',
            () => new Promise((resolve) => setTimeout(() => resolve(app.channel('testing')), 50))
          )
        app
          .service('test')
          .registerPublisher(
            'created',
            () =>
              new Promise((resolve) => setTimeout(() => resolve(app.channel('testing', 'othertest')), 100))
          )

        app.once('publish', (_event: string, channel: Channel, hook: HookContext) => {
          assert.deepStrictEqual(hook.result, data)
          assert.deepStrictEqual(channel.connections, [c1, c2])
          resolve()
        })

        app.service('test').create(data).catch(reject)
      }))

    it('custom event dispatching', () =>
      new Promise<void>((resolve) => {
        const eventData = { testing: true }

        app.channel('testing').join(c1)
        app.channel('othertest').join(c2)

        app.service('test').registerPublisher('foo', () => app.channel('testing'))

        app.once('publish', (event: string, channel: Channel, hook: HookContext) => {
          assert.strictEqual(event, 'foo')
          assert.deepStrictEqual(hook, {
            app,
            path: 'test',
            service: app.service('test'),
            result: eventData
          })
          assert.deepStrictEqual(channel.connections, [c1])
          resolve()
        })

        app.service('test').emit('foo', eventData)
      }))

    it('does not sent `dispatch` event if there are no dispatchers', () =>
      new Promise<void>((resolve, reject) => {
        app.once('publish', () => reject(new Error('Should never get here')))

        process.once('unhandledRejection', (error) => reject(error))

        app
          .service('test')
          .create(data)
          .then(() => resolve())
          .catch(reject)
      }))

    it('does not send `dispatch` event if there are no connections', () =>
      new Promise<void>((resolve, reject) => {
        app.service('test').registerPublisher('created', () => app.channel('dummy'))
        app.once('publish', () => reject(new Error('Should never get here')))

        app
          .service('test')
          .create(data)
          .then(() => resolve())
          .catch(reject)
      }))

    it('dispatcher returning an array of channels', () =>
      new Promise<void>((resolve, reject) => {
        app.channel('testing').join(c1)
        app.channel('othertest').join(c2)

        app
          .service('test')
          .registerPublisher('created', () => [app.channel('testing'), app.channel('othertest')])

        app.once('publish', (_event: string, channel: Channel, hook: HookContext) => {
          assert.deepStrictEqual(hook.result, data)
          assert.deepStrictEqual(channel.connections, [c1, c2])
          resolve()
        })

        app.service('test').create(data).catch(reject)
      }))

    it('dispatcher can send data', () =>
      new Promise<void>((resolve, reject) => {
        const c1data = { channel: 'testing' }

        app.channel('testing').join(c1)
        app.channel('othertest').join(c2)

        app
          .service('test')
          .registerPublisher('created', () => [app.channel('testing').send(c1data), app.channel('othertest')])

        app.once('publish', (_event: string, channel: CombinedChannel, hook: HookContext) => {
          assert.deepStrictEqual(hook.result, data)
          assert.deepStrictEqual(channel.dataFor(c1), c1data)
          assert.ok(channel.dataFor(c2) === null)
          assert.deepStrictEqual(channel.connections, [c1, c2])
          resolve()
        })

        app.service('test').create(data).catch(reject)
      }))

    it('publisher precedence and preventing publishing', () =>
      new Promise<void>((resolve, reject) => {
        app.channel('test').join(c1)

        app.registerPublisher(() => app.channel('test'))
        app.service('test').registerPublisher('created', (): null => null)

        app.once('publish', () => reject(new Error('Should never get here')))

        app
          .service('test')
          .create(data)
          .then(() => resolve())
          .catch(reject)
      }))

    it('data of first channel has precedence', () =>
      new Promise<void>((resolve, reject) => {
        const sendData = { test: true }

        app.channel('testing').join(c1)
        app.channel('othertest').join(c1)

        app.service('test').registerPublisher('created', () => {
          return [app.channel('testing'), app.channel('othertest').send(sendData)]
        })

        app.once('publish', (_event: string, channel: CombinedChannel) => {
          assert.strictEqual(channel.dataFor(c1), null)
          assert.deepStrictEqual(channel.connections, [c1])
          resolve()
        })

        app.service('test').create(data).catch(reject)
      }))
  })
})
