# Local

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-local.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-local)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/authentication-local/CHANGELOG.md)

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

## Configuration

The following settings are available:

- `usernameField`: Name of the username field (e.g. `'email'`)
- `passwordField`: Name of the password field (e.g. `'password'`)
- `hashSize` (default: `10`): The BCrypt salt length
- `errorMessage` (default: `'Invalid login'`): The error message to return on errors
- `entityUsernameField` (default: `usernameField`): Name of the username field on the entity if authentication request data and entity field names are different
- `entityPasswordField` (default: `passwordField`): Name of the password field on the entity if authentication request data and entity field names are different

Standard local authentication can be configured with those options in `config/default.json` like this:

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

> __Important:__ If you want to set the value of `usernameField` to `username` in your configuration file under Windows or running the node process manager `PM2` in Ubuntu/Linux, the value has to be escaped as `\\username` (otherwise the `username` environment variable will be used).

## LocalStrategy

> __Note:__ The methods described in this section are intended for [customization](#customization) purposes and internal calls. They usually do not need to be called directly.

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

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');

class MyLocalStrategy extends LocalStrategy {
  async getEntityQuery(query, params) {
    // Query for user but only include users marked as `active`
    return {
      ...query,
      active: true,
      $limit: 1
    }
  }
}

module.exports = app => {
  const authService = new AuthenticationService(app);

  authService.register('local', new MyLocalStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::: tab "TypeScript"
```typescript
import { Application, Params, Query } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';

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
  const authService = new AuthenticationService(app);

  authService.register('local', new MyLocalStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::::

## Hooks

### hashPassword(field)

The `hashPassword(field [, options])` hook should be used as a `before` hook for `create`, `patch` or `update`. It will replace the plain text `field` on `data` with a hashed password using [LocalStrategy.hashPassword]() before storing it in the database. 

`options` is optional and may contain the following settings:

- `authentication` (default: `app.get('defaultAuthentication')`): The name of the [AuthenticationService](./service.md) the hook should use.
- `strategy` (default: `'local'`): The name of the LocalStrategy to use on the authentication service.

### protect(...fields)

The `protect(...fields)` hook removes fields from the data that is sent to the user by setting [hook.dispatch]().
