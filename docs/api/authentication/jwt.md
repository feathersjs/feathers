# JWT

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/authentication/CHANGELOG.md)

```
npm install @feathersjs/authentication --save
```

The `JWTStrategy` is an [authentication strategy](./strategy.md) included in `@feathersjs/authentication` for authenticating JSON web token service methods calls and HTTP requests, e.g.

```json
{
  "strategy": "jwt",
  "accessToken": "<your JWT>"
}
```

## Options

- `header` (default: `'Authorization'`): The HTTP header containing the JWT
- `schemes` (default: `[ 'Bearer', 'JWT' ]`): An array of schemes to support

The default settings support passing the JWT through the following HTTP headers:

```
Authorization: <your JWT>
Authorization: Bearer <your JWT>
Authorization: JWT <your JWT>
```

Standard JWT authentication can be configured with those options in `config/default.json` like this:

```json
{
  "authentication": {
    "jwtOptions": {}
  }
}
```

> __Note:__ Since the default options are what most clients expect for JWT authentication they usually don't need to be customized.

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

> __Note:__ Since the JWT strategy returns an `accessToken` property (the same as the token sent to this strategy), that access token will also be returned by [authenticationService.create](./service.md#create-data-params) instead of creating a new one.

### getEntityQuery(params)

Returns the `query` to use when calling `entityService.get` (default: `{}`). 

### parse(req, res)

Parse the HTTP request headers for JWT authentication information. Returns a promise that resolves with either `null` or data in the form of:

```js
{
  strategy: '<strategy name>',
  accessToken: '<access token from HTTP header>'
}
```

## Customization

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');

class MyJwtStrategy extends JWTStrategy {
}

module.exports = app => {
  const authService = new AuthenticationService(app);

  authService.register('jwt', new MyJwtStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::: tab "TypeScript"
```typescript
import { Application } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';

class MyJwtStrategy extends JWTStrategy {
}

export default (app: Application) => {
  const authService = new AuthenticationService(app);

  authService.register('jwt', new MyJwtStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::::
