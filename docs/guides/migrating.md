# Migrating

This guide explains the new features and changes to migrate to the Feathers v4 (Crow) release. It expects applications to be using the previous Feathers v3 (Buzzard).

## Versioning

Instead of separate versioning, all modules in the `@feathersjs` namespace have been updated to use the same version number. This means that the current release (Crow) will be **Feathers v4** and using this release means all `@feathersjs/` module dependencies show a version of `4.x.x` (`4.0.0-pre.x` for prereleases). For historical reasons the first official version will be `4.3.0`.

The [database adapters](../api/databases/adapters.md) will continue to be individually versioned, since they can be used with most Feathers versions from v2 and up.

## Auto upgrade

The `@feathersjs/cli` comes with a command to automatically upgrade applications generated through `@feathersjs/cli` (v3.x) with most of the changes necessary for v4. To update the CLI and upgrade your application run:

```
npm i @feathersjs/cli -g
cd myapp
feathers upgrade
```

This will update the dependencies in `package.json`, update the `src/authentication.js` and `config/default.json` with the new authentication setup. The old contents will be kept in `src/authentication.backup.js` and `config/default.backup.json` but can be removed once upgrade is completed.

__Manual steps are necessary for__

- The `hashPassword()` hook in `service/users/users.hooks.js` which now requires the password field name (usually `hashPassword('password')`)
- Configuring OAuth providers - see [OAuth API](../api/authentication/oauth.md)
- The authentication Express middleware has been moved to `const { authenticate } = require('@feathersjs/express');`
- Any other authentication specific customization - see [authentication service API](../api/authentication/service.md)
- Feathers client authentication - see [authentication client API](../api/authentication/client.md)

## Authentication

The `@feathersjs/authentication-*` modules have been completely rewritten to include more secure defaults, be easier to customize, framework independent and no longer rely on PassportJS. It comes with:

- An extensible [authentication service](../api/authentication/service.md) that can register strategies and create authentication tokens (JWT by default but pluggable for anything else)
- Protocol independent, fully customizable authentication strategies
- Better [OAuth authentication](../api/authentication/oauth.md) with 180+ providers supported out of the box without any additional configuration (other than adding the application key and secret)
- Built-in OAuth account linking and cross-domain OAuth redirects

### Manual upgrade

To upgrade manually, replace the existing authentication configuration (usually `src/authentication.js` or `src/authentication.ts`) with the following:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
```
:::

::: tab "TypeScript"
```typescript
import { Application } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';

export default (app: Application) => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
```
:::

::::

> __Important:__ The `@feathersjs/authentication-jwt` is deprecated since the JWT strategy is now directly included in `@feathersjs/authentication`.

This will register `local`, `jwt` and OAuth authentication strategies using the standard authentication service on the `/authentication` path. OAuth will only be active if provider information is added to the configuration. The authentication configuration (usually in `config/default.json`) should be updated as follows:

```json
"authentication": {
  "entity": "user",
  "service": "users",
  "secret": "<your secret>",
  "authStrategies": [ "jwt", "local" ],
  "jwtOptions": {
    "header": { "typ": "access" },
    "audience": "https://yourdomain.com",
    "issuer": "feathers",
    "algorithm": "HS256",
    "expiresIn": "1d"
  },
  "local": {
    "usernameField": "email",
    "passwordField": "password"
  }
}
```

### Authentication client

The v4 authentication client comes with many usability improvements and more reliable socket (re)connection. Since the server side authentication now includes all necessary information, it is no longer necessary to encode the token and get the user separately.

Instead of

```js
const feathersClient = feathers();

feathersClient.configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({ storage: localStorage }));

feathersClient.authenticate({
  strategy: 'local',
  email: 'admin@feathersjs.com',
  password: 'admin'
})
.then(response => {
  console.log('Authenticated!', response);
  return feathersClient.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  console.log('JWT Payload', payload);
  return feathersClient.service('users').get(payload.userId);
})
.then(user => {
  feathersClient.set('user', user);
  console.log('User', feathersClient.get('user'));
})
.catch(function(error){
  console.error('Error authenticating!', error);
});
```

Can now be done as

```js
const feathersClient = feathers();

feathersClient.configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({ storage: localStorage }));

