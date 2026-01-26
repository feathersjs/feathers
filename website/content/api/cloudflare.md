

# Cloudflare

Cloudflare Workers use the Web Standard `fetch` handler, making Feathers applications work seamlessly in the edge runtime.

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

export default {
  fetch: handler
}
```

The `createHandler` returns a function with the signature `(request: Request) => Promise<Response>` which is the Web Standard used by Cloudflare Workers.

## With Durable Objects

Cloudflare Workers can use Durable Objects for stateful services:

```ts
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

export class MessagesDurableObject {
  constructor(state, env) {
    this.state = state
    this.messages = []
  }

  async fetch(request) {
    const app = feathers()

    app.use('messages', {
      messages: this.messages,

      async find() {
        return this.messages
      },

      async create(data) {
        const message = { id: this.messages.length, ...data }
        this.messages.push(message)
        return message
      }
    })

    const handler = createHandler(app)
    return handler(request)
  }
}

export default {
  async fetch(request, env) {
    const id = env.MESSAGES.idFromName('default')
    const obj = env.MESSAGES.get(id)
    return obj.fetch(request)
  }
}
```

## Environment Variables

Access Cloudflare Workers environment variables through the request context:

```ts
import { feathers } from 'feathers'
import { createHandler, errorHandler, queryParser, bodyParser } from 'feathers/http'

const app = feathers()

// Middleware to inject env into params
const envMiddleware = (env) => async (context, next) => {
  context.params.env = env
  await next()
}

app.use('messages', {
  async find(params) {
    const apiKey = params.env.API_KEY
    // Use environment variables
    return []
  }
})

export default {
  fetch(request, env) {
    const handler = createHandler(app, [
      errorHandler(),
      envMiddleware(env),
      queryParser(),
      bodyParser()
    ])
    return handler(request)
  }
}
```
