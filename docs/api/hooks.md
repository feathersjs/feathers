# Hooks

Hooks are pluggable middleware functions that can be registered __before__, __after__ or on __error__(s) of a [service method](./services.md). You can register a single hook function or create a chain of them to create complex work-flows. Most of the time multiple hooks are registered so the examples show the "hook chain" array style registration.

A hook is **transport independent**, which means it does not matter if it has been called through HTTP(S) (REST), websockets or any other transport Feathers may support. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not.

Hooks are commonly used to handle things like validation, logging, populating related entities, sending notifications and more. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

## Quick Example

The following example adds a `createdAt` and `updatedAt` property before saving the data to the database and logs any errors on the service:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const feathers = require('@feathersjs/feathers');

const app = feathers();

app.service('messages').hooks({
  before: {
    create: [async context => {
      context.data.createdAt = new Date();

      return context;
    }],

    update: [async context => {
      context.data.updatedAt = new Date();

      return context;
    }],

    patch: [async context => {
      context.data.updatedAt = new Date();

      return context;
    }]
  },

  error: {
    all: [async context => {
      console.error(`Error in ${context.path} calling ${context.method}  method`, context.error);

      return context;
    }]
});
```
:::

::: tab "TypeScript"
```js
import { default as feathers, HookContext } from '@feathersjs/feathers';

const app = feathers();

app.service('messages').hooks({
  before: {
    create: [async (context: HookContext) => {
      context.data.createdAt = new Date();

      return context;
    }],

    update: [async (context: HookContext) => {
      context.data.updatedAt = new Date();

      return context;
    }],

    patch: [async (context: HookContext) => {
      context.data.updatedAt = new Date();
      
      return context;
    }]
  },

  error: {
    all: [async (context: HookContext) => {
      console.error(`Error in ${context.path} calling ${context.method}  method`, context.error);

      return context;
    }]
});
```
:::

::::

## Hook functions

A hook function can be a normal or `async` function that takes the [hook context](#hook-context) as the parameter and returns the `context` object, `undefined` or throws an error.

For more information see the [hook flow](#hook-flow) and [asynchronous hooks](#asynchronous-hooks) section.

## Hook context

The hook `context` is passed to a hook function and contains information about the service method call. It has __read only__ properties that should not be modified and ___writeable___ properties that can be changed for subsequent hooks.

> **Pro Tip:** The `context` object is the same throughout a service method call so it is possible to add properties and use them in other hooks at a later time.

### context.app

`context.app` is a _read only_ property that contains the [Feathers application object](./application.md). This can be used to retrieve other services (via `context.app.service('name')`) or configuration values.

### context.service

`context.service` is a _read only_ property and contains the service this hook currently runs on.

### context.path

`context.path` is a _read only_ property and contains the service name (or path) without leading or trailing slashes.

### context.method

`context.method` is a _read only_ property with the name of the [service method](./services.md) (`find`, `get`, `create`, `update`, `patch`, `remove`).

### context.type

`context.type` is a _read only_ property with the hook type (one of `before`, `after` or `error`).

### context.params

`context.params` is a __writeable__ property that contains the [service method](./services.md) parameters (including `params.query`). For more information see the [service params documentation](./services.md#params).

### context.id

`context.id` is a __writeable__ property and the `id` for a `get`, `remove`, `update` and `patch` service method call. For `remove`, `update` and `patch` `context.id` can also be `null` when modifying multiple entries. In all other cases it will be `undefined`.

> __Note:__ `context.id` is only available for method types `get`, `remove`, `update` and `patch`.

### context.data

`context.data` is a __writeable__ property containing the data of a `create`, `update` and `patch` service method call.

> __Note:__ `context.data` will only be available for method types `create`, `update` and `patch`.

### context.error

`context.error` is a __writeable__ property with the error object that was thrown in a failed method call. It is only available in `error` hooks.

> __Note:__ `context.error` will only be available if `context.type` is `error`.

### context.result

`context.result` is a __writeable__ property containing the result of the successful service method call. It is only available in `after` hooks. `context.result` can also be set in

- A `before` hook to skip the actual service method (database) call
- An `error` hook to swallow the error and return a result instead

> __Note:__ `context.result` will only be available if `context.type` is `after` or if `context.result` has been set.

### context.dispatch

`context.dispatch` is a __writeable, optional__ property and contains a "safe" version of the data that should be sent to any client. If `context.dispatch` has not been set `context.result` will be sent to the client instead.

> __Note:__ `context.dispatch` only affects the data sent through a Feathers Transport like [REST](./express.md) or [Socket.io](./socketio.md). An internal method call will still get the data set in `context.result`.

### context.http

`context.http` is a __writeable, optional__ property that allows customizing HTTP response specific properties. The following properties can be set:

- `context.http.status` - Sets the [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) that should be returned. Usually the most appropriate status code will be picked automatically but there are cases where it needs to be customized.
- `context.http.headers` - An object with additional HTTP response headers
- `context.http.location` - Setting this property will trigger a redirect for HTTP requests.

### context.event

`context.event` is a __writeable, optional__ property that allows service events to be skipped by setting it to `null`

## Hook flow

In general, hooks are executed in the order they are registered with the original service method being called after all `before` hooks. This flow can be affected as follows.

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

When `context.result` is set in a `before` hook, the original [service method](./services.md) call will be skipped. All other hooks will still execute in their normal order. The following example always returns the currently [authenticated user](./authentication/service.md) instead of the actual user for all `get` method calls:

```js
app.service('users').hooks({
  before: {
    get: [
      context => {
        // Never call the actual users service
        // just use the authenticated user
        context.result = context.params.user;

        return context;
      }
    ]
  }
});
```

## Asynchronous hooks

When the hook function is `async` or a Promise is returned it will wait until all asynchronous operations resolve or reject before continuing to the next hook.

> **Important:** As stated in the [hook functions](#hook-functions) section the promise has to either resolve with the `context` object (usually done with `.then(() => context)` at the end of the promise chain) or with `undefined`.

### async/await

The use of [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) is highly recommended. This will avoid many common issues when using Promises and asynchronous hook flows. Any hook function can be `async` in which case it will wait until all `await` operations are completed. Just like a normal hook it should return the `context` object or `undefined`.

The following example shows an async/await hook that uses another service to retrieve and populate the messages `user` when getting a single message:

```js
app.service('messages').hooks({
  after: {
    get: [
      async context => {
        const userId = context.result.userId;

        // Since context.app.service('users').get returns a promise we can `await` it
        const user = await context.app.service('users').get(userId);

        // Update the result (the message)
        context.result.user = user;

        // Returning will resolve the promise with the `context` object
        return context;
      }
    ]
  }
});
```

The following example shows an asynchronous hook that uses another service to retrieve and populate the messages `user` when getting a single message.

```js
app.service('messages').hooks({
  after: {
    get: [
      async context => {
        const userId = context.result.userId;

        // Also pass the `params` so we get a secure version of the user
        const user = await context.app.service('users').get(userId, context.params);

        context.result.user = user;

        // Returning will resolve the promise with the `context` object
        return context;
      }
    ]
  }
});
```

> __Note:__ A common issue when hooks are not running in the expected order is a missing `await` statement.

> **Important:** Most Feathers service calls and newer Node packages already return Promises. They can be returned and chained directly. There usually is no need to instantiate your own `new Promise` instance.

### Converting callbacks

When the asynchronous operation is using a _callback_ instead of returning a promise you have to create and return a new Promise (`new Promise((resolve, reject) => {})`) or use [util.promisify](https://nodejs.org/api/util.html#util_util_promisify_original).

The following example reads a JSON file converting [fs.readFile](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback) with `util.promisify`:

```js
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

app.service('messages').hooks({
  after: {
    get: [
      async context => {
        const data = await readFile('./myfile.json');

        context.result.myFile = data.toString();

        return context;
      }
    ]
  }
});
```

## Registering hooks

Hook functions are registered on a service through the `app.service(<servicename>).hooks(hooks)` method. There are several options for what can be passed as `hooks`:

```js
// The standard all at once way (also used by the generator)
// an array of functions per service method name (and for `all` methods)
app.service('servicename').hooks({
  before: {
    all: [
      // Use normal functions
      function(context) { console.log('before all hook ran'); }
    ],
    find: [
      // Use ES6 arrow functions
      context => console.log('before find hook 1 ran'),
      context => console.log('before find hook 2 ran')
    ],
    get: [ /* other hook functions here */ ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
});

// Register a single hook before, after and on error for all methods
app.service('servicename').hooks({
  before(context) {
    console.log('before all hook ran');
  },
  after(context) {
    console.log('after all hook ran');
  },
  error(context) {
    console.log('error all hook ran');
  }
});
```

> **Pro Tip:** When using the full object, `all` is a special keyword meaning this hook will run for all methods. `all` hooks will be registered before other method specific hooks.

> **Pro Tip:** `app.service(<servicename>).hooks(hooks)` can be called multiple times and the hooks will be registered in that order. Normally all hooks should be registered at once however to see at a glance what the service is going to do.

## Application hooks

### Service hooks

To add hooks to every service `app.hooks(hooks)` can be used. Application hooks are [registered in the same format as service hooks](#registering-hooks) and also work exactly the same. Note when application hooks will be executed however:

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

> __Note:__ generated applications come with `src/app.hooks.js` containing hooks that run for every service.

### Setup and teardown

A special kind of application hooks are `setup` and `teardown` hooks. They are advanced hooks that can be used to initialize database connections etc. when the application starts up (or shuts down).

```js
import { MongoClient } from 'mongodb';

app.hooks({
  setup: [
    async (context, next) => {
      const mongodb = new MongoClient(yourConnectionURI);
      
      await mongodb.connect();
      context.app.set('mongodb', mongodb);
    }
  ],
  teardown: [
    async (context, next) => {
      context.app.get('mongodb').close();
      await next();
    }
  ]
})
```