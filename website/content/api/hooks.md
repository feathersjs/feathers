# Hooks

Hooks are pluggable middleware functions that can be registered **around**, **before**, **after** or on **error**(s) of a [service method](./services). Multiple hook functions can be chained to create complex work-flows. A hook is **transport independent**, which means it does not matter if it has been called internally on the server, through HTTP or any other transport Feathers supports. They are also service agnostic, meaning they can be used with **any** service regardless of whether they use a database or not.

Hooks are commonly used to handle things like permissions, validation, logging, authentication, sending notifications and more. This pattern keeps your application logic flexible, composable, and easier to trace through and debug.

## Quick example

The recommended way to register hooks is using **classes and decorators**. The `@hooks` decorator can be applied to a class (to run hooks around all methods) or to individual methods:

```ts
import { feathers, hooks, middleware, type HookContext, type NextFunction } from 'feathers'

@hooks([
  async (context: HookContext, next: NextFunction) => {
    const startTime = Date.now()
    await next()
    console.log(`Method ${context.method} on ${context.path} took ${Date.now() - startTime}ms`)
  }
])
class MessageService {
  @hooks(
    middleware([
      async (context: HookContext, next: NextFunction) => {
        context.data = {
          ...context.data,
          createdAt: Date.now()
        }
        await next()
      }
    ]).params('data', 'params')
  )
  async create(data: any, params: Params) {
    return data
  }

  async find(params: Params) {
    return []
  }
}

const app = feathers()

app.use('messages', new MessageService())
```

In this example, the class-level `@hooks` decorator logs the runtime for **all** methods, while the method-level `@hooks` decorator adds a `createdAt` property only for `create`.

