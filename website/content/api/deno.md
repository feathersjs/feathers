

# Deno

Deno has native support for Web Standard HTTP handlers, making it straightforward to run Feathers applications.

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

Deno.serve({ port: 3030 }, handler)
```

The `createHandler` returns a function with the signature `(request: Request) => Promise<Response>` which is the Web Standard used natively by Deno.

## With SSE

To use real-time functionality with Server-Sent Events in Deno, register the [SSE service](./http#sse-service) and set up [channels](./channels):

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

Deno.serve({ port: 3030 }, handler)

await app.setup()
```
