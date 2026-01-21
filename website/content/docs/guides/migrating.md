

# Migrating to v5

This guide explains the new features and changes necessary to migrate to the Feathers v5 (Dove) release. It expects applications to be using the previous Feathers v4 (Crow). See the [v4 (Crow) migration guide](https://crow.docs.feathersjs.com/guides/migrating.html) for upgrading to the previous version.

## Testing the prerelease

You can run the following to upgrade all Feathers core packages:

```
npx npm-check-updates --upgrade --filter /@feathersjs/
npm install
```

You can see the migration steps necessary for the Feathers chat [here for Javascript](https://github.com/feathersjs/feathers-chat/compare/dove-pre) and [here for TypeScript](https://github.com/feathersjs/feathers-chat-ts/compare/dove-pre).

## New Features

There are so many new features in this release that they got their own page! Read about the new features on the [What's New in v5](./whats-new) page.

## Core SQL and MongoDB

The new [schemas and resolvers](../api/schema/index) cover most use cases previously provided by higher level ORMs like Sequelize or Mongoose in a more flexible and Feathers friendly way. This allows for a better database integration into Feathers without the overhead of a full ORM which is why the more low level [MongoDB](../api/databases/mongodb) and [Knex](../api/databases/knex) (SQL) database adapters have been moved into Feathers core for first-class SQL and MongoDB database support.

## TypeScript

The new version comes with major improvements in TypeScript support from improved service typings, fully typed hook context and typed configuration. You can see the changes necessary in the Feathers chat [here](https://github.com/feathersjs/feathers-chat-ts/compare/dove-pre).

### Application and hook context

To get the typed hook context and application configuration update your `declarations.ts` as follows:

```ts
import '@feathersjs/transport-commons'
import { Application as ExpressFeathers } from '@feathersjs/express'
import { HookContext as FeathersHookContext } from '@feathersjs/feathers'

export interface Configuration {
  // Put types for app.get and app.set here
  port: number
}
// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes, Configuration>
export type HookContext = FeathersHookContext<Application>
```

Now `import { HookContext } from './declarations'` can be used as the context in hooks.

### Service types

Service types now only need the actual service class type and should no longer include the `& ServiceAddons<any>`. E.g. for the messages service like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    messages: Messages
  }
}
```

### Configuration types

A Feathers application can now also include types for the values of `app.set` and `app.get`. The configuration can also be validated and the type inferred from a [Feathers schema](../api/schema/index).

### Typed params and query

Service `Params` no longer include a catchall property type and need to be explicitly declared for services that use extended `params`. It is also possible to pass your own query type to use with `params.query`:

```ts
import { Params } from '@feathersjs/feathers'

export type MyQuery = {
  name: string
}

export interface MyServiceParams extends Params<MyQuery> {
  user: User
}
```

You can revert to the previous behaviour by overriding he `Params` declaration:

```ts
declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    [key: string]: any
  }
}
```

## Deprecations and breaking changes

### Express middleware order

The Express `rest` adapter now needs to be configured in the correct order, usually right after the `json()` middleware and before any services are registered. This is already the case in generated applications but it may have to be adjusted in a custom setup.

### Core named export

The import of `feathers` has changed from

```ts
const feathers = require('@feathersjs/feathers')

import feathers from '@feathersjs/feathers'
```

To

```ts
const { feathers } = require('@feathersjs/feathers')

import { feathers } from '@feathersjs/feathers'
```

The Express exports for TypeScript have changed from

```ts
import express from '@feathersjs/express'

app.use(express.json())
app.use(express.urlencoded())
app.use(express.notFound())
app.use(express.errorHandler())
```

To

```ts
import express, { json, urlencoded, notFound, errorHandler } from '@feathersjs/express'

app.use(json())
app.use(urlencoded())
app.use(notFound())
app.use(errorHandler())
```

### Custom Filters & Operators

::warning[pending]
We are exploring the best migration strategy to replace "whitelisting" options with a solution based on [Feathers schema](/api/schema/index). We'll update this guide once the solution is in place.
::

The `whitelist` option is now split into two options: `operators` and `filters`. To migrate, you need to figure out how you're using each item from your old `whitelist`, then move them to the correct option. You can determine if each one is a filter or an operator based on where it is used in a query.

- `filters` are top-level query properties.
- `operators` are positioned under an attribute.

In the below example, `$customFilter` would be a filter, `$regex` and `$options` would be operators.

```ts
const query = {
  $customFilter: 'value',
  name: {
    $regex: /pattern/,
    $options: 'igm'
  }
}
```

For v5 service adapters, split the `whitelist` options into the `filters` object or the `operators` array.

```ts
// 👎`whitelist` and `allow are unsupported.
const oldServiceOptions = {
  whitelist: ['$customFilter', '$ignoreCase', '$regex', '$options']
}

// 👍 Separate items into `filters` and `operators` for v5 service adapters
const serviceOptions = {
  filters: {
    // Map a custom filter to a converter function
    $ignoreCase: (value: any) => (value === 'true' ? true : false),
    // Enable a custom param without converting
    $customQueryOperator: true
  } as const,
  operators: ['$regex', '$options']
}
```

If you're using TypeScript, notice the `as const` after the `filters` object in the options, above. That will keep type errors from happening when passing the `serviceOptions` to the service.

::note
This change only affects service adapters that have been upgraded to v5, like [@feathersjs/mongodb](/api/databases/mongodb), [@feathersjs/knex](/api/databases/knex), and [@feathersjs/memory](/api/databases/memory). This also applies to any community-supported adapters which have been upgraded to v5. If you use a v4 adapter for a service in your v5 app, you do not need to make this change for that service.
::

### Asynchronous setup

`service.setup`, `app.setup` and `app.listen` return a Promise:

```js
// Before
const server = app.listen(3030)

