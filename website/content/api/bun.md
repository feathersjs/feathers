

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

## With Socket.io

To use real-time functionality with Socket.io in Bun:

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { Server } from 'socket.io'
import { socketio } from 'feathers/socketio'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

app.configure(socketio())

const handler = createHandler(app)

const server = Bun.serve({
  port: 3030,
  fetch: handler
})

await app.setup(server)
```
