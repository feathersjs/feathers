---
outline: deep
---

# Local Authentication

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-local.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-local)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/authentication-local/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/authentication-local --save
```

`@feathersjs/authentication-local` provides a `LocalStrategy` for authenticating with a username/email and password combination, e.g.

```json
{
  "strategy": "local",
  "email": "hello@feathersjs.com",
  "password": "supersecret"
}
```

## Usage

```ts
import { AuthenticationService } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
}
```

## Options

Options are set in the [authentication configuration](./service.md#configuration) under the strategy name. Available options are:

- `usernameField`: Name of the username field (e.g. `'email'`), may be a nested property (e.g. `'auth.email'`)
- `passwordField`: Name of the password field (e.g. `'password'`), may be a nested property (e.g. `'auth.password'`)
- `hashSize` (default: `10`): The BCrypt salt length
- `errorMessage` (default: `'Invalid login'`): The error message to return on errors
- `entityUsernameField` (default: `usernameField`): Name of the username field on the entity if authentication request data and entity field names are different
- `entityPasswordField` (default: `passwordField`): Name of the password field on the entity if authentication request data and entity field names are different

Options are usually set under the registered name via [Feathers configuration](../configuration.md) in `config/default.json` or `config/<environment>.json`:

```json
{
  "authentication": {
    "local": {
      "usernameField": "email",
      "passwordField": "password"
    }
  }
}
```

## LocalStrategy

<BlockQuote type="info" label="Note">

The methods described in this section are intended for [customization](#customization) purposes and internal calls. They usually do not need to be called directly.

</BlockQuote>

### getEntityQuery(query, params)

`localStrategy.getEntityQuery(query, params) -> Promise` returns the query for finding the entity. `query` includes the `usernameField` or `entityUsernameField` as `{ [field]: username }` and by default returns a promise that resolves with `{ $limit: 1 }` combined with `query`.

### findEntity(username, params)

`localStrategy.findEntity(username, params) -> Promise` return the entity for a given username and service call parameters. It will use the query returned by `getEntityQuery` and call `.find` on the entity (usually `/users`) service. It will return a promise that resolves with the first result of the `.find` call or throw an error if nothing was found.

### getEntity(entity, params)

`localStrategy.getEntity(authResult, params) -> Promise` returns the external representation for `entity` that will be sent back to the client.

### hashPassword(password)

`localStrategy.hashPassword(password) -> Promise` creates a safe one-way hash of the given plain `password` string. By default [bCryptJS](https://www.npmjs.com/package/bcryptjs) is used.

### comparePassword(entity, password)

`localStrategy.comparePassword(entity, password) -> Promise` compares a plain text `password` with the hashed password of the `entity` returned by `findEntity`. Returns the `entity` or throws an error if the passwords don't match.

### authenticate(authentication, params)

`localStrategy.authenticate(authentication, params)` is the main endpoint implemented by any [authentication strategy](./strategy.md). It is usually called for authentication requests for this strategy by the [AuthenticationService](./service.md).

## Customization

The `LocalStrategy` can be customized like any ES6 class and then registered on the [AuthenticationService](./service.md):

```ts
import type { Application, Params, Query } from '@feathersjs/feathers'
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'

class MyLocalStrategy extends LocalStrategy {
  async getEntityQuery(query: Query, params: Params) {
    // Query for use but only include `active` users
    return {
      ...query,
      active: true,
      $limit: 1
    }
  }
}

export default (app: Application) => {
  const authService = new AuthenticationService(app)

  authService.register('local', new MyLocalStrategy())

  // ...
  app.use('/authentication', authService)
}
```

## Helpers

### Protecting fields

As of Feathers v5, external [resolvers](../schema/resolvers.md) using the `schemaHooks.resolveExternal` hook are the preferred method to hide or change fields for external requests. The following will always hide the user password for external responses and events:

```ts
import { resolve, schemaHooks } from '@feathersjs/schema'

export const userExternalResolver = resolve<User, HookContext>({
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
})

app.service('users').hooks({
  after: {
    all: [schemaHooks.resolveExternal(userExternalResolver)]
  }
})
```

### passwordHash

The `passwordHash` utility provides a [property resolver function](../schema/resolvers.md#property-resolvers) that uses a local strategy to securely [hash the password](#hashpassword-password) before storing it in the database. The following options are available:

- `strategy` - The name of the local strategy (usually `'local'`)
- `service` - The path of the authentication service (will use `app.get('defaultAuthentication')` by default)

```ts
export const userDataResolver = resolve<User, HookContext>({
  properties: {
    password: passwordHash({ strategy: 'local' })
  }
})
```

### hashPassword(field)

The `hashPassword` hook is provided for Feathers v4 backwards compatibility but **has been deprecated** in favour of the [passwordHash resolver](#passwordhash).

### protect(...fields)

The `protect` hook is provided for Feathers v4 backwards compatibility but **has been deprecated** in favour of [external data resolvers](../schema/resolvers.md).
