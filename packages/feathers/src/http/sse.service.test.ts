import { describe, it, expect, beforeEach } from 'vitest'
import { feathers, Application } from '../index.js'
import { channels } from '../channels/index.js'
import { SseService, SsePayload } from './sse.service.js'

class TestService {
  events = ['foo', 'bar']

  async create(payload: any) {
    return payload
  }

  async update(id: any, payload: any) {
    return { id, ...payload }
  }

  async remove(id: any) {
    return { id }
  }
}

describe('SseService', () => {
  let app: Application<{ test: TestService; sse: SseService }>
  let connection: any

  beforeEach(async () => {
    app = feathers().configure(channels())
    app.use('sse', new SseService())
    app.use('test', new TestService())

    connection = { query: { name: 'feathers' } }

    await app.setup()
  })

  describe('find method', () => {
    it('creates an async generator that listens to publish events', async () => {
      const generator = await app.service('sse').find(connection)

      expect(generator).toBeDefined()
      expect(typeof generator[Symbol.asyncIterator]).toBe('function')
    })

    it('yields events when connection is included in channel', async () => {
      const generator = await app.service('sse').find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      // Join connection to a channel and register publisher
      app.channel('test-channel').join(connection)
      app.publish('created', () => app.channel('test-channel'))

      // Trigger a service event in the next tick
      setImmediate(async () => {
        await app.service('test').create({ id: 1, text: 'Test todo' })
      })

      const result = await iterator.next()

      expect(result.done).toBe(false)
      expect(result.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Test todo' },
        path: 'test'
      })

      // Clean up
      await iterator.return()
    })

    it('only publishes to joined channels', async () => {
      const generator = await app.service('sse').find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      // Join connection to a channel and register publisher
      app.channel('test-channel').join(connection)
      app.publish((data: { name: string }) => app.channel(`${data.name}-channel`))

      // Trigger a service event in the next tick
      setImmediate(async () => {
        await app.service('test').create({
          id: 1,
          text: 'Test todo',
          name: 'something'
        })
        await app.service('test').create({
          id: 2,
          text: 'Actual test todo',
          name: 'test'
        })
      })

      const result = await iterator.next()

      expect(result.done).toBe(false)
      expect(result.value).toEqual({
        event: 'created',
        data: {
          id: 2,
          text: 'Actual test todo',
          name: 'test'
        },
        path: 'test'
      })

      // Clean up
      await iterator.return()
    })

    it('uses channel.dataFor when available', async () => {
      const generator = await app.service('sse').find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      const customData = { customized: true, id: 1 }
      const channel = app.channel('test-channel').join(connection).send(customData)

      app.service('test').registerPublisher('updated', () => channel)

      setImmediate(async () => {
        await app.service('test').update(1, { name: 'John' })
      })

      const result = await iterator.next()

      expect(result.value).toEqual({
        event: 'updated',
        data: customData,
        path: 'test'
      })

      // Clean up
      await iterator.return()
    })

    it('queues multiple events correctly', async () => {
      const generator = await app.service('sse').find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      const channel = app.channel('test-channel').join(connection)

      app.service('test').registerPublisher('created', () => channel)
      app.service('test').registerPublisher('updated', () => channel)
      app.service('test').registerPublisher('removed', () => channel)

      // Trigger service events with delays to ensure proper queueing
      setImmediate(async () => {
        await app.service('test').create({ id: 1, text: 'First' })
        setImmediate(async () => {
          await app.service('test').update(1, { text: 'Updated' })
          setImmediate(async () => {
            await app.service('test').remove(1)
          })
        })
      })

      const events: SsePayload[] = []

      // Read events
      const result1 = await iterator.next()
      events.push(result1.value as SsePayload)

      const result2 = await iterator.next()
      events.push(result2.value as SsePayload)

      const result3 = await iterator.next()
      events.push(result3.value as SsePayload)

      expect(events).toHaveLength(3)
      expect(events[0].event).toBe('created')
      expect(events[1].event).toBe('updated')
      expect(events[2].event).toBe('removed')

      // Clean up
      await iterator.return()
    })

    it('handles multiple connections in the same channel', async () => {
      const connection1 = { query: { name: 'daffl' } }
      const connection2 = { query: { name: 'someone' } }

      const generator1 = await app.service('sse').find(connection1)
      const generator2 = await app.service('sse').find(connection2)

      const iterator1 = generator1[Symbol.asyncIterator]()
      const iterator2 = generator2[Symbol.asyncIterator]()

      const channel = app.channel('broadcast-channel').join(connection1, connection2)
      app.service('test').registerPublisher('created', () => channel)

      setImmediate(async () => {
        await app.service('test').create({ id: 1, text: 'Broadcast message' })
      })

      const [result1, result2] = await Promise.all([iterator1.next(), iterator2.next()])

      expect(result1.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Broadcast message' },
        path: 'test'
      })

      expect(result2.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Broadcast message' },
        path: 'test'
      })

      // Clean up
      await Promise.all([iterator1.return(), iterator2.return()])
    })

    it('properly cleans up when generator is closed', async () => {
      const generator = await app.service('sse').find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      // Immediately close the generator
      await iterator.return()

      const result = await iterator.next()
      expect(result.done).toBe(true)
    })
  })
})
