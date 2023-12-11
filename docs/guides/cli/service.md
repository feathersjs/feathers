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

In TypeScript the `ServiceTypes` interface defined in the [declarations](./declarations.md) will also be extended with the correct service class type using the [shared path](./service.shared.md) as a key:

```ts
declare module '../../../declarations' {
  interface ServiceTypes {
    [testingPath]: TestingService
  }
}
```

</LanguageBlock>

## Registering hooks

This file is also where service [hooks](../../api/hooks.md) are registered on the service. Depending on the selection, it commonly includes the [authentication hook](../../api/authentication/hook.md) and hooks that validate and resolve the schemas from the [service.schemas file](./service.schemas.md).

```ts
// Initialize hooks
app.service(messagePath).hooks({
  around: {
    all: [
      authenticate('jwt'),
      schemaHooks.resolveExternal(messageExternalResolver),
      schemaHooks.resolveResult(messageResolver)
    ]
  },
  before: {
    all: [schemaHooks.validateQuery(messageQueryValidator), schemaHooks.resolveQuery(messageQueryResolver)],
    find: [],
    get: [],
    create: [schemaHooks.validateData(messageDataValidator), schemaHooks.resolveData(messageDataResolver)],
    patch: [schemaHooks.validateData(messagePatchValidator), schemaHooks.resolveData(messagePatchResolver)],
    remove: []
  },
  after: {
    all: []
  },
  error: {
    all: []
  }
})
```

Note that you can add hooks to a specific method as documented in the [hook registration API](../../api/hooks.md#registering-hooks). For example, to use the [profiling hook](./hook.md#profiling-example) only for `find` and `get` the registration can be updated like this:

```ts{12-13}
import { profiler } from '../../hooks/profiler'
// ...

// Initialize hooks
app.service(messagePath).hooks({
  around: {
    all: [
      authenticate('jwt'),
      schemaHooks.resolveExternal(messageExternalResolver),
      schemaHooks.resolveResult(messageResolver)
    ],
    find: [profiler],
    get: [profiler]
  },
  before: {
    all: [schemaHooks.validateQuery(messageQueryValidator), schemaHooks.resolveQuery(messageQueryResolver)],
    find: [],
    get: [],
    create: [schemaHooks.validateData(messageDataValidator), schemaHooks.resolveData(messageDataResolver)],
    patch: [schemaHooks.validateData(messagePatchValidator), schemaHooks.resolveData(messagePatchResolver)],
    remove: []
  },
  after: {
    all: []
  },
  error: {
    all: []
  }
})
```

This also applies to any hook plugins like [feathers-hooks-common](https://hooks-common.feathersjs.com/).
