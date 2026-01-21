

# Hooks

Hooks are pluggable middleware functions that can be registered **around**, **before**, **after** or on **error**(s) of a [service method](./services). Multiple hook functions can be chained to create complex work-flows. A hook is **transport independent**, which means it does not matter if it has been called internally on the server, through HTTP(S) (REST), websockets or any other transport Feathers supports. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they use a database or not.

Hooks are commonly used to handle things like permissions, validation, logging, [authentication](./authentication/hook), [data schemas and resolvers](./schema/index), sending notifications and more. This pattern keeps your application logic flexible, composable, and easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

## Quick Example

The following example logs the runtime of any service method on the `messages` service and adds `createdAt` property before saving the data to the database:

```ts
import { feathers, type HookContext, type NextFunction } from '@feathersjs/feathers'

const app = feathers()

app.service('messages').hooks({
  around: {
    all: [
      // A hook that wraps around all other hooks and the service method
      // logging the total runtime of a successful call
      async (context: HookContext, next: NextFunction) => {
        const startTime = Date.now()

        await next()

        console.log(`Method ${context.method} on ${context.path} took ${Date.now() - startTime}ms`)
      }
    ]
  },
  before: {
    create: [
      async (context: HookContext) => {
        context.data = {
          ...context.data,
          createdAt: Date.now()
        }
      }
    ]
  }
})
```

::note
While it is always possible to add properties like `createdAt` in the above example via hooks, the preferred way to make data modifications like this in Feathers 5 is via [schemas and resolvers](./schema/index).
::

## Hook functions

### before, after and error

