

# Bun

Bun has native support for Web Standard HTTP handlers through `Bun.serve`, making it easy to run Feathers applications with excellent performance.

## Setup

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

Bun.serve({
  port: 3030,
  fetch: handler
})
```

The `createHandler` returns a function with the signature `(request: Request) => Promise<Response>` which is the Web Standard used natively by Bun.

## With SSE

To use real-time functionality with Server-Sent Events in Bun, register the [SSE service](./http#sse-service) and set up [channels](./channels):

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { SseService } from 'feathers/sse'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

// Register the SSE service for real-time events
app.use('sse', new SseService())

const handler = createHandler(app)

Bun.serve({
  port: 3030,
  fetch: handler
})

await app.setup()
```
