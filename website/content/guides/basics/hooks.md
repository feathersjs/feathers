

# Hooks

When we created our messages service in the [quick start](./starting) and explored services in the [previous chapter](./services), we saw that Feathers services are a great way to implement data storage and access. But very often we need similar functionality across multiple services. For example, we might want to log the runtime of every service call, validate data, or check permissions.

This is where Feathers hooks come in. Hooks are pluggable middleware functions that can be registered **around**, **before**, **after** or on **error**(s) of a service method without changing the original code. Just like services themselves, hooks are _transport independent_ - they work the same whether the call came from HTTP, an SSE real-time connection, or was made internally.

::tip
A full overview of the hook API can be found in the [hooks API documentation](../../api/hooks).
::

## Hook functions

A hook is an `async` function that takes the **hook context** and a `next` function as parameters. Code before `await next()` runs before the service method, and code after runs when it completes:

```js
const logRuntime = async (context, next) => {
  const startTime = Date.now()

  // Run everything else (other hooks and the service method)
  await next()

  const duration = Date.now() - startTime

  console.log(`Calling ${context.method} on ${context.path} took ${duration}ms`)
}
```

This is called an **around** hook because it wraps around the service method. Around hooks are the most common type and give you control over the entire before/after flow in a single function.

## Hook context

The hook `context` is an object which contains information about the service method call.

Read-only properties:

- `context.app` - The Feathers application object
- `context.service` - The service this hook is running on
- `context.path` - The path (name) of the service
- `context.method` - The name of the service method being called

Writable properties:

- `context.params` - The service method call `params`
  - `context.params.query` - The query parameters
  - `context.params.provider` - The transport name (`'rest'`, `undefined` for internal calls)
- `context.id` - The `id` for `get`, `update`, `patch` and `remove`
- `context.data` - The `data` sent by the user in `create`, `update`, `patch` and custom methods
- `context.result` - The result of the service method call (available after `await next()`)
- `context.error` - The error that was thrown (in `error` hooks)

## Adding hooks to our app

Let's add some hooks to the message service from the quick start. We'll add the `logRuntime` hook from above, plus a hook that automatically adds a `createdAt` timestamp to new messages.

Update the `app.mjs` from the [quick start](./starting):

```js
import { createServer } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'
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

// -- Hooks --

// Log the runtime of every service method call
const logRuntime = async (context, next) => {
  const startTime = Date.now()
  await next()
  console.log(`Calling ${context.method} on ${context.path} took ${Date.now() - startTime}ms`)
}

// Add a createdAt timestamp to new messages
const addTimestamp = async (context, next) => {
  context.data.createdAt = Date.now()
  await next()
}

// Only allow the "text" field when creating a message
const validateMessage = async (context, next) => {
  const { text } = context.data

  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('A message must have a non-empty "text" field')
  }

  // Only keep the text field, discard anything else
  context.data = { text: text.trim() }

  await next()
}

// -- App setup --

const app = feathers()

app.use('messages', new MessageService())

// Register hooks on the messages service
app.service('messages').hooks({
  around: {
    all: [logRuntime],
    create: [validateMessage, addTimestamp]
  }
})

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030, () => {
  console.log('Feathers server listening on http://localhost:3030')
})

await app.setup(server)
```

Now restart the server and try creating a message:

```sh
curl -X POST http://localhost:3030/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello with hooks!"}'
```

You'll see the runtime logged in the console, and the response will include a `createdAt` timestamp. If you try to create a message without text, you'll get an error:

```sh
curl -X POST http://localhost:3030/messages \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

## Using decorators

Hooks can also be registered using class decorators, which is the recommended approach for larger applications:

```js
import { hooks, middleware } from 'feathers/hooks'

@hooks([logRuntime])
class MessageService {
  @hooks(
    middleware([validateMessage, addTimestamp]).params('data', 'params')
  )
  async create(data, params) {
    // ...
  }

  async find(params) {
    // ...
  }
}
```

The class-level `@hooks` decorator registers hooks that run for **all** methods, while the method-level `@hooks` decorator registers hooks for that specific method. The `.params()` call tells the hook system how to map the method arguments to context properties.

::note
For standard service methods (`find`, `get`, `create`, `update`, `patch`, `remove`), the parameter mapping is set up automatically when the service is registered with `app.use`.
::

## Application hooks

Hooks can also be registered at the application level to run for every service:

```js
// Log every service method call across the whole app
app.hooks({
  around: {
    all: [logRuntime]
  },
  error: {
    all: [
      async (context) => {
        console.error(`Error in ${context.path}.${context.method}:`, context.error.message)
      }
    ]
  }
})
```

## Hook execution order

When multiple hooks are registered at different levels, they run in this order:

1. Application around hooks (before `next`)
2. Application before hooks
3. Service around hooks (before `next`)
4. Service before hooks
5. **Service method**
6. Service after hooks
7. Service around hooks (after `next`)
8. Application after hooks
9. Application around hooks (after `next`)

Hooks run in the order they are registered. If a hook throws an error, all remaining hooks and the service call (if it hasn't run yet) will be skipped.

## What's next?

In this chapter we learned how hooks allow us to add reusable functionality like validation, timestamps and logging to service methods without changing the service code. Hooks work the same regardless of how the service is called, keeping our application logic composable and easy to debug.

In the [next chapter](./real-time) we will learn how to add real-time functionality so that clients can receive live updates when data changes.
