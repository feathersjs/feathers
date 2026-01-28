

# HTTP

The `feathers/http` module provides a Web Standard HTTP handler that works across all JavaScript runtimes: Node.js, Deno, Bun, and Cloudflare Workers.

## createHandler

`createHandler(app, middleware?)` creates a Web Standard request handler that processes HTTP requests for your Feathers application.

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)
```

The handler has the signature `(request: Request) => Promise<Response>` which is the Web Standard used by Deno, Bun, and Cloudflare Workers.

### Options

- `app` - The Feathers application
- `middleware` - Optional array of middleware. Defaults to `[errorHandler(), queryParser(), bodyParser()]`

## Runtime Usage

### Deno

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()
// ... configure your app

const handler = createHandler(app)

Deno.serve({ port: 3030 }, handler)
```

### Bun

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()
// ... configure your app

const handler = createHandler(app)

Bun.serve({
  port: 3030,
  fetch: handler
})
```

### Cloudflare Workers

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

const app = feathers()
// ... configure your app

const handler = createHandler(app)

export default {
  fetch: handler
}
```

### Node.js

Node.js does not have a built-in Web Standard HTTP server, so an adapter is required. The `toNodeHandler` function converts the Web Standard handler to work with Node's `http.createServer`.

```ts
import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'

const app = feathers()
// ... configure your app

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030, () => {
  console.log('Server running on http://localhost:3030')
})

// Call app.setup to initialize all services
await app.setup(server)
```

## toNodeHandler

`toNodeHandler(handler)` converts a Web Standard `(Request) => Promise<Response>` handler to Node's `(IncomingMessage, ServerResponse) => void` signature.

```ts
import { toNodeHandler } from 'feathers/http/node'

const nodeHandler = toNodeHandler(handler)
```

This adapter:

- Converts Node's `IncomingMessage` to a Web Standard `Request`
- Buffers JSON, form-urlencoded, and multipart requests for proper parsing
- Streams all other content types directly
- Writes the Web Standard `Response` back to Node's `ServerResponse`

## Middleware

The HTTP handler uses a middleware chain for request processing. The default middleware handles common tasks like error handling, query parsing, and body parsing.

### errorHandler

Catches errors and returns them as properly formatted JSON responses with appropriate status codes.

```ts
import { errorHandler } from 'feathers/http'
```

### queryParser

Parses URL query parameters using [qs](https://www.npmjs.com/package/qs) and adds them to `params.query`.

```ts
import { queryParser } from 'feathers/http'

// With custom parser
import qs from 'qs'
queryParser((query) => qs.parse(query, { arrayLimit: 200 }))
```

### bodyParser

Parses request bodies based on content type:

| Content-Type                        | Parsing Method                       |
| ----------------------------------- | ------------------------------------ |
| `application/json`                  | `request.json()`                     |
| `application/x-www-form-urlencoded` | `request.text()` → `URLSearchParams` |
| `multipart/form-data`               | `request.formData()`                 |
| Everything else                     | Streams `request.body` directly      |

```ts
import { bodyParser } from 'feathers/http'
```

### Custom Middleware

You can provide custom middleware to the handler:

```ts
import { createHandler, errorHandler, queryParser, bodyParser } from 'feathers/http'

const customLogger = async (context, next) => {
  console.log(`${context.request.method} ${context.request.url}`)
  await next()
}

const handler = createHandler(app, [errorHandler(), customLogger, queryParser(), bodyParser()])
```

## params

### params.query

Contains the URL query parameters parsed by the `queryParser` middleware.

```ts
// GET /messages?status=read&limit=10
// params.query = { status: 'read', limit: '10' }
```

### params.provider

For any service method call made through HTTP, `params.provider` will be set to `'rest'`.

### params.headers

Contains the request headers as a plain object.

```ts
// params.headers = { 'content-type': 'application/json', ... }
```

### params.route

Route placeholders in a service URL will be added to `params.route`.

```ts
app.use('users/:userId/messages', messageService)

// GET /users/123/messages
// params.route = { userId: '123' }
```

### params.request

The original Web Standard `Request` object is available as `params.request`.

## Content Types

### JSON

Standard JSON requests and responses:

```ts
// Request
POST /messages
Content-Type: application/json

{ "text": "Hello world" }

// Service receives
data = { text: 'Hello world' }
```

### Form Data

URL-encoded and multipart form data are automatically parsed:

```ts
// Request
POST /messages
Content-Type: application/x-www-form-urlencoded

text=Hello+world&status=sent

// Service receives
data = { text: 'Hello world', status: 'sent' }
```

### File Uploads

Multipart file uploads use the Web Standard `FormData` API:

```ts
// Request
POST /uploads
Content-Type: multipart/form-data

// Service receives
data = {
  file: File,           // Web Standard File object
  description: 'string'
}
```

Multiple files with the same field name become an array:

```ts
data = {
  files: [File, File, File]
}
```

### Streaming

Non-buffered content types are streamed directly to the service:

```ts
class UploadService {
  async create(stream: ReadableStream, params: Params) {
    // Stream data directly to storage
    const reader = stream.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      // Process chunks
    }

    return { uploaded: true }
  }
}
```

## Returning Responses

Services can return a Web Standard `Response` directly for full control:

```ts
class DownloadService {
  async get(id: string) {
    const file = await storage.get(id)

    return new Response(file.stream, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.name}"`
      }
    })
  }
}
```

## Async Iterators (SSE)

Services can return async iterators for Server-Sent Events:

```ts
class StreamService {
  async find() {
    return (async function* () {
      for (let i = 0; i < 10; i++) {
        yield { count: i }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    })()
  }
}
```

The response will be sent as `text/event-stream`:

```
data: {"count":0}

data: {"count":1}

data: {"count":2}
...
```

## CORS

The handler automatically sets CORS headers based on the request's `Origin` header:

```
Access-Control-Allow-Origin: <request origin or *>
```

For preflight `OPTIONS` requests, the handler returns:

```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: accept, accept-language, content-language, content-type, range, authorization, x-service-method
Access-Control-Allow-Credentials: true
```

## Custom Methods

[Custom service methods](./services#custom-methods) can be called via HTTP by setting the `X-Service-Method` header:

```
POST /messages
X-Service-Method: myCustomMethod
Content-Type: application/json

{ "data": "value" }
```

This will call `messages.myCustomMethod({ data: 'value' }, params)`.
