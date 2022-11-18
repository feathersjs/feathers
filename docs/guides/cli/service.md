---
outline: deep
---

# Service

The main service file registers the service on the [application](./app.md) as well as the hooks used on this service.

## Registration

The service is added to the main application via [app.use](../../api/application.md#usepath-service--options) under the path you chose when creating the service. It usses the following options:

- `methods` - A list of methods available for external clients. You can remove methods that are not used or add your own [custom methods](../../api/services.md#custom-methods). Not that this list also has to be updated in the [client file](./client.md).
- `events` - A list of additional [custom events](../../api/events.md#custom-events) sent to clients.

<LanguageBlock global-id="ts">

In TypeScript the `ServiceTypes` interface defined in the [declarations](./declarations.md) will also be extended with the correct service class type:

```ts
declare module '../../../declarations' {
  interface ServiceTypes {
    testing: TestingService
  }
}
```

</LanguageBlock>

## Registering hooks

This file is also where service [hooks](../../api/hooks.md) are registered on the service. Depending on the selection, it commonly includes the [authentication hook](../../api/authentication/hook.md) and hooks that validate and resolve the schemas from the [service.schemas file](./schemas.md).

```ts
// Initialize hooks
app.service('messages').hooks({
  around: {
    all: [authenticate('jwt')]
  },
  before: {
    all: [
      schemaHooks.validateQuery(messageQueryValidator),
      schemaHooks.validateData(messageDataValidator),
      schemaHooks.resolveQuery(messageQueryResolver),
      schemaHooks.resolveData(messageDataResolver)
    ]
  },
  after: {
    all: [schemaHooks.resolveResult(messageResolver), schemaHooks.resolveExternal(messageExternalResolver)]
  },
  error: {
    all: []
  }
})
```

Note that you can add hooks to a specific method as documented in the [hook registration API](../../api/hooks.md#registering-hooks). For example, to use the [profiling hook](./hook.md#profiling-example) only for `find` and `get` the registration can be updated like this:

```ts{8-9}
import { profiler } from '../../hooks/profiler'
// ...

// Initialize hooks
app.service('messages').hooks({
  around: {
    all: [authenticate('jwt')],
    find: [profiler],
    get: [profiler]
  },
  before: {
    all: [
      schemaHooks.validateQuery(messageQueryValidator),
      schemaHooks.validateData(messageDataValidator),
      schemaHooks.resolveQuery(messageQueryResolver),
      schemaHooks.resolveData(messageDataResolver)
    ]
  },
  after: {
    all: [schemaHooks.resolveResult(messageResolver), schemaHooks.resolveExternal(messageExternalResolver)]
  },
  error: {
    all: []
  }
})
```

This also applies to any hook plugins like [feathers-hooks-common](https://hooks-common.feathersjs.com/).
