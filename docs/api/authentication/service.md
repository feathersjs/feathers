---
outline: deep
---

# Authentication Service

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/authentication/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/authentication --save
```

The `AuthenticationService` is a [Feathers service](../services.md) that allows to register different [authentication strategies](./strategy.md) and manage access tokens (using [JSON web tokens (JWT)](https://jwt.io/) by default). This section describes

- The [standard setup](#setup) used by the generator
- How to [configure](#configuration) authentication and where the configuration should go
- The different [authentication flows](#authentication-flows)
- The methods available on the authentication service
- How to [customize](#customization) the authentication service
- The [Events](#events) sent by the authentication service

## Setup

The standard setup initializes an [AuthenticationService](#authenticationservice) at the `/authentication` path with a [JWT strategy](./jwt.md), [Local strategy](./local.md) and [OAuth authentication](./oauth.md) (if selected).

```ts
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
}
```

## Configuration

The standard authentication service configuration is normally located in the `authentication` section of a [configuration file](../configuration.md) (default: `config/default.json`).

<BlockQuote type="info" label="Note">

The authentication service can also be configured dynamically or without Feathers configuration by using [app.set](../application.md#set-name-value), e.g. `app.set('authentication', config)`.

</BlockQuote>

The following options are available:

- `secret`: The JWT signing secret.
- `service`: The path of the entity service
- `authStrategies`: A list of authentication strategy names to allow on this authentication service to create access tokens.
- `parseStrategies`: A list of authentication strategies that should be used to parse HTTP requests. Defaults to the same as `authStrategies`.
- `entity`: The name of the field that will contain the entity after successful authentication. Will also be used to set `params[entity]` (usually `params.user`) when using the [authenticate hook](./hook). Can be `null` if no entity is used (see [stateless tokens](../../cookbook/authentication/stateless.md)).
- `entityId`: The id property of an entity object. Only necessary if the entity service does not have an `id` property (e.g. when using a custom entity service).
- `jwtOptions`: All options available for the [node-jsonwebtoken package](https://github.com/auth0/node-jsonwebtoken).

An authentication service configuration in `config/default.json` can look like this:

```json
{
  "authentication": {
    "secret": "CHANGE_ME",
    "entity": "user",
    "service": "users",
    "authStrategies": ["jwt", "local"],
    "jwtOptions": {
      "header": { "typ": "access" },
      "audience": "https://yourdomain.com",
      "issuer": "feathers",
      "algorithm": "HS256",
      "expiresIn": "1d"
    }
  }
}
```

<BlockQuote type="info">

`typ` in the `header` options is not a typo, it is part of the [JWT JOSE header specification](https://tools.ietf.org/html/rfc7519#section-5).

</BlockQuote>

Additionally to the above configuration, most [strategies](./strategy.md) will look for their own configuration under the name it was registered. An example can be found in the [local strategy configuration](./local.md#configuration).

## Authentication flows

Below are the flows how the authentication service can be used.

### To _create a new JWT_

For any strategy allowed in `authStrategies`, a user can call `app.service('/authentication').create(data)` or `POST /authentication` with `data` as `{ strategy: name, ...loginData }`. Internally authentication will then

- Call the strategy `.authenticate` method with `data`
- Create a JWT for the entity returned by the strategy
- Return the JWT (`accessToken`) and the additional information from the strategy

For `local` strategy, the user has to be created before doing auth, otherwise, a 401 `NotAuthenticated` error will be sent.

### To _authenticate an external request_

For any HTTP request and strategy allowed in `parseStrategies` or - if not set - `authStrategies` authentication will:

- Call [strategy.parse](./strategy.md#parse-req-res) and set the return value of the first strategy that does not return `null` as `params.authentication`
- Verify `params.authentication` using the [authenticate hook](./hook.md) which calls the strategy `.authenticate` method with `params.authentication` as the data
- Merge the return value of the strategy with `params` (e.g. setting `params.user`)

### To authenticate _your own service request_

For any service that uses the [authenticate hook](./hook.md) called internally you can set `params.authentication` in the service call which will then:

- Verify `params.authentication` using the [authenticate hook](./hook.md) which calls the strategy `.authenticate` method with `params.authentication` as the data
- Merge the return value of the strategy with `params` (e.g. setting `params.user`)

<BlockQuote type="warning">

You can set `params.authentication` for internal requests on the server but usually setting the entity (`params.user` in most cases) if you already have it available should be preferred. This will avoid the overhead of running authentication again if it has already been done.

</BlockQuote>

## AuthenticationService

### constructor(app [, configKey])

`const authService = new AuthenticationService(app, configKey = 'authentication')` initializes a new authentication service with the [Feathers application](../application.md) instance and a `configKey` which is the name of the configuration property to use via [app.get()](../application.md#get-name) (default: `app.get('authentication')`). Upon initialization it will also update the configuration with the [default settings](#configuration).

### authenticate(data, params, ...strategies)

`authService.authenticate(data, params, ...strategies) -> Promise` is the main authentication method and authenticates `data` and `params` against a list of strategies in `strategies`.

`data` _must_ always contain a `strategy` property indicating the name of the strategy. If `data.strategy` is not available or not allowed (included in the `strategies` list) a `NotAuthenticated` error will be thrown. Otherwise the result of [strategy.authenticate()](./strategy.md#authenticate-authentication-params) will be returned.

### create(data, params)

`authService.create(data, params) -> Promise` runs `authService.authenticate` with `data`, `params` and the list of `strategies` from `authStrategies` in the [configuration](#configuration). As with any other [Feathers service](../services.md), this method will be available to clients, e.g. running a `POST /authentication`.

If successful it will create a JWT with the payload taken from [authService.getPayload](#getpayload-authresult-params) and the options from [authService.getTokenOptions](#gettokenoptions-authresult-params). `data` _must_ always contain a valid and allowed `strategy` name. Will emit the [`login` event](#app-on-login).

### remove(id, params)

`authService.remove(id, params) -> Promise` should be called with `id` set to `null` or to the authenticated access token. Will verify `params.authentication` and emit the [`logout` event](#app-on-logout) if successful.

### configuration

`authService.configuration` returns a copy of current value of `app.get(configKey)` (default: `app.get('authentication')`). This is a deep copy of the configuration and is not intended to be modified. In order to change the configuration, [app.set(configKey)](../application.md#set-name-value) should be used:

```ts
const config = app.get('authentication')

