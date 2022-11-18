---
outline: deep
---

# Application

The `src/app.ts` file is the main file where the [Feathers application](../../api/application.md) gets initialized and wired up with a Feathers transport.

## Transports

The available transports are [Koa](../../api/koa.md) or [Express](../../api/express.md) for HTTP and [Socket.io](../../api/socketio.md) for real-time functionality. For both, Koa and Express, the Feathers application (`app` object) will also be fully compatible with the respective framework. For both frameworks, additional required middleware will be registered in the application file. More information can be found in the linked API documentation.

## Configure functions

The Feathers application does not use a complicated dependency injection mechanism. Instead, the application is wired together using _configure functions_ to split things up into individual files. They are functions that are exported from a file and that take the Feathers [app object](../../api/application.md) and then use it to e.g. register services. Those functions are then passed to [app.configure](../../api/application.md#configurecallback).

For example, have a look at the following files:

`src/services/index.ts` looks like this:

```ts
import type { Application } from '../declarations'
import { user } from './users/users'

export const services = (app: Application) => {
  app.configure(user)
  // All services will be registered here
}
```

It uses another configure function exported from `src/services/users/users.ts`. The export from `src/services/index.js` is in turn used in `src/app.ts` as:

```ts
// ...
import { services } from './services'

// ...
app.configure(authentication)
app.configure(services)
// ...
```

This is how the generator splits things up into separate files and any documentation example that uses the `app` object can be used in a configure function. You can create your own files that export a configure function and `require`/`import` and `app.configure` them.

<BlockQuote type="info">

Keep in mind that the order in which configure functions are called might matter, e.g. if it is using a service, that service has to be registered first. Configure functions are not asynchronous. Any asynchronous operations should be done in [application setup hooks](#application-hooks).

</BlockQuote>

## Application hooks

The application file also includes a section to set up [application hooks](../../api/hooks.md#application-hooks) which are hooks that run for every service. In our case, the `logErrorHook` to log any service errors has already been registered:

```ts
// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logErrorHook]
  },
  before: {},
  after: {},
  error: {}
})
```

Following that is the special [setup and teardown](../../api/hooks.md#setup-and-teardown) hook section to register hooks that run once when the application starts or shuts down. This can be used to e.g. set dynamic configuration values.

```ts
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})
```

## Tests, jobs and SSR

The `app` file can be imported like any other Node module. This means it can be used directly in tests, scheduled jobs or server side rendering without having to start a separate server instance. For example, the unit tests import the application like this:

```ts
import assert from 'assert'
import { app } from '../../src/app'

describe('messages service', () => {
  it('registered the service', () => {
    const service = app.service('messages')

    assert.ok(service, 'Registered the service')
  })
})
```
