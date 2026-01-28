import { createServer } from 'node:http'
import { TestService } from './fixture.js'

import { feathers, Application, Params, method } from '../src/index.js'
import { createHandler, SseService } from '../src/http/index.js'
import { toNodeHandler } from '../src/http/node.js'

export * from './client.js'
export * from './rest.js'
export * from './fixture.js'

export type UploadInput = FormData | UploadResult

export type UploadResult = {
  id?: number | string
  status?: string
  provider?: string
  file?: File | File[]
  files?: File | File[]
  description?: string
  name?: string
  tags?: string | string[]
  [key: string]: File | File[] | string | string[] | number | undefined
}

export class UploadService {
  async create(data: UploadInput, params: Params): Promise<UploadResult> {
    return {
      ...(data as UploadResult),
      id: 1,
      status: 'uploaded',
      provider: params.provider
    }
  }

  async patch(id: number | string, data: UploadInput, params: Params): Promise<UploadResult> {
    return {
      ...(data as UploadResult),
      id,
      status: 'patched',
      provider: params.provider
    }
  }
}

export class StreamingService {
  async create(data: ReadableStream, params: Params) {
    // Consume the stream and collect the data
    const chunks: Uint8Array[] = []
    const reader = data.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    const text = new TextDecoder().decode(combined)

    return {
      received: text,
      size: totalLength,
      contentType: params.headers?.['content-type'] || 'unknown',
      provider: params.provider
    }
  }
}

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

export class InternalTestService {
  async find(_params: Params) {
    return [{ id: 1, name: 'Public' }]
  }

  @method({ args: ['data', 'params'], external: false })
  async internalProcess(data: any, _params: Params) {
    return { processed: data, internal: true }
  }
}

export class CustomPathService {
  messages: { id: string; text: string; status: string }[] = [
    { id: '1', text: 'Hello', status: 'active' },
    { id: '2', text: 'World', status: 'archived' }
  ]

  async find(_params: Params) {
    return this.messages
  }

  async get(id: string, _params: Params) {
    return this.messages.find((m) => m.id === id)
  }

  @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
  async status(id: string, _params: Params) {
    const msg = this.messages.find((m) => m.id === id)
    return { id, status: msg?.status || 'unknown' }
  }

  @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
  async archive(id: string, _params: Params) {
    const msg = this.messages.find((m) => m.id === id)
    if (msg) {
      msg.status = 'archived'
    }
    return msg
  }

  @method({ args: ['params'], http: 'GET', path: 'stats' })
  async stats(_params: Params) {
    return {
      total: this.messages.length,
      active: this.messages.filter((m) => m.status === 'active').length
    }
  }

  @method({ args: ['id', 'data', 'params'], http: 'POST', path: ':id/update-status' })
  async updateStatus(id: string, data: { status: string }, _params: Params) {
    const msg = this.messages.find((m) => m.id === id)
    if (msg) {
      msg.status = data.status
    }
    return msg
  }
}

export type TestServiceTypes = {
  todos: TestService
  uploads: UploadService
  streaming: StreamingService
  test: ResponseTestService
  sse: SseService
  internal: InternalTestService
  custom: CustomPathService
}

export type TestApplication = Application<TestServiceTypes>

export function getApp(): TestApplication {
  const app: TestApplication = feathers()

  app.use('todos', new TestService(), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'customMethod']
  })
  app.use('uploads', new UploadService(), {
    methods: ['create', 'patch']
  })
  app.use('streaming', new StreamingService(), {
    methods: ['create']
  })
  app.use('test', new ResponseTestService())
  app.use('sse', new SseService())
  app.use('internal', new InternalTestService())
  app.use('custom', new CustomPathService())

  return app
}

export async function createTestServer(port: number, app: TestApplication) {
  const handler = createHandler(app)
  const nodeServer = createServer(toNodeHandler(handler))

  await new Promise<void>((resolve) => {
    nodeServer.listen(port, () => resolve())
  })

  await app.setup(nodeServer)

  return nodeServer
}
