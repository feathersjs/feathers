# feathers-authentication-client

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-client.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-client)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-client/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-client)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-client/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-client/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-client.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-client)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-client.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-client)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> The authentication plugin for feathers-client

## Installation

```
npm install feathers-authentication-client --save
```

## Documentation

<!-- Please refer to the [feathers-authentication-client documentation](http://docs.feathersjs.com/) for more details. -->

## API

This module contains:

1. The main entry function
2. Some helpful hooks

The main feathers client instance has a few public methods:

- `app.authenticate(options)` - Authenticate by passing credentials.
- `app.logout()`

It also has a `app.passport` instance that, like on the server, exposes utils functions for dealing with JWTs:

- `app.passport.getJWT()` - pull it from localstorage or the cookie
- `app.passport.verifyJWT(token)` - verify that a JWT is not expired and decode it to get the payload.

**Note:** All these methods return promises.

### Default Options

The following default options will be mixed in with the settings you pass in when configuring authentication. It will set the mixed options back to to the app so that they are available at any time by `app.get('auth')`. They can all be overridden.

```js
{
  header: 'authorization', // the default authorization header
  path: '/authentication', // the server side authentication service path
  entity: 'user', // the entity you are authenticating (ie. a users)
  service: 'users', // the service to look up the entity
  cookie: 'feathers-jwt', // the name of the cookie to parse the JWT from when cookies are enabled server side
  storageKey: 'feathers-jwt', // the key to store the accessToken in localstorage or AsyncStorage on React Native
}
```

### Hooks

There are 3 hooks. They are really meant for internal use and you shouldn't need to worry about them very often.

1. `populateAccessToken` - Takes the token and puts in on `hooks.params.accessToken` in case you need it in one of your client side services or hooks
2. `populateHeader` - Add the accessToken to the authorization header
3. `populateEntity` - Experimental. Populate an entity based on the JWT payload.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-client`. 

```js
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const hooks = require('feathers-hooks');
const localStorage = require('localstorage-memory');
const auth = require('feathers-authentication-client');

const client = feathers();

client.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({ storage: localStorage }));

client.authenticate({
  strategy: 'local',
  email: 'admin@feathersjs.com',
  password: 'admin'
})
.then(response => {
  console.log('Authenticated!', response);
  return client.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  console.log('JWT Payload', payload);
  return client.service('users').get(payload.id);
})
.then(user => {
  client.set('user', user);
  console.log('User', client.get('user'));
})
.catch(function(error){
  console.error('Error authenticating!', error);
});
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
