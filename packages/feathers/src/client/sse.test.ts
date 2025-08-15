import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { Application, feathers } from '../index.js'
import { createTestServer, TestServiceTypes } from '../../fixtures/index.js'
import { fetchClient } from './index.js'
import { sse } from './sse.js'

describe('SSE client', function () {
  const port = 8890
  const url = `http://localhost:${port}`

  let server: any
  let client1: Application<TestServiceTypes>
  let client2: Application<TestServiceTypes>

  beforeAll(async () => {
    server = await createTestServer(port)
    client1 = feathers<TestServiceTypes>().configure(fetchClient(fetch, url))
    client2 = feathers<TestServiceTypes>().configure(fetchClient(fetch, url))
  })

  afterAll(async () => {
    server.close()
  })

  it.only('should stream SSE events from different client connection', async () => {
    const controller = await sse(client1, 'sse')

    const todo = await client2.service('todos').create({
      text: 'sse test todo',
      complete: true
    })

    expect(controller).toBeDefined()
    console.log(todo)
  })

  it.skip('should handle connection abortion gracefully', async () => {
    const events: any[] = []

    // Start SSE connection
    const controller = await sse(app1, 'todos')

    // Listen for events
    app1.service('todos').on('created', (data: any) => {
      events.push({ event: 'created', data })
    })

    // Create one item
    await app1.service('todos').create({ text: 'Test before abort', complete: false })

    // Wait a bit for the event to be processed
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Abort the connection
    controller.abort()

    // Try to create another item - this should not be received
    await app1.service('todos').create({ text: 'Test after abort', complete: false })

    // Wait a bit more to ensure no additional events are processed
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should only have received the first event
    expect(events).toHaveLength(1)
    expect(events[0].data.text).toBe('Test before abort')
  })

  it.skip('should pass connection parameters correctly', async () => {
    const connectionParams = {
      headers: {
        Authorization: 'Bearer test-token'
      }
    }

    // Start SSE connection with custom parameters
    const controller = await sse(app1, 'todos', { connection: connectionParams })

    // The connection should be established successfully
    expect(controller).toBeDefined()
    expect(controller.signal).toBeDefined()
    expect(controller.signal.aborted).toBe(false)

    // Abort the connection
    controller.abort()
    expect(controller.signal.aborted).toBe(true)
  })
})
