# Real-Time (SSE)

Feathers uses [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) for real-time communication between the server and client. SSE is built on top of standard HTTP, requires no additional dependencies, and works across all JavaScript runtimes.

When the `sse` option is set on the [fetch client](../client), the client will automatically establish an SSE connection during [app.setup()](../application#setupserver) to receive real-time events from the server via [channels](../channels).

## Configuration

The `sse` option can be a string (the SSE service path) or an options object:

```ts
import { feathers } from 'feathers'
import { fetchClient } from 'feathers/client'

const app = feathers()

// Simple: just the SSE service path
app.configure(fetchClient(fetch, {
  baseUrl: 'http://localhost:3030',
  sse: 'sse'
}))

// With options
app.configure(fetchClient(fetch, {
  baseUrl: 'http://localhost:3030',
  sse: {
    path: 'sse',
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    params: {
      query: { channel: 'my-channel' }
    }
  }
}))

// Start the SSE connection
await app.setup()
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `path` | (required) | The SSE service path registered on the server |
| `reconnectionDelay` | `1000` | Initial delay (ms) before reconnecting |
| `reconnectionDelayMax` | `5000` | Maximum delay (ms) between reconnection attempts |
| `params` | `{}` | Default params to pass when establishing the SSE connection (e.g. query parameters) |

## Events

The SSE service (`app.service('<sse-path>')`) emits the following events:

### connected

Emitted when the SSE connection is successfully established. The callback receives an `AbortController` that can be used to close the connection.

```ts
app.service('sse').on('connected', (controller: AbortController) => {
  console.log('SSE connected')

  // To disconnect later:
  // controller.abort()
})
```

### disconnected

Emitted when the SSE connection is lost. The callback receives the error that caused the disconnection.

```ts
app.service('sse').on('disconnected', (error: Error) => {
  console.log('SSE disconnected', error)
})
```

### reconnecting

Emitted when a reconnection attempt is about to be made. The callback receives an object with `delay`, `attempt`, and `timeout` properties.

```ts
app.service('sse').on('reconnecting', (info) => {
  console.log(`Reconnecting (attempt ${info.attempt}) in ${info.delay}ms`)
})
```

## Receiving real-time events

Once connected, real-time events published through [channels](../channels) are automatically dispatched to the appropriate service on the client:

```ts
const app = feathers()

app.configure(fetchClient(fetch, {
  baseUrl: 'http://localhost:3030',
  sse: 'sse'
}))

await app.setup()

// Listen for real-time events just like on the server
app.service('messages').on('created', (message) => {
  console.log('New message created', message)
})

app.service('messages').on('patched', (message) => {
  console.log('Message patched', message)
})
```

## Reconnection

The SSE client automatically reconnects when the connection is lost. Reconnection uses exponential backoff with jitter:

- Starts at `reconnectionDelay` (default 1000ms)
- Doubles with each attempt up to `reconnectionDelayMax` (default 5000ms)
- Adds random jitter to prevent thundering herd

## Disconnecting

To manually disconnect the SSE connection, use the `AbortController` provided by the `connected` event:

```ts
let controller: AbortController

app.service('sse').on('connected', (ctrl: AbortController) => {
  controller = ctrl
})

await app.setup()

// Later, to disconnect:
controller.abort()
```