`before`, `after` and `error` hook functions are functions that are `async` or return a promise and take the [hook context](#hook-context) as the parameter and return nothing or throw an error.

```ts
import { HookContext } from '../declarations'

export const hookFunction = async (context: HookContext) => {
  // Do things here
}
```

For more information see the [hook flow](#hook-flow) section.

### around

`around` hooks are a special kind of hook that allow to control the entire `before`, `after` and `error` flow in a single function. They are a Feathers specific version of the generic [@feathersjs/hooks](https://github.com/feathersjs/hooks). An `around` hook is an `async` function that accepts two arguments:

- The [hook context](#hook-context)
- An asynchronous `next` function. Somewhere in the body of the hook function, there is a call to `await next()`, which calls the `next` hooks OR the original function if all other hooks have run.

In its simplest form, an around hook looks like this:

```js
import { HookContext, NextFunction } from '../declarations'

export const myAfoundHook = async (context: HookContext, next: NextFunction) => {
  try {
    // Code before `await next()` runs before the main function
    await next()
    // Code after `await next()` runs after the main function.
  } catch (error) {
    // Do things on error
  } finally {
    // Do things always
  }
}
```

Any around hook can be wrapped around another function. Calling `await next()` will either call the next hook in the chain or the service method if all other hooks have run.

## Hook flow

In general, hooks are executed in the order [they are registered](#registering-hooks) with `around` hooks running first:

- `around` hooks (before `await next()`)
- `before` hooks
- service method
- `after` hooks
- `around` hooks (after `await next()`)

Note that since `around` hooks wrap **around** everything, the first hook to run will be the last to execute its code after `await next()`. This is reverse of the order `after` hooks execute.

The hook flow can be affected as follows.

### Throwing an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.

```ts
app.service('messages').hooks({
  before: {
    create: [
      async (context: HookContext) => {
        if (context.data.text.trim() === '') {
          throw new Error('Message text can not be empty')
        }
      }
    ]
  }
})
```

### Setting `context.result`

When `context.result` is set in an `around` hook before calling `await next()` or in a `before` hook, the original [service method](./services) call will be skipped. All other hooks will still execute in their normal order. The following example always returns the currently [authenticated user](./authentication/service) instead of the actual user for all `get` method calls:

```js
app.service('users').hooks({
  before: {
    get: [
      async (context: HookContext) => {
        // Never call the actual users service
        // just use the authenticated user
        context.result = context.params.user
      }
    ]
  }
})
```

## Hook context

The hook `context` is passed to a hook function and contains information about the service method call. It has **read only** properties that should not be modified and **_writeable_** properties that can be changed for subsequent hooks.

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

`context.method` is a _read only_ property with the name of the [service method](./services) (`find`, `get`, `create`, `update`, `patch`, `remove`).

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

When using [streaming uploads](./client/rest#streaming-uploads), `context.data` will be a `ReadableStream`. Since streams can only be consumed once, around hooks are the recommended way to work with streaming data. Here are common patterns:

**Passing streams through unchanged:**

If you only need to validate metadata or check permissions, you can let the stream pass through to the service:

```ts
app.service('uploads').hooks({
  around: {
    create: [
      async (context: HookContext, next: NextFunction) => {
        // Validate using headers - don't consume the stream
        const contentType = context.params.headers?.['content-type']
        if (!contentType?.startsWith('image/')) {
          throw new BadRequest('Only images are allowed')
        }

        // Stream passes through unchanged
        await next()
      }
    ]
  }
})
```

**Wrapping streams with transforms:**

You can wrap the incoming stream with a transform stream for processing:

```ts
import { TransformStream } from 'node:stream/web'

app.service('uploads').hooks({
  around: {
    create: [
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
    ]
  }
})
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

`context.dispatch` is a **writeable, optional** property and contains a "safe" version of the data that should be sent to any client. If `context.dispatch` has not been set `context.result` will be sent to the client instead. `context.dispatch` only affects the data sent through a Feathers Transport like [REST](./express) or [Socket.io](./socketio). An internal method call will still get the data set in `context.result`.

::warning[Important]
`context.dispatch` is used by the `schemaHooks.resolveDispatch` [resolver](./schema/resolvers). Use dispatch resolvers whenever possible to get safe representations external data.
::

### `context.http`

`context.http` is a **writeable, optional** property that allows customizing HTTP response specific properties. The following properties can be set:

- `context.http.status` - Sets the [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that should be returned. Usually the most appropriate status code will be picked automatically but there are cases where it needs to be customized.
- `context.http.headers` - An object with additional HTTP response headers
- `context.http.location` - Setting this property will trigger a redirect for HTTP requests.

::warning[Important]
Setting `context.http` properties will have no effect when using a websocket real-time connection.
::

### `context.event`

`context.event` is a **writeable, optional** property that allows service events to be skipped by setting it to `null`

### `context.toJSON()`

`context.toJSON()` returns a full object representation of the hook context and all its properties.

## Registering hooks

Hook functions are registered on a service through the `app.service(<servicename>).hooks(hooks)` method. The most commonly used registration format is

```js
{
  [type]: { // around, before, after or error
    all: [
      // list of hooks that should run for every method here
    ],
    [methodName]: [
      // list of method hooks here
    ]
  }
}
```

This means usual hook registration looks like this:

```ts
// The standard all at once way (also used by the generator)
// an array of functions per service method name (and for `all` methods)
app.service('servicename').hooks({
  around: {
    all: [
      async (context: HookContext, next: NextFunction) => {
        console.log('around all hook ran')
        await next()
      }
    ],
    find: [
      /* other hook functions here */
    ],
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
    find: [
      /* other hook functions here */
    ],
    get: []
    // ...etc
  },
  after: {
    find: [async (context: HookContext) => console.log('after find hook ran')]
  },
  error: {}
})
```

::warning
Hooks will only be available for the standard service methods or methods passed in `options.methods` to [app.use](application#usepath-service--options). See the [documentation for @feathersjs/hooks](https://github.com/feathersjs/hooks) how to use hooks on other methods.
::

Since around hooks offer the same functionality as `before`, `after` and `error` hooks at the same time they can also be registered without a nested object:

```ts
import { HookContext, NextFunction } from './declarations'

// Passing an array of around hooks that run for every method
app.service('servicename').hooks([
  async (context: HookContext, next: NextFunction) => {
    console.log('around all hook ran')
    await next()
  }
])

// Passing an object with method names and a list of around hooks
app.service('servicename').hooks({
  get: [
    async (context: HookContext, next: NextFunction) => {
      console.log('around get hook ran')
      await next()
    }
  ],
  create: [],
  update: [],
  patch: [],
  remove: [],
  myCustomMethod: []
})
```

## Application hooks

### Service hooks

To add hooks to every service `app.hooks(hooks)` can be used. Application hooks are [registered in the same format as service hooks](#registering-hooks) and also work exactly the same. Note when application hooks will be executed:

- `around` application hook will run around all other hooks
- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

Here is an example for a very useful application hook that logs every service method error with the service and method name as well as the error stack.

```ts
import { HookContext } from './declarations'

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
import { MongoClient } from 'mongodb'

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
