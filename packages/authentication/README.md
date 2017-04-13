# feathers-authentication

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-authentication.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication.png)](https://codeclimate.com/github/feathersjs/feathers-authentication)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Add Authentication to your FeathersJS app.

`feathers-authentication` adds shared [PassportJS](http://passportjs.org/) authentication for Feathers HTTP REST and WebSocket transports using [JSON Web Tokens](http://jwt.io/).


## Installation

```
npm install feathers-authentication@pre --save
```

## Documentation

<!-- Please refer to the [Authentication documentation](http://docs.feathersjs.com/authentication/readme.html) for more details. -->

## API

This module contains:

1. The main entry function
2. A single `authenticate` hook
3. The authentication `service`
4. Socket listeners
5. Express middleware
6. A [Passport](http://passportjs.org/) adapter for Feathers

### Hooks

`feathers-authentication` only includes a single hook. This bundled `authenticate` hook is used to register an array of one or more authentication strategies on a service method.

> **Note:** Most of the time you should be registering this on your `/authentication` service. Without it you can hit the `authentication` service and generate a JWT `accessToken` without authentication (ie. anonymous authentication).

```js
app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local']),
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
});
```

The hooks that were once bundled with this module are now located at [feathers-legacy-authentication-hooks](https://github.com/feathersjs/feathers-legacy-authentication-hooks). They are completely compatible but are deprecated and will not be supported by the core team going forward.


### Express Middleware

Just like hooks there is an `authenticate` middleware. It is used the exact same way you would the regular Passport express middleware.

```js
app.post('/login', auth.express.authenticate('local', { successRedirect: '/app', failureRedirect: '/login' }));
```

These other middleware are included and exposed but typically you don't need to worry about them:

- `emitEvents` - emit `login` and `logout` events
- `exposeCookies` - expose cookies to Feathers so they are available to hooks and services
- `exposeHeaders` - expose headers to Feathers so they are available to hooks and services
- `failureRedirect` - support redirecting on auth failure. Only triggered if `hook.redirect` is set.
- `successRedirect` - support redirecting on auth success. Only triggered if `hook.redirect` is set.
- `setCookie` - support setting the JWT access token in a cookie. Only enabled if cookies are enabled.

### Default Options

The following default options will be mixed in with your global `auth` object from your config file. It will set the mixed options back on to the app so that they are available at any time by calling `app.get('auth')`. They can all be overridden and are depended upon by some of the authentication plugins.

```js
{
  path: '/authentication', // the authentication service path
  header: 'Authorization', // the header to use when using JWT auth
  entity: 'user', // the entity that will be added to the request, socket, and hook.params. (ie. req.user, socket.user, hook.params.user)
  service: 'users', // the service to look up the entity
  passReqToCallback: true, // whether the request object should be passed to the strategies `verify` function
  session: false, // whether to use sessions
  cookie: {
    enabled: false, // whether the cookie should be enabled
    name: 'feathers-jwt', // the cookie name
    httpOnly: false, // whether the cookie should not be available to client side JavaScript
    secure: true // whether cookies should only be available over HTTPS
  },
  jwt: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    subject: 'anonymous', // Typically the entity id associated with the JWT
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256', // the algorithm to use
    expiresIn: '1d' // the access token expiry
  }
}
```

## Complementary Plugins

The following plugins are complementary but entirely optional:

- [feathers-authentication-client](https://github.com/feathersjs/feathers-authentication-client)
- [feathers-authentication-local](https://github.com/feathersjs/feathers-authentication-local)
- [feathers-authentication-jwt](https://github.com/feathersjs/feathers-authentication-jwt)
- [feathers-authentication-oauth1](https://github.com/feathersjs/feathers-authentication-oauth1)
- [feathers-authentication-oauth2](https://github.com/feathersjs/feathers-authentication-oauth2)
- [feathers-permissions](https://github.com/feathersjs/feathers-permissions)

## Migrating to 1.x
Refer to [the migration guide](./docs/migrating.md).

## Complete Example
Here's an example of a Feathers server that uses `feathers-authentication` for local auth. You can try it out on your own machine by running the [example](./example/).

**Note:** This does NOT implement any authorization. Use [feathers-permissions](https://github.com/feathersjs/feathers-permissions) for that.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errors = require('feathers-errors');
const errorHandler = require('feathers-errors/handler');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('feathers-authentication');

const app = feathers();
app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', feathers.static(__dirname + '/public'))
  .use(errorHandler());

app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local'])
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
});

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
  before: {
    find: [
      auth.hooks.authenticate('jwt')
    ],
    create: [
      local.hooks.hashPassword({ passwordField: 'password' })
    ]
  }
});

const port = 3030;
let server = app.listen(port);
server.on('listening', function() {
  console.log(`Feathers application started on localhost:${port}`);
});
```

## Client use

You can use the client in the Browser, in NodeJS and in React Native.

```js
import io from 'socket.io-client';
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import localstorage from 'feathers-localstorage';
import authentication from 'feathers-authentication-client';

const socket = io('http://localhost:3030/');
const app = feathers()
  .configure(socketio(socket)) // you could use Primus or REST instead
  .configure(hooks())
  .configure(authentication({ storage: window.localStorage }));

app.authenticate({
  strategy: 'local',
  email: 'admin@feathersjs.com',
  password: 'admin'
}).then(function(result){
  console.log('Authenticated!', result);
}).catch(function(error){
  console.error('Error authenticating!', error);
});
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
