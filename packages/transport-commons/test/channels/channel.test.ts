/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'assert'
import { feathers, Application, RealTimeConnection } from '@feathersjs/feathers'
import { channels, keys } from '../../src/channels'
import { Channel } from '../../src/channels/channel/base'
import { CombinedChannel } from '../../src/channels/channel/combined'

const { CHANNELS } = keys

describe('app.channel', () => {
  let app: Application

  beforeEach(() => {
    app = feathers().configure(channels())
  })

  describe('base channels', () => {
    it('creates a new channel, app.channels has names', () => {
      assert.ok(app.channel('test') instanceof Channel)
      assert.deepStrictEqual(app.channels, ['test'])
    })

    it('.join', () => {
      const test = app.channel('test')
      const c1 = { id: 1 }
      const c2 = { id: 2 }
      const c3 = { id: 3 }

      assert.strictEqual(test.length, 0, 'Initial channel is empty')

      test.join(c1)
      test.join(c1)

      assert.strictEqual(test.length, 1, 'Joining twice only runs once')

      test.join(c2, c3)

      assert.strictEqual(test.length, 3, 'New connections joined')

      test.join(c1, c2, c3)

      assert.strictEqual(test.length, 3, 'Joining multiple times does nothing')
    })

    it('.leave', () => {
      const test = app.channel('test')
      const c1 = { id: 1 }
      const c2 = { id: 2 }

      assert.strictEqual(test.length, 0)

      test.join(c1, c2)

      assert.strictEqual(test.length, 2)

      test.leave(c2)
      test.leave(c2)

      assert.strictEqual(test.length, 1)
      assert.strictEqual(test.connections.indexOf(c2), -1)
    })

    it('.leave conditional', () => {
      const test = app.channel('test')
      const c1 = { id: 1, leave: true }
      const c2 = { id: 2 }
      const c3 = { id: 3 }

      test.join(c1, c2, c3)

      assert.strictEqual(test.length, 3)

      test.leave((connection: RealTimeConnection) => connection.leave)

      assert.strictEqual(test.length, 2)
      assert.strictEqual(test.connections.indexOf(c1), -1)
    })

    it('.filter', () => {
      const test = app.channel('test')
      const c1 = { id: 1, filter: true }
      const c2 = { id: 2 }
      const c3 = { id: 3 }

      test.join(c1, c2, c3)

      const filtered = test.filter((connection) => connection.filter)

      assert.ok(filtered !== test, 'Returns a new channel instance')
      assert.ok(filtered instanceof Channel)
      assert.strictEqual(filtered.length, 1)
    })

    it('.send', () => {
      const data = { message: 'Hi' }

      const test = app.channel('test')
      const withData = test.send(data)

      assert.ok(test !== withData)
      assert.deepStrictEqual(withData.data, data)
    })

    describe('empty channels', () => {
      it('is an EventEmitter', () => {
        const channel = app.channel('emitchannel')

        return new Promise<void>((resolve) => {
          channel.once('message', (data) => {
            assert.strictEqual(data, 'hello')
            resolve()
          })

          channel.emit('message', 'hello')
        })
      })

      it('empty', (done) => {
        const channel = app.channel('test')
        const c1 = { id: 1 }
        const c2 = { id: 2 }

        channel.once('empty', done)

        channel.join(c1, c2)
        channel.leave(c1)
        channel.leave(c2)
      })

      it('removes an empty channel', () => {
        const channel = app.channel('test')
        const appChannels = (app as any)[CHANNELS]
        const c1 = { id: 1 }

        channel.join(c1)

        assert.ok(appChannels.test)
        assert.strictEqual(Object.keys(appChannels).length, 1)
        channel.leave(c1)

        assert.ok((app as any)[CHANNELS].test === undefined)
        assert.strictEqual(Object.keys(appChannels).length, 0)
      })

      it('removes all event listeners from an empty channel', () => {
        const channel = app.channel('testing')
        const connection = { id: 1 }

        channel.on('something', () => {})
        assert.strictEqual(channel.listenerCount('something'), 1)
        assert.strictEqual(channel.listenerCount('empty'), 1)

        channel.join(connection).leave(connection)

        assert.ok((app as any)[CHANNELS].testing === undefined)

        assert.strictEqual(channel.listenerCount('something'), 0)
        assert.strictEqual(channel.listenerCount('empty'), 0)
      })
    })
  })

  describe('combined channels', () => {
    it('combines multiple channels', () => {
      const combined = app.channel('test', 'again')

      assert.deepStrictEqual(app.channels, ['test', 'again'])
      assert.ok(combined instanceof CombinedChannel)
      assert.strictEqual(combined.length, 0)
    })

    it('de-dupes connections', () => {
      const c1 = { id: 1 }
      const c2 = { id: 2 }

      app.channel('test').join(c1, c2)
      app.channel('again').join(c1)

      const combined = app.channel('test', 'again')

      assert.ok(combined instanceof CombinedChannel)
      assert.strictEqual(combined.length, 2)
    })

    it('does nothing when the channel is undefined (#2207)', () => {
      const channel = app.channel('test', 'me')

      channel.join(undefined)
    })

    it('.join all child channels', () => {
      const c1 = { id: 1 }
      const c2 = { id: 2 }

      const combined = app.channel('test', 'again')

      combined.join(c1, c2)

      assert.strictEqual(combined.length, 2)
      assert.strictEqual(app.channel('test').length, 2)
      assert.strictEqual(app.channel('again').length, 2)
    })

    it('.leave all child channels', () => {
      const c1 = { id: 1 }
      const c2 = { id: 2 }

      app.channel('test').join(c1, c2)
      app.channel('again').join(c1)

      const combined = app.channel('test', 'again')

      combined.leave(c1)

      assert.strictEqual(app.channel('test').length, 1)
      assert.strictEqual(app.channel('again').length, 0)
    })

    it('.leave all child channels conditionally', () => {
      const c1 = { id: 1 }
      const c2 = { id: 2, leave: true }
      const combined = app.channel('test', 'again').join(c1, c2)

      combined.leave((connection: RealTimeConnection) => connection.leave)

      assert.strictEqual(app.channel('test').length, 1)
      assert.strictEqual(app.channel('again').length, 1)
    })

    it('app.channel(app.channels)', () => {
      const c1 = { id: 1 }
      const c2 = { id: 2 }

      app.channel('test').join(c1, c2)
      app.channel('again').join(c1)

      const combined = app.channel(app.channels)

      assert.deepStrictEqual(combined.connections, [c1, c2])
    })
  })
})
