

# Node.js

Node.js does not have a built-in Web Standard HTTP server, so an adapter is required. The `toNodeHandler` function converts the Web Standard handler to work with Node's `http.createServer`.

## Setup

```ts
import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

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