Hooks can also be registered using the [.hooks() method](#registering-hooks-with-hooks) on a service.

## Decorators

### Class decorator

`@hooks(middleware[])` on a class registers around hooks that run for **every method** on that service. Class hooks are inherited, so hooks on a parent class will also run for subclass methods.

```ts
import { hooks, type HookContext, type NextFunction } from 'feathers'

@hooks([
  async (context: HookContext, next: NextFunction) => {
    console.log(`Calling ${context.method}`)
    await next()
  }
])
class MyService {
  async find(params: Params) {
    return []
  }

  async get(id: Id, params: Params) {
    return { id }
  }
}
```

### Method decorator

`@hooks(manager)` on a method registers hooks for that specific method. Use `middleware([...]).params(...)` to configure which arguments are mapped to context properties:

```ts
import { hooks, middleware, type HookContext, type NextFunction } from 'feathers'

class MessageService {
  @hooks(
    middleware([
      async (context: HookContext, next: NextFunction) => {
        // context.id and context.params are available
        // because .params('id', 'params') maps the method arguments
        console.log(`Getting message ${context.id}`)
        await next()
      }
    ]).params('id', 'params')
  )
  async get(id: Id, params: Params) {
    return { id }
  }
}
```

The `.params()` call tells the hook system how to map the method's arguments to named properties on the hook context. For standard service methods (`find`, `get`, `create`, `update`, `patch`, `remove`), the parameter mapping is set up automatically by Feathers when the service is registered.

### Inheritance

Class-level hooks are inherited. A subclass will run hooks from all parent classes in order (outermost parent first):

```ts
@hooks([
  async (ctx, next) => {
    // Runs first
    await next()
    // Runs last
  }
])
class BaseService {}

@hooks([
  async (ctx, next) => {
    // Runs second
    await next()
    // Runs second-to-last
  }
])
class MessageService extends BaseService {
  async find(params: Params) {
    return []
  }
}
```

## Hook functions

### around

`around` hooks are the primary hook type. They wrap around the service method call, giving you control over the entire `before`, `after` and `error` flow in a single function. An `around` hook is an `async` function that accepts two arguments:

- The [hook context](#hook-context)
- An asynchronous `next` function. Calling `await next()` runs the next hook in the chain or the service method itself.

```ts
import type { HookContext, NextFunction } from 'feathers'

const myAroundHook = async (context: HookContext, next: NextFunction) => {
  try {
    // Code before `await next()` runs before the service method
    await next()
    // Code after `await next()` runs after the service method
  } catch (error) {
    // Handle errors
  }
}
```

### before, after and error

`before`, `after` and `error` hook functions take only the [hook context](#hook-context) as a parameter:

```ts
import type { HookContext } from 'feathers'

const myBeforeHook = async (context: HookContext) => {
  // Runs before the service method
}
```

For more information see the [hook flow](#hook-flow) section.

## Hook flow

In general, hooks are executed in the following order:

- `around` hooks (before `await next()`)
- `before` hooks
- service method
- `after` hooks
- `around` hooks (after `await next()`)

Note that since `around` hooks wrap **around** everything, the first hook to run will be the last to execute its code after `await next()`. This is the reverse of the order `after` hooks execute.

When using both decorators and the `.hooks()` method, the execution order is:

1. Application `around` hooks (via `app.hooks()`)
2. Application `before` hooks
3. Class-level `@hooks` (outermost parent first)
4. Method-level `@hooks`
5. Service `around` hooks (via `service.hooks()`)
6. Service `before` hooks
7. Service method
8. Service `after` hooks
9. Service `around` hooks (after `await next()`)
10. Method-level `@hooks` (after `await next()`)
11. Class-level `@hooks` (after `await next()`)
12. Application `after` hooks
13. Application `around` hooks (after `await next()`)

The hook flow can be affected as follows.

### Throwing an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

```ts
@hooks([
  async (context: HookContext, next: NextFunction) => {
    if (!context.params.user) {
      throw new Error('Not authenticated')
    }
    await next()
  }
])
class MessageService {
  async create(data: any, params: Params) {
    return data
  }
}
```

### Setting `context.result`

When `context.result` is set in an `around` hook before calling `await next()` or in a `before` hook, the original [service method](./services) call will be skipped. All other hooks will still execute in their normal order.

```ts
class UserService {
  @hooks(
    middleware([
      async (context: HookContext, next: NextFunction) => {
        // Skip the database call and return the authenticated user instead
        context.result = context.params.user
        await next()
      }
    ]).params('id', 'params')
  )
  async get(id: Id, params: Params) {
    return this.db.findById(id)
  }
}
```

## Hook context

The hook `context` is passed to a hook function and contains information about the service method call. It has **read only** properties that should not be modified and **writeable** properties that can be changed for subsequent hooks.

::tip
The `context` object is the same throughout a service method call so it is possible to add properties and use them in other hooks at a later time.
::

::warning[Important]
If you want to inspect the hook context, e.g. via `console.log`, the object returned by [context.toJSON()](#contexttojson) should be used, otherwise you won't see all properties that are available.
::

### `context.app`

`context.app` is a _read only_ property that contains the [Feathers application object](./application). This can be used to retrieve other services (via `context.app.service('name')`) or configuration values.

### `context.service`

`context.service` is a _read only_ property and contains the service this hook currently runs on.

### `context.path`

`context.path` is a _read only_ property and contains the service name (or path) without leading or trailing slashes.

### `context.method`

`context.method` is a _read only_ property with the name of the [service method](./services) (`find`, `get`, `create`, `update`, `patch`, `remove` or a custom method name).

### `context.type`

`context.type` is a _read only_ property with the hook type (one of `around`, `before`, `after` or `error`).

### `context.params`

`context.params` is a **writeable** property that contains the [service method](./services) parameters (including `params.query`). For more information see the [service params documentation](./services#params).

### `context.id`

`context.id` is a **writeable** property and the `id` for a `get`, `remove`, `update` and `patch` service method call. For `remove`, `update` and `patch`, `context.id` can also be `null` when modifying multiple entries. In all other cases it will be `undefined`.

### `context.data`

`context.data` is a **writeable** property containing the data of a `create`, `update` and `patch` service method call.

::note
`context.data` will only be available for `create`, `update`, `patch` and [custom methods](./services#custom-methods).
::

#### Working with Streams

When using [streaming uploads](./client/http#streaming-uploads), `context.data` will be a `ReadableStream`. Since streams can only be consumed once, around hooks are the recommended way to work with streaming data. Here are common patterns:

**Passing streams through unchanged:**

If you only need to validate metadata or check permissions, you can let the stream pass through to the service:

```ts
@hooks([
  async (context: HookContext, next: NextFunction) => {
    // Validate using headers - don't consume the stream
    const contentType = context.params.headers?.['content-type']
    if (!contentType?.startsWith('image/')) {
      throw new BadRequest('Only images are allowed')
    }

    // Stream passes through unchanged
    await next()
  }
])
class UploadService {
  async create(stream: ReadableStream, params: Params) {
    // Process the stream
  }
}
```

**Wrapping streams with transforms:**

You can wrap the incoming stream with a transform stream for processing:

```ts
import { TransformStream } from 'node:stream/web'

class UploadService {
  @hooks(
    middleware([
      async (context: HookContext, next: NextFunction) => {
        const originalStream = context.data as ReadableStream

        // Create a transform that tracks bytes
        let totalBytes = 0
        const countingTransform = new TransformStream({
          transform(chunk, controller) {
            totalBytes += chunk.length
            controller.enqueue(chunk)
          }
        })

        // Replace with transformed stream
        context.data = originalStream.pipeThrough(countingTransform)

        await next()

        // After service completes, totalBytes is available
        context.result.size = totalBytes
      }
    ]).params('data', 'params')
  )
  async create(stream: ReadableStream, params: Params) {
    // Process the stream
  }
}
```

::warning[Important]
Streams can only be consumed once. If you need to read the stream content in a hook (e.g., for validation), you must either buffer the entire stream or use a tee/transform approach. For large files, prefer validating metadata from headers rather than consuming the stream.
::

### `context.error`

`context.error` is a **writeable** property with the error object that was thrown in a failed method call. It can be modified to change the error that is returned at the end.

::note
`context.error` will only be available if `context.type` is `error`.
::

### `context.result`

`context.result` is a **writeable** property containing the result of the successful service method call. It is only available in `after` hooks. `context.result` can also be set in

- An `around` or `before` hook to skip the actual service method (database) call
- An `error` hook to swallow the error and return a result instead

::note
`context.result` will only be available if `context.type` is `after` or if `context.result` has been set.
::

### `context.dispatch`

`context.dispatch` is a **writeable, optional** property and contains a "safe" version of the data that should be sent to any client. If `context.dispatch` has not been set `context.result` will be sent to the client instead. `context.dispatch` only affects the data sent through a Feathers Transport like [HTTP](./http). An internal method call will still get the data set in `context.result`.

### `context.http`

`context.http` is a **writeable, optional** property that allows customizing HTTP response specific properties. The following properties can be set:

- `context.http.status` - Sets the [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that should be returned. Usually the most appropriate status code will be picked automatically but there are cases where it needs to be customized.
- `context.http.headers` - An object with additional HTTP response headers
- `context.http.location` - Setting this property will trigger a redirect for HTTP requests.

### `context.event`

`context.event` is a **writeable, optional** property that allows service events to be skipped by setting it to `null`

### `context.toJSON()`

`context.toJSON()` returns a full object representation of the hook context and all its properties.

## Registering hooks with .hooks()

In addition to [decorators](#decorators), hooks can be registered on a service through the `app.service(<servicename>).hooks(hooks)` method. This is useful when you want to add hooks to a service without modifying its class definition.

The most common registration format is:

```ts
app.service('messages').hooks({
  around: {
    all: [
      async (context: HookContext, next: NextFunction) => {
        console.log('around all hook ran')
        await next()
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
    // Custom methods use hooks as well
    myCustomMethod: []
  },
  before: {
    all: [async (context: HookContext) => console.log('before all hook ran')],
    find: [],
    get: []
    // ...etc
  },
  after: {
    find: [async (context: HookContext) => console.log('after find hook ran')]
  },
  error: {}
})
```

Since around hooks offer the same functionality as `before`, `after` and `error` hooks at the same time they can also be registered without a nested object:

```ts
// Passing an array of around hooks that run for every method
app.service('messages').hooks([
  async (context: HookContext, next: NextFunction) => {
    console.log('around all hook ran')
    await next()
  }
])

// Passing an object with method names and a list of around hooks
app.service('messages').hooks({
  get: [
    async (context: HookContext, next: NextFunction) => {
      console.log('around get hook ran')
      await next()
    }
  ],
  create: [],
  update: [],
  patch: [],
  remove: []
})
```

## Application hooks

### Service hooks

To add hooks to every service `app.hooks(hooks)` can be used. Application hooks are registered in the same format as service hooks and also work exactly the same. Note when application hooks will be executed:

- `around` application hooks will run around all other hooks
- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

Here is an example for a very useful application hook that logs every service method error with the service and method name as well as the error stack.

```ts
app.hooks({
  error: {
    all: [
      async (context: HookContext) => {
        console.error(`Error in '${context.path}' service method '${context.method}'`, context.error.stack)
      }
    ]
  }
})
```

### Setup and teardown

A special kind of application hooks are [app.setup](./application#setupserver) and [app.teardown](./application#teardownserver) hooks. They are around hooks that can be used to initialize database connections etc. and only run once when the application starts or shuts down. Setup and teardown hooks only have `context.app` and `context.server` available in the hook context.

```ts
app.hooks({
  setup: [
    async (context: HookContext, next: NextFunction) => {
      // E.g. wait for MongoDB connection to complete
      await context.app.get('mongoClient').connect()
      await next()
    }
  ],
  teardown: [
    async (context: HookContext, next: NextFunction) => {
      // Close MongoDB connection
      await context.app.get('mongoClient').close()
      await next()
    }
  ]
})
```
