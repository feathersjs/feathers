import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Content types that require buffering (structured data formats).
 * These cannot be streamed because they need to be fully parsed.
 */
const BUFFERED_CONTENT_TYPES = [
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'application/json'
]

/**
 * Converts a Node.js IncomingMessage to a Web Standard Request.
 */
async function toRequest(req: IncomingMessage): Promise<Request> {
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
  const method = req.method || 'GET'
  const contentType = req.headers['content-type'] || ''
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  if (!hasBody) {
    return new Request(url, { method, headers })
  }

  const needsBuffering = BUFFERED_CONTENT_TYPES.some((type) => contentType.includes(type))

  if (needsBuffering) {
    const chunks: Uint8Array[] = []

    for await (const chunk of req) {
      chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk))
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const body = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.length
    }

    return new Request(url, {
      method,
      headers,
      body: body.length > 0 ? body : undefined
    })
  }

  // Stream non-buffered content types
  return new Request(url, {
    method,
    headers,
    body: req as unknown as ReadableStream<Uint8Array>,
    duplex: 'half'
  } as RequestInit)
}

/**
 * Writes a Web Standard Response to a Node.js ServerResponse.
 */
async function writeResponse(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status

  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  if (response.body) {
    const reader = response.body.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    } finally {
      reader.releaseLock()
    }
  }

  res.end()
}

/**
 * Creates a Node.js HTTP request handler from a Web Standard handler.
 *
 * @example
 * ```typescript
 * import { createServer } from 'node:http'
 * import { createHandler } from '@feathersjs/feathers/http'
 * import { toNodeHandler } from '@feathersjs/feathers/http/node'
 *
 * const app = feathers()
 * const handler = createHandler(app)
 * const server = createServer(toNodeHandler(handler))
 *
 * server.listen(3000)
 * ```
 */
export function toNodeHandler(handler: (request: Request) => Promise<Response>) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const request = await toRequest(req)
    const response = await handler(request)
    await writeResponse(response, res)
  }
}