async function authenticate() {
  try {
    const { user } = await feathersClient.authenticate({
      strategy: 'local',
      email: 'admin@feathersjs.com',
      password: 'admin'
    });
    
    console.log('User authenticated', user);
    
    console.log('Authentication information is', await app.get('authentication'));
  } catch (error) {
    // Authentication failed
    // E.g. show login form
  }
```

The `feathersClient.authenticate()` with no parameters to authenticate with an existing token is still avaiable but should be replaced by the more clear `feathersClient.reAuthenticate()`.

To access the current authentication information, the `app.get('authentication')` promise can be used:

```js
// user is the authenticated user
const { user } = await app.get('authentication');

// As a promise instead of async/await
app.get('authentication').then(authInfo => {
  const { user } = authInfo;
});
```

### Upgrade Notes

Important things to note:

- Because of extensive changes and security improvements, you should change your JWT secret so that all users will be prompted to log in again.
- The `jwt` options have been moved to `jwtOptions`. It takes all [jsonwebtoken options](https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback). The `subject` option __should be removed__ when using the standard setup.
- `authStrategies` are the strategies that are allowed on the `/authentication` endpoint
- The `hashPassword` hook now explicitly requires the name of the field to hash instead of using a default (change any `hashPassword()` to e.g. `hashPassword('password')`).
- For websockets, the `authenticate` event is no longer available. See [Socket.io Authentication direct usage](../api/client/socketio.md#authentication) for more information.

## Feathers core

The following new features and deprecations are included in Feathers v4 core.

### Typescript definitions included

All `@feathersjs` modules now come with up-to-date TypeScript definitions. Any definitions using `@types/feathersjs__*` _should be removed_ from your project.

### Services at the root level

Any Feathers application now allows to register a service at the root level with a name of `/`:

```js
app.use('/', myService);
```

It will be available via `app.service('/')` through the client and directly at `http://feathers-server.com/` via REST.

### Skip event emitting

Service events can now be skipped by setting `context.event` to `null`.

```js
context => {
  // Skip sending event
  context.event = null;
}
```

### `disconnect` event

There is now an application level `disconnect` event when a connection gets disconnect:

```js
app.on('disconnect', connection => {
  // Do something on disconnect here
});
```

> __Note:__ Disconnected connections will be removed from all channels already automatically.

### Deprecated `(context, next)` and SKIP functionality

In preparation to support Koa style hooks (see [feathersjs/feathers#932](https://github.com/feathersjs/feathers/issues/932)) returning `SKIP` and calling the deprecated `next` function in hooks has been removed. Returning `SKIP` in hooks was causing issues because

- It is not easily possible to see if a hook makes its following hooks skip. This made hook chains very hard to debug.
- Returning SKIP also causes problems with Feathers internals like the event system

The use-cases for `feathers.SKIP` can now be explicitly handled by

- [Running hooks conditionally](https://hooks-common.feathersjs.com/hooks.html#iff) through a flag
- [Calling the hook-less service methods](#hook-less-service-methods) of the database adapters
- Setting `context.event = null` to skip event emitting

### `@feathersjs/express`

- `@feathersjs/express/errors` has been moved to `const { errorHandler } = require('@feathersjs/express');`. It is no longer available via `@feathersjs/errors`.
- `@feathersjs/express/not-found` has been moved to `const { notFound } = require('@feathersjs/express');`.

## Database adapters

The latest versions of the Feathers database adapters include some important security and usability updates by requiring to explicitly enable certain functionality that was previously available by default.

> __Important:__ The latest versions of the database adapters also work with previous versions of Feathers. An upgrade of the `@feathersjs/` modules is recommended but not necessary to use the latest database adapter features.

### Querying by id

All database adapters now support additional query parameters for `get`, `remove`, `update` and `patch`. If the record does not match that query, even if the `id` is valid, a `NotFound` error will be thrown. This is very useful for the common case of e.g. restricting requests to the users company the same way as you already would in a `find` method:

```js
// Will throw `NotFound` if `companyId` does not match
// Even if the `id` is available
app.service('/messages').get('<message id>', {
  query: { companyId: '<my company>' }
});
```

### Hook-less service methods

The database adapters now support calling their service methods without any hooks by adding a `_` in front of the method name as `_find`, `_get`, `_create`, `_patch`, `_update` and `_remove`. This can be useful if you need the raw data from the service and don't want to trigger any of its hooks.

```js
// Call `get` without running any hooks
const message = await app.service('/messages')._get('<message id>');
```

> _Note:_ These methods are only available internally on the server, not on the client side and only for the Feathers database adapters. They do *not* send any events.

### Multi updates

Creating, updating or removing multiple records at once has always been part of the Feathers adapter specification but it turned out to be quite easy to miss. 

This means applications could be open to queries that a developer did not anticipate (like deleting or creating multiple records at once). Additionally, it could also lead to unexpected data in a hook that require special cases (like `context.data` or `context.result` being an array).

Now, multiple `create`, `patch` and `remove` calls (with the `id` value set to `null`) are disabled by default and have to be enabled explicitly by setting the `multi` option:

```js
const service = require('feathers-<database>');

// Allow multi create, patch and remove
service({
  multi: true
});

// Only allow create with an array
service({
  multi: [ 'create' ]
});

// Only allow multi patch and remove (with `id` set to `null`)
service({
  multi: [ 'patch', 'remove' ]
});
```

> _Important:_ When enabling multiple remove and patch requests, make sure to restrict the allowed query (e.g. based on the authenticated user id), otherwise it could be possible to delete or patch every record in the database.

### Whitelisting

Some database adapters allowed additional query parameters outside of the official Feathers query syntax. To reduce the risk of allowing malicious queries, only the standard query syntax is now allowed.

Non-standard query parameters (any query property starting with a `$`) will now throw an error. To allow them, they have to be explicitly whitelisted using the `whitelist` option:

```js
const service = require('feathers-<database>');

// Allow to use $regex in query parameters
service({
  whitelist: [ '$regex' ]
});
```

> _Important:_ Be aware of potential security implications of manually whitelisted options. E.g. Enabling Mongoose `$populate` can expose fields that are normally protected at the service level (e.g. a users password) and have to be removed separately.

## Backwards compatibility

The REST authentication flow is still the same and the previous socket authentication mechanism is also still supported. New websocket authentication works the same as authentication via REST.

For security reasons, the authentication secret should be changed so that all current JWTs will become invalid and prompt the users to log in again and issue new valid access tokens. The authentication Feathers clients should be updated since it includes many bug fixes on reconnection issues and usability improvements.

### Old client JWT compatibility

Although upgrading the clients and issuing new tokens is highly recommended, the following setup can be used to provide backwards compatible authentication:

```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');

class MyAuthenticationService extends AuthenticationService {
  async getPayload(authResult, params) {
    // Call original `getPayload` first
    const payload = await super.getPayload(authResult, params);
    const { user } = authResult;

    return {
      ...payload,
      userId: user.id
    };
  }
}

class LegacyJWTStrategy extends JWTStrategy {
  getEntityId(authResult) {
    const { authentication: { payload } } = authResult;

    return payload.userId || payload.sub;
  }
}

module.exports = app => {
  const authentication = new MyAuthenticationService(app);

  authentication.register('jwt', new LegacyJWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
```

### OAuth cookies

To support OAuth for the old authentication client that was using a cookie instead of the redirect to transmit the access token the following middleware can be used:

> __Note:__ This is only necessary if the Feathers authentication client is not updated at the same time and if OAuth is being used.

```js
const authService = new AuthenticationService(app);

authService.register('jwt', new JWTStrategy());
authService.register('local', new LocalStrategy());
authService.register('github', new GitHubStrategy());

app.use('/authentication', authService);
app.get('/oauth/cookie', (req, res) => {
  const { access_token } = req.query;

  if (access_token) {
    res.cookie('feathers-jwt', access_token, {
      httpOnly: false
      // other cookie options here
    });
  }

  res.redirect('/redirect-url');
});

app.configure(expressOauth());
```

Also update `config/default.json` `redirect` with `/oauth/cookie?`:

```json
{
  "authentication": {
    "oauth": {
      "redirect": "/oauth/cookie?"
    }
  }
}
```

### PassportJS

PassportJS is the quasi-standard authentication mechanism for Express applications. Unfortunately it doesn't play very well with other frameworks (which Feathers can easily support otherwise) or real time connections. PassportJS can still be used through its direct Express middleware usage and then passing the authentication information [as service `params`](../api/express.md#params).
