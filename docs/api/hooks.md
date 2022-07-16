---
outline: deep
---

# Hooks

Hooks are pluggable middleware functions that can be registered __around__, __before__, __after__ or on __error__(s) of a [service method](./services.md). Multiple hook functions can be chained to create complex work-flows.  A hook is **transport independent**, which means it does not matter if it has been called internally on the server, through HTTP(S) (REST), websockets or any other transport Feathers supports. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not.

Hooks are commonly used to handle things like permissions, validation, logging, [authentication](./authentication/hook.md), [data schemas and resolvers](./schema/index.md), sending notifications and more. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

## Quick Example

The following example logs the runtime of any service method on the `messages` service and adds `createdAt` property before saving the data to the database:

```ts
import { feathers, type HookContext, type NextFunction } from '@feathersjs/feathers';

const app = feathers();

app.service('messages').hooks({
  around: {
    all: [
      // A hook that wraps around all other hooks and the service method
      // logging the total runtime of a successful call
      async (context: HookContext, next: NextFunction) => {
        const startTime = Date.now()

        await next()

        console.log(`Method ${context.method} on ${context.path} took ${Date.now() - start}ms`)
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


## Hook functions

### before, after and error

`before`, `after` and `error` hook functions are functions that are `async` or return a promise and take the [hook context](#hook-context) as the parameter and return nothing or throw an error.

```js
const hookFunction = async (context) => {
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
const myAsyncHook = async (context, next) => {
  try {
    // Code before `await next()` runs before the main function
    await next();
    // Code after `await next()` runs after the main function.
  } catch (error) {
    // Do things on error
  } finally {
    // Do things always
  }
}
```

Any around hook can be wrapped around another function. Calling `await next()` will either call the next hook in the chain or the original function if all hooks have run.

## Hook flow

In general, hooks are executed in the order [they are registered](#registering-hooks) with `around` hooks running first. Hooks are executed in the following order: 

- `around` hooks (before `await next()`)
- `before` hooks
- service method
- `after` hooks
- `around` hooks (after `await next()`)

Note that since `around` hooks wrap **around** everything, the first hook to run will be the last to execute it's code after `await next()`. This is reverse of the order `after` hooks execute.

The hook flow can be affected as follows.

### Throwing an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.

```js
app.service('messages').hooks({
  before: {
    create: [
      context => {
        if(context.data.text.trim() === '') {
          throw new Error('Message text can not be empty');
        }
      }
    ]
  }
});
```

### Setting `context.result`

When `context.result` is set in an `around` hook before calling `await next()` or in a `before` hook, the original [service method](./services.md) call will be skipped. All other hooks will still execute in their normal order. The following example always returns the currently [authenticated user](./authentication/service.md) instead of the actual user for all `get` method calls:

```js
app.service('users').hooks({
  before: {
    get: [
      (context: HookContext) => {
        // Never call the actual users service
        // just use the authenticated user
        context.result = context.params.user;
      }
    ]
  }
});
```

## Hook context

The hook `context` is passed to a hook function and contains information about the service method call. It has __read only__ properties that should not be modified and ___writeable___ properties that can be changed for subsequent hooks.

<BlockQuote type="tip">

The `context` object is the same throughout a service method call so it is possible to add properties and use them in other hooks at a later time.

</BlockQuote>

### `context.app`

`context.app` is a _read only_ property that contains the [Feathers application object](./application.md). This can be used to retrieve other services (via `context.app.service('name')`) or configuration values.

### `context.service`

`context.service` is a _read only_ property and contains the service this hook currently runs on.

### `context.path`

`context.path` is a _read only_ property and contains the service name (or path) without leading or trailing slashes.

### `context.method`

`context.method` is a _read only_ property with the name of the [service method](./services.md) (`find`, `get`, `create`, `update`, `patch`, `remove`).

### `context.type`

`context.type` is a _read only_ property with the hook type (one of `around`, `before`, `after` or `error`).

### `context.params`

`context.params` is a __writeable__ property that contains the [service method](./services.md) parameters (including `params.query`). For more information see the [service params documentation](./services.md#params).

### `context.id`

`context.id` is a __writeable__ property and the `id` for a `get`, `remove`, `update` and `patch` service method call. For `remove`, `update` and `patch`, `context.id` can also be `null` when modifying multiple entries. In all other cases it will be `undefined`.

### `context.data`

`context.data` is a __writeable__ property containing the data of a `create`, `update` and `patch` service method call.

<BlockQuote type="info">

`context.data` will only be available for `create`, `update`, `patch` and [custom methods](./services.md#custom-methods).

</BlockQuote>

### `context.error`

`context.error` is a __writeable__ property with the error object that was thrown in a failed method call. It can be modified to change the error that is returned at the end.

<BlockQuote type="info">

`context.error` will only be available if `context.type` is `error`.

</BlockQuote>

### `context.result`

`context.result` is a __writeable__ property containing the result of the successful service method call. It is only available in `after` hooks. `context.result` can also be set in

- An `around` or `before` hook to skip the actual service method (database) call
- An `error` hook to swallow the error and return a result instead

<BlockQuote type="info">

`context.result` will only be available if `context.type` is `after` or if `context.result` has been set.

</BlockQuote>

### `context.dispatch`

`context.dispatch` is a __writeable, optional__ property and contains a "safe" version of the data that should be sent to any client. If `context.dispatch` has not been set `context.result` will be sent to the client instead.

<BlockQuote type="info">

`context.dispatch` only affects the data sent through a Feathers Transport like [REST](./express.md) or [Socket.io](./socketio.md). An internal method call will still get the data set in `context.result`.

</BlockQuote>

### `context.http`

`context.http` is a __writeable, optional__ property that allows customizing HTTP response specific properties. The following properties can be set:

- `context.http.status` - Sets the [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that should be returned. Usually the most appropriate status code will be picked automatically but there are cases where it needs to be customized.
- `context.http.headers` - An object with additional HTTP response headers
- `context.http.location` - Setting this property will trigger a redirect for HTTP requests.

<BlockQuote type="warning">

Setting `context.http` properties will have no effect when using a websocket real-time connection.

</BlockQuote>

### `context.event`

`context.event` is a __writeable, optional__ property that allows service events to be skipped by setting it to `null`


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

<BlockQuote type="warning">

Hooks will only be available for the standard service methods or methods passed as an option to [app.use](application.md#usepath-service--options). See the [documentation for @feathersjs/hooks](https://github.com/feathersjs/hooks) how to use hooks on other methods.

</BlockQuote>

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
    find: [ /* other hook functions here */ ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
    // Custom methods use hooks as well
    myCustomMethod: []
  },
  before: {
    all: [
      async (context: HookContext) => console.log('before all hook ran')
    ],
    find: [ /* other hook functions here */ ],
    get: [],
    // ...etc
  },
  after: {
    find: [
      async (context: HookContext) => console.log('after find hook ran')
    ]
  },
  error: {
  }
})
```

<BlockQuote type="tip">

`app.service(<servicename>).hooks(hooks)` can be called multiple times and the hooks will be registered in that order. Normally all hooks should be registered at once however to see at a glance what the service is going to do.

</BlockQuote>

Since around hooks offer the same functionality as `before`, `after` and `error` hooks at the same time they can also be registered without a nested object:

```ts
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

To add hooks to every service `app.hooks(hooks)` can be used. Application hooks are [registered in the same format as service hooks](#registering-hooks) and also work exactly the same. Note when application hooks will be executed however:

- `around` application hook will run around all other hooks
- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

Here is an example for a very useful application hook that logs every service method error with the service and method name as well as the error stack.

```js
app.hooks({
  error(context) {
    console.error(`Error in '${context.path}' service method '${context.method}'`, context.error.stack);
  }
});
```

### Setup and teardown

A special kind of application hooks are `setup` and `teardown` hooks. They are around hooks that can be used to initialize database connections etc. and only run once when the application starts up or shuts down.

```ts
import { MongoClient } from 'mongodb'

app.hooks({
  setup: [
    async (context: HookContext, next: NextFunction) => {
      const mongodb = new MongoClient(yourConnectionURI)

      await mongodb.connect()
      context.app.set('mongodb', mongodb)
      await next()
    }
  ],
  teardown: [
    async (context: HookContext, next: NextFunction) => {
      context.app.get('mongodb').close()
      await next()
    }
  ]
})
```
