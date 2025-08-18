import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { Application, feathers, Params } from '../index.js'
import { getApp, createTestServer, TestServiceTypes, Todo } from '../../fixtures/index.js'
import { fetchClient } from './index.js'

describe('SSE client', function () {
  const port = 8890
  const url = `http://localhost:${port}`

  let server: any
  let app: Application<TestServiceTypes>
  let client1: Application<TestServiceTypes>
  let client2: Application<TestServiceTypes>

  beforeAll(async () => {
    app = getApp()

    // Set up channels and publishers for SSE
    app.on('connection', (connection: Params) => {
      app.channel('general').join(connection)

      const { channel } = connection.query

      if (channel) {
        app.channel(channel).join(connection)
      }
    })

    // Publish all service events to the general channel
    app.publish((data: any) => {
      if (typeof data.channel !== 'string') {
        return app.channel('general')
      } else {
        return app.channel(data.channel)
      }
    })

    server = await createTestServer(port, app)
    client1 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: 'sse'
      })
    )
    client2 = feathers<TestServiceTypes>().configure(
      fetchClient(fetch, {
        baseUrl: url,
        sse: 'sse'
      })
    )
  })

  afterAll(async () => {
    server.close()
  })

  it('should stream basic SSE between clients, can abort sse', async () => {
    const events: Todo[] = []

    client1.service('sse').emit('start')

    const controller = await new Promise<AbortController>((resolve) => {
      client1.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    // Listen for events on the todos service
    client1.service('todos').on('created', (data: Todo) => {
      events.push(data)
    })

    await client2.service('todos').create({ text: 'todo 1', complete: true })
    await Promise.all([
      client2.service('todos').create({ text: 'todo 2', complete: false }),
      client2.service('todos').create({ text: 'todo 3', complete: true }),
      app.service('todos').create({ text: 'server todo', complete: false })
    ])

    controller.abort()

    // Wait for all events to publish
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    // Ensure that events do no longer get published after abort
    await client2.service('todos').create({ text: 'todo x', complete: true })
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 50))

    expect(events.length).toBe(4)
  })

  it('emits AbortController on successful connection', async () => {
    const params = {
      query: { message: 'testing' }
    }

    client1.service('sse').emit('start', params)

    const controller = await new Promise<AbortController>((resolve) => {
      client1.service('sse').once('connected', (data: AbortController) => resolve(data))
    })

    controller.abort()
    expect(controller.signal.aborted).toBe(true)
  })

  it('only receive events for their channels', async () => {
    const events: Todo[] = []

    client1.service('sse').emit('start', { query: { channel: 'client' } })
    client2.service('sse').emit('start', { query: { channel: 'client' } })

    await Promise.all([
      new Promise((resolve) => client1.service('sse').once('connected', resolve)),
      new Promise((resolve) => client2.service('sse').once('connected', resolve))
    ])

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

    // controller1.abort()
    // controller2.abort()
  })
})
