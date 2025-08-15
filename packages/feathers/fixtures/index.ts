import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'node:http'
import { TestService } from './fixture.js'

import { feathers, Application, Params } from '../src/index.js'
import { createHandler, SseService } from '../src/http/index.js'

export * from './client.js'
export * from './rest.js'
export * from './fixture.js'

export class ResponseTestService {
  async find() {
    return new Response('Plain text', {
      headers: {
        'Content-Type': 'text/plain',
        'X-Custom-Header': 'test'
      }
    })
  }

  async get(id: string) {
    const generator = async function* () {
      for (let i = 1; i <= 5; i++) {
        yield { message: `Hello ${id} ${i}` }
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    return generator()
  }

  async options(_params: Params) {
    return new Response(null, {
      status: 200,
      headers: {
        'X-Feathers': 'true',
        'Access-Control-Allow-Origin': 'https://example.com',
        'Access-Control-Allow-Headers': 'Authorization, X-Service-Method'
      }
    })
  }
}

export type TestServiceTypes = {
  todos: TestService
  test: ResponseTestService
  sse: SseService
}

export type TestApplication = Application<TestServiceTypes>

export const app: TestApplication = feathers()

app.use('todos', new TestService(), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'customMethod']
})
app.use('test', new ResponseTestService())
app.use('sse', new SseService())

export async function createTestServer(port: number) {
  const handler = createHandler(app)
  // You can create your Node server instance by using our adapter
  const nodeServer = createServer(createServerAdapter(handler))

  await new Promise<void>((resolve) => {
    // Then start listening on some port
    nodeServer.listen(port, () => resolve())
  })

  await app.setup(nodeServer)

  return nodeServer
}