// Now
app.listen(3030).then((server) => {})
```

Usually you would call `app.listen`. In case you are calling `app.setup` instead (e.g. for internal jobs or seed scripts) it is now also asynchronous:

```js
// Before
app.setup()
// Do something here

// Now
await app.setup()
// Do something here
```

### Socket.io 4 and Grant 5

The Socket.io and Grant (oAuth) dependencies have been updated to their latest versions. For more information on breaking changes see:

- The Socket.io [version 3](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#How-to-upgrade-an-existing-production-deployment) and [version 4](https://socket.io/docs/v3/migrating-from-3-x-to-4-0/) upgrade guide. Important points to note are a new improved [CORS policy](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#CORS-handling) and an [explicit v2 client compatibility opt-in](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#How-to-upgrade-an-existing-production-deployment)
- For oAuth authentication the Grant standard configuration should continue to work as is. If you customized any other settings, see the [Grant v4 to v5 migration guide](https://github.com/simov/grant/blob/master/MIGRATION) for the changes necessary.

### Configuration

The automatic environment variable substitution in `@feathersjs/configuration` was causing subtle and hard to debug issues. It has been removed to instead rely on the functionality already provided and battle tested by the underlying [node-config](https://github.com/lorenwest/node-config). To update your configuration:

- Relative paths are no longer relative to the configuration file, but instead to where the application runs. This normally (when running from the application folder) means that paths starting with `../` and `./` have to be replaced with `./` and `./config/`.
- Configuration through environment variables should be included via the `NODE_CONFIG` JSON string or as [Custom Environment Variable support](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables). To use existing environment variables add the following configuration file in `config/custom-environment-variables.json` like this:

```json
// config/custom-environment-variables.json
{
  "hostname": "HOSTNAME",
  "port": "PORT",
  "someSetting": {
    "apiKey": "MY_CUSTOM_API_KEY"
  }
}
```

### Debugging

The `debug` module has been removed as a direct dependency. This reduces the the client bundle size and allows to support other platforms (like Deno). The original `debug` functionality can now be initialized as follows:

```ts
import { feathers } from '@feathersjs/feathers'
import debug from 'debug'

feathers.setDebug(debug)
```

It is also possible to set a custom logger like this:

```ts
import { feathers } from '@feathersjs/feathers'

const customDebug =
  (name) =>
  (...args) => {
    console.log(name, ...args)
  }

feathers.setDebug(customDebug)
```

Setting the debugger will apply to all `@feathersjs` modules.

### Client

- The `request` library has been deprecated and request support has been removed from the REST client.
- Since all modern browsers now support built-in [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), the Angular and jQuery REST clients have been removed as well.
- The `@feathersjs/client` package now only comes with a full (`dist/feathers.js`) and core (`dist/core.js`) browser build. Using Feathers [with a module loader](../api/client#module-loaders) is recommended for all other use cases.

### Removed Primus Transport

Due to low usage `@feathersjs/primus` and `@feathers/primus-client` have been removed from Feathers core.

### Changes to WebSockets

#### Legacy Socket Format

The legacy `servicename::method` socket message format has been deprecated since Feathers 3 and has now been removed. Use a v3 or later [Feathers client](../api/client) or the [current Socket.io direct connection API](../api/client/socketio).

#### Timeouts

The `timeout` setting for socket services has been removed. It was mainly intended as a fallback for the old message format and interfered with the underlying timeout and retry mechanism provided by the websocket libraries themselves.

### NotFound for `app.service`

By default, when getting a non existing service via `app.service('something')` on the server, it will now throw a `NotFound` error instead of returning `undefined`. The previous behaviour can be restored by setting [app.defaultService](../api/application#defaultservice):

```js
app.defaultService = () => {
  return null // undefined
}
```

### Removed `service.mixin()`

Services are no longer Uberproto (an ES5 inheritance utility) objects and instead rely on modern JavaScript classes and extension. This means `app.service(name).mixin(data)` is no longer available which can be replaced with a basic `Object.assign(app.service(name), data)`:

```js
// Before
app.mixins.push((service, path) => {
  service.mixin({
    create(data, params) {
      // do something here
      return this._super(data, params)
    }
  })
})

// Now
app.mixins.push((service, path) => {
  const { create } = service

  Object.assign(service, {
    create(data, params) {
      // do something here, then invoke the old method
      // through normal JavaScript functionality
      return create.call(this, data, params)
    }
  })
})
```

### `finally` hook

The undocumented `finally` hook type is no longer available and should be replaced by the new `around` hooks which offer the same functionality using plain JavaScript:

```js
app.service('myservice').hooks([
  async (context, next) => {
    try {
      await next()
    } finally {
      // Do finally hook stuff here
    }
  }
])
```

### Other internal changes

- The undocumented `service._setup` method introduced in v1 will no longer be called. It was used to circumvent middleware inconsistencies from Express 3 and is no longer necessary.
- The undocumented `app.providers` has been removed since it provided the same functionality as [`app.mixins`](../api/application#mixins)
- `app.disable`, `app.disabled`, `app.enable` and `app.enabled` have been removed from basic Feathers applications. It will still be available in an Express-compatible Feathers application. `app.get()` and `app.set()` should be used instead.
- The `req.authentication` property is no longer set on the express requests, use `req.feathers.authentication` instead.
