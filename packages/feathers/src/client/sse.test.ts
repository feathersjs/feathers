import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { Application, feathers, Params } from '../index.js'
import { getApp, createTestServer, TestServiceTypes, Todo } from '../../fixtures/index.js'
import { fetchClient, ReconnectingEvent } from './index.js'

describe('SSE client', function () {
  const port = 8890
  const url = `http://localhost:${port}`

  let server: any
  let app: Application<TestServiceTypes>

  beforeAll(async () => {
    app = getApp()
    app.on('connection', (connection: Params) => {
      app.channel('general').join(connection)

      const { channel } = connection.query

      if (channel) {
        app.channel(channel).join(connection)
      }
    })
    app.publish((data: any) => {
      if (typeof data.channel !== 'string') {
        return app.channel('general')
      } else {
        return app.channel(data.channel)
      }
    })

    server = await createTestServer(port, app)
  })

  afterAll(async () => {
    server.close()
  })

  it('should stream basic SSE between clients, can abort sse', async () => {
    const events: Todo[] = []
    const client1 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: 'sse'
      })
    )

    const connectedPromise = new Promise<AbortController>((resolve) => {
      client1.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    await client1.setup()

    const controller = await connectedPromise

    client1.service('todos').on('created', (data: Todo) => {
      events.push(data)
    })

    const client2 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: 'sse'
      })
    )

    await client2.service('todos').create({ text: 'todo 1', complete: true })
    await Promise.all([
      client2.service('todos').create({ text: 'todo 2', complete: false }),
      client2.service('todos').create({ text: 'todo 3', complete: true }),
      app.service('todos').create({ text: 'server todo', complete: false })
    ])

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    controller.abort()

    await client2.service('todos').create({ text: 'todo x', complete: true })
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    expect(events.length).toBe(4)
  })

  it('emits AbortController on successful connection', async () => {
    const client = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: {
          path: 'sse',
          params: { query: { message: 'testing' } }
        }
      })
    )

    const connectedPromise = new Promise<AbortController>((resolve) => {
      client.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    await client.setup()

    const controller = await connectedPromise

    controller.abort()
    expect(controller.signal.aborted).toBe(true)
  })

  it('only receive events for their channels', async () => {
    const events: Todo[] = []
    const client1 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: {
          path: 'sse',
          params: { query: { channel: 'client' } }
        }
      })
    )
    const client2 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: {
          path: 'sse',
          params: { query: { channel: 'client' } }
        }
      })
    )

    const connected = Promise.all([
      new Promise((resolve) => client1.service('sse').once('connected', resolve)),
      new Promise((resolve) => client2.service('sse').once('connected', resolve))
    ])

    await Promise.all([client1.setup(), client2.setup()])
    await connected

    client1.service('todos').on('created', (todo: Todo) => events.push(todo))
    client2.service('todos').on('created', (todo: Todo) => events.push(todo))

    await client2.service('todos').create({
      text: 'todo x',
      complete: true,
      channel: 'client'
    })

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    expect(events.length).toBe(2)

    await client2.service('todos').create({
      text: 'todo x',
      complete: true,
      channel: 'notclient'
    })

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    expect(events.length).toBe(2)
  })

  it('initiates reconnection when server is unavailable', async () => {
    const reconnectPort = 8946
    let server = await createTestServer(reconnectPort, app)
    const reconnectClient = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: `http://localhost:${reconnectPort}`,
        sse: {
          path: 'sse',
          reconnectionDelay: 50,
          reconnectionDelayMax: 500
        }
      })
    )

    const connectedPromise = new Promise<AbortController>((resolve) => {
      reconnectClient.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    await reconnectClient.setup()
    await connectedPromise

    const disconnectEvent = new Promise<Error>((resolve) => {
      reconnectClient.service('sse').once('disconnected', (error: Error) => resolve(error))
    })
    const reconnectingEvents = new Promise<ReconnectingEvent[]>((resolve) => {
      const retries: ReconnectingEvent[] = []

      reconnectClient.service('sse').on('reconnecting', (info: ReconnectingEvent) => {
        retries.push(info)
        if (retries.length === 2) {
          resolve(retries)
        }
      })
    })

    server.closeAllConnections()
    server.close()

    const reconnections = await reconnectingEvents

    expect(reconnections).toHaveLength(2)
    expect(reconnections[0]).toHaveProperty('delay')
    expect(reconnections[0].attempt).toEqual(1)
    expect(reconnections[1].attempt).toEqual(2)

    expect(await disconnectEvent).toBeInstanceOf(Error)

    server = await createTestServer(reconnectPort, app)

    await new Promise<AbortController>((resolve) => {
      reconnectClient.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    server.closeAllConnections()
    server.close()
  })
})
