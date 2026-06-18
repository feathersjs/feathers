

# Real-time events

In the previous chapters we built a messages API with a database and hooks. One of the most powerful features of Feathers is real-time: when data changes on the server, connected clients can be notified instantly without having to poll for updates.

Feathers uses [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) for real-time communication. SSE is built on standard HTTP and requires no additional dependencies.

## How it works

We already saw in the [services chapter](./services) that Feathers services automatically emit events like `created`, `patched` and `removed` when data changes. Real-time is about getting those events from the server to connected clients.

This involves three pieces:

1. **SseService** - A special service that manages SSE connections
2. **Channels** - Determine which clients receive which events
3. **Publishing** - Controls what events are sent to which channels

## Adding real-time to our app

Let's update our `app.mjs` to add real-time support:

```js
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'
import { SseService } from 'feathers/sse'
import { NotFound } from 'feathers/errors'

const db = new DatabaseSync('messages.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    createdAt INTEGER
  )
`)

class MessageService {
  async find(params) {
    const stmt = db.prepare('SELECT * FROM messages ORDER BY id DESC')
    return stmt.all()
  }

  async get(id) {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?')
    const message = stmt.get(id)

    if (!message) {
      throw new NotFound(`Message ${id} not found`)
    }

    return message
  }

  async create(data) {
    const stmt = db.prepare('INSERT INTO messages (text, createdAt) VALUES (?, ?)')
    const result = stmt.run(data.text, data.createdAt)

    return this.get(result.lastInsertRowid)
  }

  async remove(id) {
    const message = await this.get(id)
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?')

    stmt.run(id)

    return message
  }
}

const addTimestamp = async (context, next) => {
  context.data.createdAt = Date.now()
  await next()
}

const app = feathers()

// Register the SSE service for real-time connections
app.use('sse', new SseService())
app.use('messages', new MessageService())

app.service('messages').hooks({
  around: {
    create: [addTimestamp]
  }
})

// When a new real-time connection is made, add it to the "everybody" channel
app.on('connection', (connection) => {
  app.channel('everybody').join(connection)
})

// Publish all events to the "everybody" channel
app.publish(() => app.channel('everybody'))

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030, () => {
  console.log('Feathers server listening on http://localhost:3030')
})

await app.setup(server)
```

The key additions are:

- `SseService` - Manages SSE connections from clients
- `app.on('connection')` - Fires when a client connects and adds them to a channel
- `app.publish()` - Tells Feathers to send events to all connections in the `everybody` channel

## Channels

Channels are named groups of connections. They let you control which clients receive which events:

```js
app.on('connection', (connection) => {
  // Add every connection to the "everybody" channel
  app.channel('everybody').join(connection)
})
```

In a real application you might use channels to only send events to authenticated users or to specific groups:

```js
app.on('connection', (connection) => {
  if (connection.user) {
    app.channel('authenticated').join(connection)
  } else {
    app.channel('anonymous').join(connection)
  }
})
```

::tip
For more about channels, see the [Channels API documentation](../../api/channels).
::

## Publishing events

`app.publish()` controls which events are sent to which channels. You can publish globally for all services or per service:

```js
// Publish all events from all services to everybody
app.publish(() => app.channel('everybody'))

// Publish only messages events to everybody
app.service('messages').publish(() => app.channel('everybody'))

// Different publishing for different events
app.service('messages').publish('created', (data) => {
  return app.channel('everybody')
})
```

## Using the Feathers client

Feathers can be used as a client that connects to a Feathers server using the exact same API. The client uses `fetch` for HTTP calls and SSE for real-time events.

Create a file called `client.mjs`:

```js
import { feathers } from 'feathers'
import { fetchClient } from 'feathers/client'

const app = feathers()

// Connect to the Feathers server
app.configure(fetchClient(fetch, {
  baseUrl: 'http://localhost:3030',
  sse: 'sse'
}))

// Set up the SSE connection
await app.setup()

// Listen for new messages in real-time
app.service('messages').on('created', (message) => {
  console.log('New message:', message)
})

// Listen for removed messages
app.service('messages').on('removed', (message) => {
  console.log('Message removed:', message)
})

// Create a new message
await app.service('messages').create({
  text: 'Hello from the Feathers client!'
})

// List all messages
const messages = await app.service('messages').find()

console.log('All messages:', messages)

console.log('Listening for real-time events... (press Ctrl+C to stop)')
```

With the server running in one terminal, open another terminal and run:

```sh
node client.mjs
```

You will see the message being created and listed. The client will stay running and receive events in real-time. Try creating a message from a third terminal using `curl`:

```sh
curl -X POST http://localhost:3030/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from curl!"}'
```

The client will log the new message as it arrives in real-time.

## In the browser

The Feathers client also works in the browser. Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feathers Messages</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2em auto; }
    #messages { list-style: none; padding: 0; }
    #messages li { padding: 0.5em; margin: 0.25em 0; background: #f0f0f0; border-radius: 4px; }
    form { display: flex; gap: 0.5em; margin-bottom: 1em; }
    input { flex: 1; padding: 0.5em; }
    button { padding: 0.5em 1em; }
  </style>
</head>
<body>
  <h1>Feathers Messages</h1>
  <form id="form">
    <input type="text" id="text" placeholder="Enter a message" />
    <button type="submit">Send</button>
  </form>
  <ul id="messages"></ul>

  <script type="module">
    import { feathers } from 'https://esm.sh/feathers@pre'
    import { fetchClient } from 'https://esm.sh/feathers@pre/client'

    const app = feathers()

    app.configure(fetchClient(fetch, {
      baseUrl: 'http://localhost:3030',
      sse: 'sse'
    }))

    await app.setup()

    const messagesList = document.getElementById('messages')

    function addMessage(message) {
      const li = document.createElement('li')
      li.textContent = message.text
      messagesList.prepend(li)
    }

    // Load existing messages
    const messages = await app.service('messages').find()
    messages.forEach(addMessage)

    // Listen for new messages in real-time
    app.service('messages').on('created', addMessage)

    // Handle form submission
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const input = document.getElementById('text')

      await app.service('messages').create({ text: input.value })

      input.value = ''
    })
  </script>
</body>
</html>
```

To serve this file, we need to add static file handling. Update the server in `app.mjs` to serve static files from the current directory by adding a custom middleware:

```js
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Add before createHandler
const serveIndex = async (context, next) => {
  await next()

  // If no service matched, serve index.html for the root path
  if (context.response === undefined) {
    const url = new URL(context.request.url)

    if (url.pathname === '/') {
      const html = await readFile(join(process.cwd(), 'index.html'), 'utf-8')
      context.response = new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
  }
}

const handler = createHandler(app, [
  errorHandler(),
  serveIndex,
  queryParser(),
  bodyParser()
])
```

::note
The `errorHandler`, `queryParser` and `bodyParser` can be imported from `feathers/http`.
::

Now visit `http://localhost:3030` in your browser. Open it in two tabs and see messages appear in real-time on both sides.

## What's next?

In this chapter we added real-time functionality to our messages API using Server-Sent Events. We learned about channels, publishing, and how to use the Feathers client to connect from Node.js and the browser.

You can learn more about creating a full Feathers application with `npm create feathers` which generates a project with a recommended file structure and configuration.

Check out these resources to continue learning:

- [API Documentation](../../api/) - Complete reference for all Feathers APIs
- [Channels](../../api/channels) - Advanced channel patterns
- [HTTP API](../../api/http) - HTTP transport details
