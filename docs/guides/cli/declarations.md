---
outline: deep
---

# TypeScript

<LanguageBlock global-id="ts">

The main file for application specific TypeScript declarations can be found at `src/declarations.ts`.

## Compilation

In order to compile and start the application use

```
npm run compile
npm start
```

For development with live reload use

```
npm run dev
```

<BlockQuote type="warning" label="Important">

To get the latest types in the [client](./client.md) and any time before `npm start`, `npm run compile` needs to run.

</BlockQuote>

## Configuration Types

The `Configuration` interface defines the types for [app.get](../../api/application.md#getname) and [app.set](../../api/application.md#setname-value). It is extended from the type inferred from the [configuration schema](./configuration.md#configuration-schemas). Since you can store anything global to the application in `app.get` and `app.set`, you can add additional types that are not part of the initial application configuration here.

```ts
// The types for app.get(name) and app.set(name)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Configuration extends ApplicationConfiguration {
  startupTime: Date
}
```

<BlockQuote type="warning" label="Important">

Both `Configuration` and `ServiceTypes` need to be declared as an `interface` (even if it is empty) so they can be extended via `declare module` in other files. Do not remove the `eslint-disable-next-line` comments.

</BlockQuote>

## Service Types

The `ServiceTypes` interface contains a mapping of all service paths to their service type so that [app.use](../../api/application.md#usepath-service--options) and [app.service](../../api/application.md#servicepath) use the correct type.

```ts
// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}
```

Usually the `ServiceTypes` interface is not modified directly in this file but instead extended via `declare module` in the files where the services are registered. This usually looks like this:

```ts
// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    users: UserService
  }
}
```

## Application

The `Application` interface is the type for the main [app object](./app.md) using the [ServiceTypes](#service-types) interface as the service index and [ConfigurationTypes](#configuration-types) for `app.get` and `app.set`.

```ts
// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration>
```

<BlockQuote type="warning" label="Important">

Always use `import { Application } from './declarations'` to get the proper service and configuration typings. You normally do **not** need to use `import { Application } from '@feathersjs/feathers'` directly.

</BlockQuote>

## Hook Context

The `HookContext` type exports a [hook context](../../api/hooks.md) type with the `Application` and a generic service type `S`.

```ts
// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>
```

Use `HookContext<UserService>` to get the full hook context for a service.

## Services and Params

See the [services chapter](./service.md) for more information on service and parameter typings.

</LanguageBlock>

<LanguageBlock global-id="js">

<BlockQuote type="danger">

Please pick **TypeScript** as the Code language in the main menu dropdown.

</BlockQuote>

</LanguageBlock>
