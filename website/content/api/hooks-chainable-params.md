<!--
  PENDING INTEGRATION: This documentation is for a new feature added in the
  hooks-chainable-params branch. It should be integrated into the main hooks.md
  documentation during the v6-documentation rewrite.
-->

# Chainable Hook Decorator with Custom Params

This document covers the chainable `@hooks()` decorator syntax that allows defining custom method parameters for hook context.

## Overview

By default, Feathers service methods use predefined parameter names in the hook context:

- `find`: `params`
- `get`: `id`, `params`
- `create`: `data`, `params`
- `update`: `id`, `data`, `params`
- `patch`: `id`, `data`, `params`
- `remove`: `id`, `params`

The chainable `@hooks()` decorator allows you to define custom parameter names for methods that don't follow these conventions, such as custom service methods with unique signatures.

## Chainable Syntax

The `@hooks()` decorator returns a chainable object with the following methods:

### `.params(...names)`

Defines the parameter names that will be available on the hook context.

```ts
import { hooks, HookContext, NextFunction } from '@feathersjs/feathers'

class NotificationService {
  @(hooks([
    async (context: HookContext, next: NextFunction) => {
      console.log(context.userId) // 'user123'
      console.log(context.message) // 'Hello!'
      console.log(context.priority) // 1
      await next()
    }
  ]).params('userId', 'message', 'priority'))
  async notify(userId: string, message: string, priority: number) {
    return { sent: true }
  }
}
```

### `.props(properties)`

Adds static properties to the hook context.

```ts
class MyService {
  @(hooks([]).props({ serviceName: 'notifications', version: 2 }))
  async process(data: any) {
    return data
  }
}
```

### `.defaults(initializer)`

Provides default values for the hook context via an initializer function.

```ts
class MyService {
  @(hooks([]).defaults(() => ({ timestamp: Date.now() })))
  async process(data: any) {
    return data
  }
}
```

### Chaining Multiple Methods

All chainable methods can be combined:

```ts
class StatusService {
  @(hooks([
    async (context: HookContext, next: NextFunction) => {
      console.log(context.id) // from params
      console.log(context.serviceName) // from props
      console.log(context.timestamp) // from defaults
      await next()
    }
  ])
    .params('id', 'options')
    .props({ serviceName: 'status' })
    .defaults(() => ({ timestamp: Date.now() })))
  async check(id: string, options?: any) {
    return { id, status: 'ok' }
  }
}
```

## Using with Feathers Services

When a class with decorated methods is registered as a Feathers service, the custom params are preserved and Feathers-specific context properties (`app`, `path`, `service`, `method`) are automatically added.

```ts
import { feathers, hooks, HookContext, NextFunction } from '@feathersjs/feathers'

class MessageService {
  @(hooks([
    async (context: HookContext, next: NextFunction) => {
      // Custom params from decorator
      console.log(context.recipientId)
      console.log(context.content)

      // Feathers context (automatically added)
      console.log(context.app)
      console.log(context.path) // 'messages'
      console.log(context.service)
      console.log(context.method) // 'send'

      await next()
    }
  ]).params('recipientId', 'content'))
  async send(recipientId: string, content: string) {
    return { sent: true, to: recipientId }
  }
}

const app = feathers()

app.use('messages', new MessageService(), {
  methods: ['send']
})

// Call the service
await app.service('messages').send('user123', 'Hello!')
```

## Modifying Custom Params in Hooks

Just like standard params (`data`, `id`, etc.), custom params can be modified in hooks:

```ts
class GreetingService {
  @(hooks([
    async (context: HookContext, next: NextFunction) => {
      // Transform the name before the method runs
      context.name = context.name.toUpperCase()
      await next()
    }
  ]).params('name'))
  async greet(name: string) {
    return `Hello, ${name}!`
  }
}

const service = new GreetingService()
await service.greet('david') // Returns: "Hello, DAVID!"
```

## Backward Compatibility

The decorator continues to work without chaining for standard usage:

```ts
// These are equivalent
@hooks([myHook])
async myMethod() {}

@(hooks([myHook]))
async myMethod() {}
```

## When to Use Custom Params

Custom params are useful when:

1. **Custom service methods** have signatures that don't match standard CRUD operations
2. **Internal methods** need specific parameter handling
3. **Integration with external systems** requires non-standard method signatures

For standard service methods (`find`, `get`, `create`, `update`, `patch`, `remove`), the default params work automatically and don't need to be specified.