// Update configuration with a new entity
app.set('authentication', {
  ...config,
  entity: 'some other entity name'
})
```

### register(name, strategy)

`authService.register(name, strategy)` registers an [authentication strategy](./strategy.md) under `name` and calls the strategy methods `setName`, `setApplication`, `setAuthentication` and `verifyConfiguration` if they are implemented.

### getStrategy(name)

`service.getStrategy(name)` returns the authentication strategy registered under `name`. Usually authentication strategies do not need to be used directly.

### getStrategies(...names)

`service.getStrategies(...names) -> AuthenticationStrategy[]` returns the [authentication strategies](./strategy.md) that exist for a list of names. The returned array may include `undefined` values if the strategy does not exist. Usually authentication strategies do not need to be used directly.

```js
const [localStrategy] = authService.getStrategies('local')
```

### createAccessToken(payload)

`authService.createAccessToken(payload, [options, secret]) -> Promise` creates a new access token. By default it is a [JWT](https://jwt.io/) with `payload`, using [configuration.jwtOptions](#configuration) merged with `options` (optional). It will either use `authService.configuration.secret` or the optional `secret` to sign the JWT. Throws an error if the access token can not be created.

```ts
const token = await app.service('authentication').createAccessToken({
  permission: 'admin'
})
```

<BlockQuote type="warning">

Normally, it is not necessary to call this method directly. Calling [authService.create(data, params)](#create-data-params) using an authentication strategy will take care of creating the correct access token.

</BlockQuote>

### verifyAccessToken(accessToken)

`authService.verifyAccessToken(accessToken, [options, secret]) -> Promise` verifies the access token. By default it will try to verify a JWT using `configuration.jwtOptions` merged with `options` (optional). Will either use `configuration.secret` or the optional `secret` to verify the JWT. Returns the encoded payload or throws an error.

### getTokenOptions(authResult, params)

`authService.getTokenOptions(authResult, params) -> Promise` returns the options for creating a new access token based on the return value from calling [authService.authenticate()](#authenticate-data-params-strategies). Called internally on [authService.create()](#create-data-params). It will try to set the JWT `subject` to the entity (user) id if it is available which will then be used by the [JWT strategy](./jwt.md) to populate `params[entity]` (usually `params.user`).

### getPayload(authResult, params)

`authService.getPayload(authResult, params) -> Promise` returns the access token payload for an authentication result (the return value of [authService.create()](#create-data-params)) and [service call parameters](../services.md#params). Called internally on [.create](#create-data-params). Returns either `params.payload` or an empty object (`{}`).

### parse(req, res, ...strategies)

`authService.parse(req, res, ...strategies) -> Promise` parses a [NodeJS HTTP request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) and [HTTP response](https://nodejs.org/api/http.html#http_class_http_serverresponse) for authentication information using `strategies` calling [each strategies `.parse()` method](./strategy.md#parse-req-res) if it is implemented. Will return the value of the first strategy that didn't return `null`. This does _not_ authenticate the request, it will only return authentication information that can be used by `authService.authenticate` or `authService.create`.

### setup(path, app)

`authService.setup(path, app)` verifies the [configuration](#configuration) and makes sure that

- A `secret` has been set
- If `entity` is not `null`, check if the entity service is available and make sure that either the `entityId` configuration or the `entityService.id` property is set.
- Register internal hooks to send events and keep real-time connections up to date. All custom hooks should be registered at this time.

## app.get('defaultAuthentication')

After registering an authentication service, it will set the `defaultAuthentication` property on the application to its configuration name (`configKey` set in the constructor) if it does not exist. `app.get('defaultAuthentication')` will be used by other parts of Feathers authentication to access the authentication service if it is not otherwise specified. Usually this will be `'authentication'`.

## Customization

The `AuthenticationService` can be customized like any other class:

```ts
import type { Params } from '@feathersjs/feathers'
import type { AuthenticationResult } from '@feathersjs/authentication'
import { AuthenticationService } from '@feathersjs/authentication'

