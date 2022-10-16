# Migrating

This guide explains the new features and changes necessary to migrate to the Feathers v5 (Dove) release. It expects applications to be using the previous Feathers v4 (Crow). See the [v4 (Crow) migration guide](https://crow.docs.feathersjs.com/guides/migrating.html) for upgrading to the previous version.

## Status

The final v5 release is expected in the first quarter of 2022. Aside from the breaking changes and new features documented here. For more information

- Follow [the v5 milestone](https://github.com/feathersjs/feathers/milestone/11) - open issues are in development, closed issues are already published as a prerelease
- See the current [v5 Changelog](https://github.com/feathersjs/feathers/blob/dove/CHANGELOG.md)

## Testing the prerelease

You can run the following to test the latest Dove pre-release in your application:

```
npx npm-check-updates --upgrade --target newest --filter /@feathersjs/
npm install
```

You can see the migration steps necessary for the Feathers chat [here for Javascript](https://github.com/feathersjs/feathers-chat/compare/dove-pre) and [here for TypeScript](https://github.com/feathersjs/feathers-chat-ts/compare/dove-pre).

## Features

### Schemas and resolvers

[`@feathersjs/schema`](../api/schema/index.md) provides a way to define data models and to dynamically resolve them. It comes in two main parts:

- [Schema](../api/schema/schema.md) - Uses [JSON schema](https://json-schema.org/) to define a data model with TypeScript types and basic validations. This allows us to:
- [Resolvers](../api/schema/resolvers.md) - Resolve schema properties based on a context (usually the [hook context](../api/hooks.md)).

### Configuration schemas

[Feathers configuration](../api/configuration.md) can now be passed a schema instance to validate the configuration on application start (`app.listen` or `app.setup`).

### Custom methods

Provides a way to expose custom service methods to external clients. See the [services API custom method docs](../api/services.md#custom-methods) how to set up custom service methods and the [REST client](../api/client/rest.md#feathersjs-rest-client) and [Socket.io client](../api/client/socketio.md#feathersjs-socketio-client) chapters on how to use them on the client.

### setup and teardown

`service.setup`, `app.setup`, the new `app.teardown` and `app.listen` now run asynchronously and return a Promise. It is also possible to register [`setup` and `teardown` application hooks](../api/hooks.md#setup-and-teardown) to e.g. establish and gracefully close database connections when the application starts up.

### Async hooks

See the documentation for [feathersjs/hooks](https://github.com/feathersjs/hooks) for the new general purpose hook format that is now also supported by Feathers services (additional documentation to follow).

## TypeScript

The new version comes with major improvements in TypeScript support from improved service typings, fully typed hook context and typed configuration. You can see the changes necessary in the Feathers chat [here](https://github.com/feathersjs/feathers-chat-ts/compare/dove-pre).

### Application and hook context

To get the typed hook context and application configuration update your `declarations.ts` as follows:

```ts
import '@feathersjs/transport-commons';
import { Application as ExpressFeathers } from '@feathersjs/express';
import { HookContext as FeathersHookContext } from '@feathersjs/feathers';

export interface Configuration {
  // Put types for app.get and app.set here
  port: number;
}
// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes, Configuration>;
export type HookContext = FeathersHookContext<Application>;
```

Now `import { HookContext } from './declarations'` can be used as the context in hooks.

### Service types

Service types now only need the actual service class type and should no longer include the `& ServiceAddons<any>`. E.g. for the messages service like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'messages': Messages;
  }
}
```

### Configuration types

A Feathers application can now also include types for the values of `app.set` and `app.get`. The configuration can also be validated and the type inferred from a [Feathers schema](../api/schema/index.md).

### Typed params and query

Service `Params` no longer include a catchall property type and need to be explicitly declared for services that use extended `params`. It is also possible to pass your own query type to use with `params.query`: 

```ts
import { Params } from '@feathersjs/feathers'

export type MyQuery = {
  name: string;
}

export interface MyServiceParams extends Params<MyQuery> {
  user: User;
}
```

You can revert to the previous behaviour by overriding he `Params` declaration:

```ts
declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    [key: string]: any;
  }
}
```

## Deprecations and breaking changes

### Asynchronous setup

`service.setup`, `app.setup` and `app.listen` return a Promise:

```js
// Before
const server = app.listen(3030);

// Now
app.listen(3030).then(server => {
});
```

Usually you would call `app.listen`. In case you are calling `app.setup` instead (e.g. for internal jobs or seed scripts) it is now also asynchronous:

```js
// Before
app.setup();
// Do something here

// Now
await app.setup();
// Do something here
```

### Socket.io 4 and Grant 5

The Socket.io and Grant (oAuth) dependencies have been updated to their latest versions. For more information on breaking changes see:

- The Socket.io [version 3](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#How-to-upgrade-an-existing-production-deployment) and [version 4](https://socket.io/docs/v3/migrating-from-3-x-to-4-0/) upgrade guide. Important points to note are a new improved [CORS policy](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#CORS-handling) and an [explicit v2 client compatibility opt-in](https://socket.io/docs/v3/migrating-from-2-x-to-3-0/index.html#How-to-upgrade-an-existing-production-deployment)
- For oAuth authentication the Grant standard configuration should continue to work as is. If you customized any other settings, see the [Grant v4 to v5 migration guide](https://github.com/simov/grant/blob/master/MIGRATION.md) for the changes necessary.

### Configuration

The automatic environment variable substitution in `@feathersjs/configuration` was causing subtle and hard to debug issues. It has been removed to instead rely on the functionality already provided and battle tested by the underlying [node-config](https://github.com/lorenwest/node-config). To update your configuration:

- Relative paths are no longer relative to the configuration file, but instead to where the application runs. This normally (when running from the application folder) means that paths starting with `../` and `./` have to be replaced with `./` and `./config/`.
- Configuration through environment variables should be included via the `NODE_CONFIG` JSON string or as [Custom Environment Variable support](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables). To use existing environment variables add the following configuration file in `config/custom-environment-variables.<json|yaml|js>` like this:

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

```js
const feathers = require('@feathersjs/feathers');
const debug = require('debug');

feathers.setDebug(debug);
```

It is also possible to set a custom logger like this:

```js
const feathers = require('@feathersjs/feathers');

const customDebug = name => (...args) => {
  console.log(name, ...args);
}

feathers.setDebug(customDebug);
```

Setting the debugger will apply to all `@feathersjs` modules.

### Client

- The `request` library has been deprecated and request support has been removed from the REST client.
- Since all modern browsers now support built-in [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), the Angular and jQuery REST clients have been removed as well.
- The `@feathersjs/client` package now only comes with a full (`dist/feathers.js`) and core (`dist/core.js`) browser build. Using Feathers [with a module loader](../api/client.md#module-loaders) is recommended for all other use cases.

### Removed primus transport

Due to low usage `@feathersjs/primus` and `@feathers/primus-client` have been removed from Feathers core.

### Legacy socket format and timeouts

- The legacy `servicename::method` socket message format has been deprecated in Feathers 3 and has now been removed. Use a v3 or later [Feathers client](../api/client.md) or the [current Socket.io direct connection API](../api/client/socketio.md).
- The `timeout` setting for socket services has been removed. It was mainly intended as a fallback for the old message format and interfered with the underlying timeout and retry mechanism provided by the websocket libraries themselves.

### Removed `service.mixin()`

Services are no longer Uberproto (an ES5 inheritance utility) objects and instead rely on modern JavaScript classes and extension. This means `app.service(name).mixin(data)` is no longer available which can be replaced with a basic `Object.assign(app.service(name), data)`:

```js
// Before
app.mixins.push((service, path) => {
  service.mixin({
    create (data, params) {
      // do something here
      return this._super(data, params);
    }
  });
});

// Now
app.mixins.push((service, path) => {
  const { create } = service;

  Object.assign(service, {
    create (data, params) {
      // do something here, then invoke the old method
      // through normal JavaScript functionality
      return create.call(this, data, params);
    }
  });
});
```

### `finally` hook

The undocumented `finally` hook type is no longer available and should be replaced by the new asynchronous hooks which offer the same functionality using plain JavaScript:

```js
app.service('myservice').hooks([
  async (context, next) => {
    try {
      await next();
    } finally {
      // Do finally hook stuff here
    }
  }
]);
```

### Other internal changes

- The undocumented `service._setup` method introduced in v1 will no longer be called. It was used to circumvent middleware inconsistencies from Express 3 and is no longer necessary.
- The undocumented `app.providers` has been removed since it provided the same functionality as [`app.mixins`](../api/application.md#mixins)
- `app.disable`, `app.disabled`, `app.enable` and `app.enabled` have been removed from basic Feathers applications. It will still be available in an Express compatible Feathers application. `app.get()` and `app.set()` should be used instead.
- The Express `rest` adapter now needs to be configured in the correct order, usually right after the `json()` middleware. This is already the case in generated applications but it may have to be adjusted in a custom setup.
