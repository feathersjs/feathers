---
outline: deep
---

# JWT Authentication

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/authentication/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/authentication --save
```

The `JWTStrategy` is an [authentication strategy](./strategy.md) included in `@feathersjs/authentication` for authenticating [JSON web tokens (JWT)](https://jwt.io/):

```json
{
  "strategy": "jwt",
  "accessToken": "<your JWT>"
}
```

## Usage

```ts
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())

  app.use('authentication', authentication)
}
```

## Options

Options are set in the [authentication configuration](./service.md#configuration) under the strategy name. Available options are:

- `header` (default: `'Authorization'`): The HTTP header containing the JWT
- `schemes` (default: `[ 'Bearer', 'JWT' ]`): An array of schemes to support

The default settings support passing the JWT through the following HTTP headers:

```
Authorization: <your JWT>
Authorization: Bearer <your JWT>
Authorization: JWT <your JWT>
```

Options are usually set under the registered name via [Feathers configuration](../configuration.md) in `config/default.json` or `config/<environment>.json`:

```json
{
  "authentication": {
    "jwt": {
      "header": "X-Auth"
    }
  }
}
```

<BlockQuote type="warning" label="Important">

Since the default options are what most clients expect for JWT authentication they usually don't need to be customized.

</BlockQuote>

To change the settings for generating and validating a JWT see the [authentication service configuration](./service.md#configuration)

## JwtStrategy

### getEntity(id, params)

`jwtStrategy.getEntity(id, params)` returns the entity instance for `id`, usually `entityService.get(id, params)`. It will _not_ be called if `entity` in the [authentication configuration](./service.md#configuration) is set to `null`.

### authenticate(data, params)

`jwtStrategy.authenticate(data, params)` will try to verify `data.accessToken` by calling the strategies [authenticationService.verifyAccessToken](./service.md).

Returns a promise that resolves with the following format:

```js
{
  [entity],
  accessToken,
  authentication: {
    strategy: 'jwt',
    payload
  }
}
```

<BlockQuote type="warning" label="Important">

Since the JWT strategy returns an `accessToken` property (the same as the token sent to this strategy), that access token will also be returned by [authenticationService.create](./service.md#create-data-params) instead of creating a new one.

</BlockQuote>

### getEntityQuery(params)

Returns the `query` to use when calling `entityService.get` (default: `{}`).

### parse(req, res)

Parse the HTTP request headers for JWT authentication information. By default in the `Authorization` header. Returns a promise that resolves with either `null` or data in the form of:

```js
{
  strategy: '<strategy name>',
  accessToken: '<access token from HTTP header>'
}
```

## Customization

```ts
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

class MyJwtStrategy extends JWTStrategy {
  // Only allow authenticating activated users
  async getEntityQuery(params: Params) {
    return {
      active: true
    }
  }
}

export default (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new MyJwtStrategy())

  // ...
  app.use('authentication', authentication)
}
```
