# Enhanced Custom Methods for Feathers v6

## Overview

This plan extends Feathers custom methods beyond the current `(data, params)` signature and `POST` + `X-Service-Method` header approach. The goal is to support flexible argument signatures, HTTP verb mapping, and clean URL routing while maintaining backwards compatibility.

## Problems Being Solved

1. **Custom methods are second-class citizens** - Currently forced into `(data, params)` signature, always POST, always need `X-Service-Method` header

2. **`methods` option is overloaded** - Controls both hook application and external exposure (see PR #3638)

3. **No way to define method characteristics** - Can't specify that `status` should be a GET with `(id, params)` signature

4. **Routing limitations** - No clean URLs like `/messages/123/status`

## Solution: `@method` Decorator

A new `@method` decorator that configures custom method behavior:

```ts
import { method, hooks } from '@feathersjs/feathers'

class MessageService {
  // Standard CRUD - no decorator needed, uses defaults
  async find(params: Params) {}
  async get(id: Id, params: Params) {}
  async create(data: Message, params: Params) {}

  // Custom: GET with id, clean URL path
  @hooks([authenticate('jwt')])
  @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
  async status(id: Id, params: Params): Promise<MessageStatus> {
    const msg = await this.get(id, params)
    return { status: msg.status, lastSeen: msg.lastSeen }
  }

  // Custom: POST with id, clean URL path
  @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
  async archive(id: Id, params: Params): Promise<Message> {
    return this.patch(id, { archived: true }, params)
  }

  // Custom: GET without id (like find but different)
  @method({ args: ['params'], http: 'GET', path: 'stats' })
  async stats(params: Params): Promise<Stats> {
    return { total: 100, unread: 5 }
  }

  // Internal only - hooks run, not exposed via HTTP/sockets
  @method({ args: ['data', 'params'], external: false })
  async internalProcess(data: any, params: Params) {}

  // SSE streaming
  @method({ args: ['params'], http: 'GET', path: 'stream' })
  async *stream(params: Params) {
    yield { event: 'connected' }
  }
}
```

## Configuration Options

### MethodOptions Interface

```ts
// Special names: 'id', 'data', 'params' have built-in meaning
// Any other string is pulled from params.route[name]
// The (string & {}) trick preserves autocomplete for special names
type MethodArg = 'id' | 'data' | 'params' | (string & {})

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface MethodOptions {
  // Argument signature - default for custom methods: ['data', 'params']
  // Special names: 'id' (from URL), 'data' (from body), 'params' (params object)
  // Other names: pulled from params.route[name]
  args?: MethodArg[]

  // HTTP method - default: 'POST' for custom methods
  http?: HttpMethod

  // Custom path pattern - supports any placeholder (e.g., :id, :userId, :messageId)
  // If not set, uses X-Service-Method header (backwards compatible)
  path?: string

  // If false, method is internal only - hooks run but not exposed
  // Default: true
  external?: boolean

  // Event name to emit on successful method call
  // If not set, no event is emitted
  event?: string
}
```

### Argument Resolution

When building method arguments from a request:

| Arg name         | Source                             |
| ---------------- | ---------------------------------- |
| `'id'`           | URL `:id` placeholder (via `__id`) |
| `'data'`         | Request body                       |
| `'params'`       | The params object                  |
| Any other string | `params.route[name]`               |

Example with custom route params:

```ts
@method({ args: ['userId', 'messageId', 'params'], http: 'GET', path: ':userId/:messageId' })
async getMessageForUser(userId: Id, messageId: Id, params: Params) { }

// GET /messages/user-123/msg-456
// → getMessageForUser('user-123', 'msg-456', params)
// → context.userId = 'user-123', context.messageId = 'msg-456'
```

### Three Ways to Configure

**1. `@method` Decorator (recommended for TypeScript)**

```ts
@method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
async status(id: Id, params: Params) { }
```

**2. Static Property (works in plain JS)**

```js
class MessageService {
  static methods = {
    status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
    archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
  }

  async status(id, params) {}
  async archive(id, params) {}
}
```

**3. `app.use()` Options (explicit override)**

```ts
app.use('messages', new MessageService(), {
  methods: {
    find: true,
    get: true,
    create: true,
    status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
    archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
  }
})
```

### Precedence Order

1. `app.use()` options (highest priority)
2. `@method` decorator on the method
3. Static `methods` property on service class
4. Default standard method config (find, get, create, etc.)
5. Default custom method config: `{ args: ['data', 'params'], http: 'POST', external: true }`

## HTTP Routing

### Default Behavior (Backwards Compatible)

Without `path` option, custom methods use the existing header approach:

```
POST /messages
X-Service-Method: myCustomMethod
Body: { "data": "here" }
```

### Clean URL Routing (with `path` option)

With `path` option, methods get clean URLs:

| Method    | Config                                  | HTTP Request                 |
| --------- | --------------------------------------- | ---------------------------- |
| `status`  | `{ path: ':id/status', http: 'GET' }`   | `GET /messages/123/status`   |
| `archive` | `{ path: ':id/archive', http: 'POST' }` | `POST /messages/123/archive` |
| `stats`   | `{ path: 'stats', http: 'GET' }`        | `GET /messages/stats`        |

### Routing Priority

1. Custom paths are matched first (most specific)
2. Standard CRUD routes second
3. Header-based custom methods last (fallback)

The router matches literal path segments before placeholders. So `/messages/stats` (literal) matches the `stats` method, not `get('stats')`. This is handled automatically by the existing Feathers router.

## Client Configuration

Define services once on the server, derive both runtime config and types from the same source:

```ts
// server: src/client.ts
import { buildMethodConfig, type InferServiceTypes } from '@feathersjs/feathers'
import { MessageService } from './services/messages.service'
import { UserService } from './services/users.service'

// Single source of truth
const services = {
  messages: MessageService,
  users: UserService
}

// Derive runtime config and types
export const serviceMethods = buildMethodConfig(services)
export type ServiceTypes = InferServiceTypes<typeof services>
```

```ts
// client
import { feathers, fetchClient } from '@feathersjs/feathers'
import { serviceMethods, type ServiceTypes } from 'my-server/client'

const connection = fetchClient(fetch, {
  baseUrl: 'http://localhost:3030',
  methods: serviceMethods
})

const app = feathers<ServiceTypes>().configure(connection)

// Fully typed, correct HTTP verbs and paths
await app.service('messages').status(123) // GET /messages/123/status
await app.service('messages').archive(123) // POST /messages/123/archive
```

### Helper Types

```ts
// buildMethodConfig extracts @method decorator config from each service class
function buildMethodConfig<T extends Record<string, new (...args: any[]) => any>>(
  services: T
): { [K in keyof T]: MethodConfig }

// InferServiceTypes maps class constructors to instance types
type InferServiceTypes<T extends Record<string, new (...args: any[]) => any>> = {
  [K in keyof T]: InstanceType<T[K]>
}
```

If no method config is provided, custom methods fall back to the header approach (`POST` with `X-Service-Method`).

## Implementation Phases

### Phase 1: Types and Decorator ✅

- [x] Define `MethodOptions` and `MethodArg` types in `declarations.ts`
- [x] Create `METHOD_OPTIONS` symbol
- [x] Implement `@method` decorator in new `method.ts` file
- [x] Export from `index.ts`
- [x] Write tests for decorator

### Phase 2: Service Registration ✅

- [x] Add `defaultMethodOptions` for standard methods (find, get, create, etc.)
- [x] Add `defaultCustomMethodOptions` for custom methods
- [x] Implement `normalizeMethodOptions()` to merge all config sources
- [x] Update `wrapService()` to store normalized method options
- [x] Update `getServiceOptions()` return type
- [x] Write tests for option normalization

### Phase 3: Hooks Integration ✅

- [x] Update `hookMixin()` to read `args` from method options
- [x] Ensure hooks work with all argument signatures
- [x] Handle `external: false` methods (hooks run, not exposed)
- [x] Write tests for hooks on custom methods

### Phase 4: HTTP Routing ✅

- [x] Register custom paths in router during `app.use()`
- [x] Update `createHandler()` to use route method and HTTP verb
- [x] Add argument builders for all signatures in `utils.ts`
- [x] Handle `:id` placeholder in paths (via `__id` transform)
- [x] Write tests for HTTP routing

### Phase 5: Client Support ✅

- [x] Update `FetchClient` to support custom HTTP verbs
- [x] Update `FetchClient` to support custom paths
- [x] Add `makeCustomUrl()` method for path building
- [x] Implement `buildMethodConfig()` helper for extracting method config from service classes
- [x] Implement `InferServiceTypes` type helper for deriving service types
- [x] Write tests for client calls

### Phase 6: Real-time Support ✅

- [x] SSE works through HTTP layer which already supports method options
- [x] Method options stored on service are accessible to any transport
- [x] `external: false` methods blocked at HTTP handler level
- [ ] Socket.io transport support (not in this monorepo - would be in `@feathersjs/socketio`)

### Phase 7: Documentation ✅

- [x] Update services documentation (`website/content/api/services.md`)
- [x] Update REST client documentation (`website/content/api/client/rest.md`)
- [x] Document migration from PR #3638 approach (inline in services.md)

::note
Socket.io client documentation was not updated because the Socket.io transport is not part of this monorepo. When `@feathersjs/socketio` is updated to support custom method `args` configurations, the client documentation should be updated to reflect the different argument patterns.
::

## Backwards Compatibility

- Array `methods: ['find', 'get', 'myMethod']` still works
- `X-Service-Method` header still works (when no `path` specified)
- Standard methods work without decorators
- Services without decorators work exactly as before
- All existing tests should pass without modification

## Addresses

- Issue #1976 discussion about variable parameters
- PR #3638 use case (internal vs external methods via `external: false`) - **PR #3638 will be closed in favor of this approach**
- Discussion #3423 about custom REST routes

## Replaces PR #3638

PR #3638 added `externalMethods` as a separate array option. This plan replaces that approach with per-method `external: false`:

```ts
// PR #3638 approach (will be closed)
app.use('messages', service, {
  methods: ['find', 'get', 'internalMethod'],
  externalMethods: ['find', 'get']
})

// Our approach (cleaner, co-located with method)
@method({ external: false })
async internalMethod(data: any, params: Params) { }

// Or via app.use options
app.use('messages', service, {
  methods: {
    find: true,
    get: true,
    internalMethod: { external: false }
  }
})
```

Benefits of our approach:

- Configuration lives with the method definition
- Works with decorators
- Single `methods` option instead of two arrays
- More granular control per method

## Socket.io Protocol

Socket calls spread args based on the method's `args` config - same as standard methods:

```js
// args: ['params']
socket.emit('stats', 'messages', params, callback)

// args: ['id', 'params']
socket.emit('status', 'messages', id, params, callback)

// args: ['data', 'params'] (default for custom methods)
socket.emit('myCustomMethod', 'messages', data, params, callback)

// args: ['id', 'data', 'params']
socket.emit('archive', 'messages', id, data, params, callback)
```

This is consistent with how standard methods already work. Custom methods default to `['data', 'params']`, so existing socket calls continue to work unchanged. The `path` and `http` options only affect HTTP routing.

## Design Decisions

### 1. Socket.io argument mapping

Socket calls spread args based on the method's `args` config - same as standard methods. Custom methods default to `['data', 'params']`, so existing code works unchanged. The `path` and `http` options only affect HTTP routing.

### 2. Client types

Use the existing `ServiceTypes` pattern. Method signatures on the service class are the source of truth for types. The `@method` decorator only adds runtime config.

### 3. No compile-time validation of `args`

Developer keeps `args` in sync with method signature. Mismatches fail at runtime during testing.

### 4. No null ID for custom methods

Custom methods with `:id` in the path require an ID. For bulk operations, design a separate method without `:id`.

### 5. Path conflicts handled by router

The existing router handles conflicts - literals match before placeholders, duplicate exact paths throw errors.

### 6. `external: boolean`

Simple boolean. `true` (default) = exposed, `false` = throws `MethodNotAllowed`. For dynamic auth decisions, use hooks.

### 7. Events via `event` option

Custom methods don't emit events by default. Use `event: 'eventName'` option to auto-emit. Works with existing `context.dispatch` for safe client data.

### 8. All options available in all config methods

All `MethodOptions` properties (`args`, `http`, `path`, `external`, `event`) are available in all three configuration methods: decorator, static property, and `app.use()` options.

## Scope Decisions

1. **Multiple paths per method?** No - one path per method. Create separate methods if needed.

2. **Path patterns beyond `:id`?** The `:id` placeholder maps to the method's `id` argument. Additional placeholders (e.g., `:userId`) are supported via the existing `params.route` pattern - no special handling needed.

3. **OpenAPI/Swagger metadata?** Out of scope - this is a plugin concern. The `MethodOptions` structure could be extended by plugins later.
