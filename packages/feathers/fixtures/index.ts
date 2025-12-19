import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { TestService } from './fixture.js'

import { feathers, Application, Params } from '../src/index.js'
import { createHandler, SseService } from '../src/http/index.js'

export * from './client.js'
export * from './rest.js'
export * from './fixture.js'

/**
 * Content types that require buffering (structured data formats)
 */
const BUFFERED_CONTENT_TYPES = [
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'application/json'
]

/**
 * Creates a native Node.js HTTP adapter that properly converts
 * IncomingMessage to a standard Request object.
 * Buffers JSON, form-urlencoded, and multipart requests; streams everything else.
 */
function createNativeAdapter(handler: (request: Request) => Promise<Response>) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    // Build headers object
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v))
        } else {
          headers.set(key, value)
        }
      }
    }

    const url = `http://${req.headers.host || 'localhost'}${req.url}`
    const contentType = req.headers['content-type'] || ''
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method || '')

    let request: Request

    if (hasBody) {
      // Buffer form data and JSON, stream everything else
      const needsBuffering = BUFFERED_CONTENT_TYPES.some((type) => contentType.includes(type))

      if (needsBuffering) {
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(chunk as Buffer)
        }
        const buffer = Buffer.concat(chunks)
        request = new Request(url, {
          method: req.method,
          headers,
          body: buffer.length > 0 ? new Uint8Array(buffer) : undefined
        })
      } else {
        request = new Request(url, {
          method: req.method,
          headers,
          body: req as unknown as ReadableStream<Uint8Array>,
          duplex: 'half'
        } as RequestInit)
      }
    } else {
      request = new Request(url, {
        method: req.method,
        headers
      })
    }

    // Call the handler and get the Response
    const response = await handler(request)

    // Write the response
    res.statusCode = response.status

    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }

    res.end()
  }
}

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

export type TestServiceTypes = {
  todos: TestService
  uploads: UploadService
  streaming: StreamingService
  test: ResponseTestService
  sse: SseService
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

  return app
}

export async function createTestServer(port: number, app: TestApplication) {
  const handler = createHandler(app)
  // Use native Node.js adapter for proper FormData and streaming support
  const nodeServer = createServer(createNativeAdapter(handler))

  await new Promise<void>((resolve) => {
    nodeServer.listen(port, () => resolve())
  })

  await app.setup(nodeServer)

  return nodeServer
}
