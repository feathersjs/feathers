import { describe, it, expect, beforeEach } from 'vitest'
import { feathers, Application } from '../index.js'
import { channels } from '../channels/index.js'
import { SseService, SseEventEntry } from './sse.js'

describe('SseService', () => {
  let app: Application
  let sseService: SseService
  let connection: any

  beforeEach(() => {
    app = feathers().configure(channels())
    sseService = new SseService(app)
    connection = { id: 'test-connection' }
  })

  describe('find method', () => {
    it('creates an async generator that listens to publish events', () => {
      const generator = sseService.find(connection)

      expect(generator).toBeDefined()
      expect(typeof generator[Symbol.asyncIterator]).toBe('function')
    })

    it('yields events when connection is included in channel', async () => {
      const generator = sseService.find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      // Simulate a channel with our connection
      const channel = app.channel('test')
      channel.join(connection)

      // Trigger a publish event in the next tick
      setImmediate(() => {
        app.emit(
          'publish',
          'created',
          channel,
          { path: 'todos', service: {}, app },
          { id: 1, text: 'Test todo' }
        )
      })

      const result = await iterator.next()

      expect(result.done).toBe(false)
      expect(result.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Test todo' },
        path: 'todos'
      })

      // Clean up
      await iterator.return()
    })

    it('uses channel.dataFor when available', async () => {
      const generator = sseService.find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      const channel = app.channel('test')
      channel.join(connection)

      // Mock dataFor method
      const customData = { customized: true, id: 1 }
      ;(channel as any).dataFor = () => customData

      setImmediate(() => {
        app.emit('publish', 'updated', channel, { path: 'users', service: {}, app }, { id: 1, name: 'John' })
      })

      const result = await iterator.next()

      expect(result.value).toEqual({
        event: 'updated',
        data: customData,
        path: 'users'
      })

      // Clean up
      await iterator.return()
    })

    it('queues multiple events correctly', async () => {
      const generator = sseService.find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      const channel = app.channel('test')
      channel.join(connection)

      // Trigger events with delays to ensure proper queueing
      setImmediate(() => {
        app.emit('publish', 'created', channel, { path: 'todos', service: {}, app }, { id: 1, text: 'First' })
        setImmediate(() => {
          app.emit(
            'publish',
            'updated',
            channel,
            { path: 'todos', service: {}, app },
            { id: 1, text: 'Updated' }
          )
          setImmediate(() => {
            app.emit('publish', 'removed', channel, { path: 'todos', service: {}, app }, { id: 1 })
          })
        })
      })

      const events: SseEventEntry[] = []

      // Read events
      const result1 = await iterator.next()
      events.push(result1.value)

      const result2 = await iterator.next()
      events.push(result2.value)

      const result3 = await iterator.next()
      events.push(result3.value)

      expect(events).toHaveLength(3)
      expect(events[0].event).toBe('created')
      expect(events[1].event).toBe('updated')
      expect(events[2].event).toBe('removed')

      // Clean up
      await iterator.return()
    })

    it('handles multiple connections in the same channel', async () => {
      const connection1 = { id: 'connection-1' }
      const connection2 = { id: 'connection-2' }

      const generator1 = sseService.find(connection1)
      const generator2 = sseService.find(connection2)

      const iterator1 = generator1[Symbol.asyncIterator]()
      const iterator2 = generator2[Symbol.asyncIterator]()

      const channel = app.channel('test')
      channel.join(connection1, connection2)

      setImmediate(() => {
        app.emit(
          'publish',
          'created',
          channel,
          { path: 'messages', service: {}, app },
          { id: 1, text: 'Broadcast message' }
        )
      })

      const [result1, result2] = await Promise.all([iterator1.next(), iterator2.next()])

      expect(result1.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Broadcast message' },
        path: 'messages'
      })

      expect(result2.value).toEqual({
        event: 'created',
        data: { id: 1, text: 'Broadcast message' },
        path: 'messages'
      })

      // Clean up
      await Promise.all([iterator1.return(), iterator2.return()])
    })

    it('properly cleans up when generator is closed', async () => {
      const generator = sseService.find(connection)
      const iterator = generator[Symbol.asyncIterator]()

      // Immediately close the generator
      await iterator.return()

      const result = await iterator.next()
      expect(result.done).toBe(true)
    })
  })
})
