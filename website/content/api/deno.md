

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

## With Socket.io

To use real-time functionality with Socket.io in Deno:

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
const server = Deno.serve({ port: 3030 }, handler)

await app.setup(server)
```