class MyAuthService extends AuthenticationService {
  async getPayload(authResult: AuthenticationResult, params: Params) {
    // Call original `getPayload` first
    const payload = await super.getPayload(authResult, params)
    const { user } = authResult

    if (user && user.permissions) {
      payload.permissions = user.permissions
    }

    return payload
  }
}

app.use('/authentication', new MyAuthService(app))
```

Things to be aware of when extending the authentication service:

- When implementing your own `constructor`, always call `super(app, configKey)`
- When overriding a method, calling `super.method` and working with its return value is recommended unless you are certain your custom method behaves exactly the same way, otherwise things may no longer work as expected.
- When extending `setup`, `super.setup(path, app)` should always be called, otherwise events and real-time connection authentication will no longer work.

## Events

For both, `login` and `logout` the event data is `(authenticationResult, params, context) => {}` as follows:

- `authResult` is the return value of the `authService.create` or `authService.remove` call. It usually contains the user and access token.
- `params` is the service call parameters
- `context` is the service methods [hook context](../hooks.md#hook-context)

### app.on('login')

`app.on('login', (authenticationResult, params, context) => {})` will be sent after a user logs in. This means, after any successful external call to [authService.create](#create-data-params).

<BlockQuote type="warning" label="Important">

The `login` event is also sent for e.g. reconnections of websockets and may not always have a corresponding `logout` event. Use the [`disconnect` event](../channels.md#app-on-disconnect) for handling disconnection.

</BlockQuote>

### app.on('logout')

`app.on('logout', (authenticationResult, params, context) => {})` will be sent after a user explicitly logs out. This means after any successful external call to [authService.remove](#remove-id-params).
