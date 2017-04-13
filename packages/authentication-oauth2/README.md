# feathers-authentication-oauth2

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-authentication-oauth2.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-oauth2.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-oauth2)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth2/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth2)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth2/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth2/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-oauth2.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-oauth2)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-oauth2.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-oauth2)

> An OAuth2 authentication strategy for feathers-authentication using Passport

## Installation

```
npm install feathers-authentication-oauth2 --save
```

**Note:** This is only compatibile with `feathers-authentication@1.x` and above.

## Documentation

<!-- Please refer to the [feathers-authentication-oauth2 documentation](http://docs.feathersjs.com/) for more details. -->

## Supported Strategies

- [Facebook](https://github.com/jaredhanson/passport-facebook)
- [Instagram](https://github.com/jaredhanson/passport-instagram)
- [Github](https://github.com/jaredhanson/passport-github)
- [Google](https://github.com/jaredhanson/passport-google-oauth2)
- [Spotify](https://github.com/JMPerez/passport-spotify)

and many many more. Any [Passport OAuth2 strategy](http://passportjs.org/) will work.

## API

This module contains 2 core pieces:

1. The main entry function
2. The `Verifier` class

### Main Initialization

In most cases initializing the `feathers-authentication-oauth2` module is as simple as doing this:

```js
const FacebookStrategy = require('passport-facebook').Strategy;
app.configure(authentication(settings));
app.configure(oauth2({
  name: 'facebook',
  Strategy: FacebookStrategy,
  clientID: '<your client id>',
  clientSecret: '<your client secret>',
  scope: ['public_profile', 'email']
}));
```

This will pull from your global `auth` object in your config file. It will also mix in the following defaults, which can be customized.

#### Default Options

```js
{
    idField: '<provider>Id', // The field to look up the entity by when logging in with the provider. Defaults to '<provider>Id' (ie. 'facebookId').
    path: '/auth/<provider>', // The route to register the middleware
    callbackPath: '/auth/<provider>/callback', // The route to register the callback handler
    callbackURL: 'http(s)://hostname[:port]/auth/<provider>/callback', // The callback url. Will automatically take into account your host and port and whether you are in production based on your app environment to construct the url. (ie. in development http://localhost:3030/auth/facebook/callback)
    successRedirect: undefined,
    failureRedirect: undefined,
    entity: 'user', // the entity that you are looking up
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: false // whether to use sessions,
    handler: function, // Express middleware for handling the oauth callback. Defaults to the built in middleware.
    formatter: function, // The response formatter. Defaults the the built in feathers-rest formatter, which returns JSON.
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional passport strategy options can be provided based on the OAuth2 strategy you are configuring.

### Verifier

This is the verification class that handles the OAuth2 verification by looking up the entity (normally a `user`) on a given service and either creates or updates the entity and returns them. It has the following methods that can all be overridden. All methods return a promise except `verify`, which has the exact same signature as [passport-oauth2](https://github.com/jaredhanson/passport-oauth2).

```js
{
    constructor(app, options) // the class constructor
    _updateEntity(entity) // updates an existing entity
    _createEntity(entity) // creates an entity if they didn't exist already
    _normalizeResult(result) // normalizes result from service to account for pagination
    verify(req, accessToken, refreshToken, profile, done) // queries the service and calls the other internal functions.
}
```

#### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import oauth2, { Verifier } from 'feathers-authentication-oauth2';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and
  // return values as a vanilla passport strategy
  verify(req, accessToken, refreshToken, profile, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
      
    // the 'user' variable can be any truthy value
    done(null, user);
  }
}

app.configure(oauth2({
  name: 'facebook'
  Strategy: FacebookStrategy,
  clientID: '<your client id>',
  clientSecret: '<your client secret>',
  scope: ['public_profile', 'email'],
  Verifier: CustomVerifier
}));
```

## Customizing The OAuth Response

Whenever you authenticate with an OAuth2 provider such as Facebook, the provider sends back an `accessToken`, `refreshToken`, and a `profile` that contains the authenticated entity's information based on the OAuth2 `scopes` you have requested and been granted.

By default the `Verifier` takes everything returned by the provider and attaches it to the `entity` (ie. the user object) under the provider name. You will likely want to customize the data that is returned. This can be done by adding a `before` hook to both the `update` and `create` service methods on your `entity`'s service.

```js
app.configure(oauth2({
  name: 'github',
  entity: 'user',
  service: 'users',
  Strategy,
  clientID: 'your client id',
  clientSecret: 'your client secret'
}));

function customizeGithubProfile() {
  return function(hook) {
    console.log('Customizing Github Profile');
    // If there is a github field they signed up or
    // signed in with github so let's pull the email. If
    if (hook.data.github) {
      hook.data.email = hook.data.github.email;
    }

    // If you want to do something whenever any OAuth
    // provider authentication occurs you can do this.
    if (hook.params.oauth) {
      // do something for all OAuth providers
    }

    if (hook.params.oauth.provider === 'github') {
      // do something specific to the github provider
    }

    return Promise.resolve(hook);
  };
}


app.service('users').hooks({
  before: {
    create: [customizeGithubProfile()],
    update: [customizeGithubProfile()]
  }
});
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-oauth2`. You can see a fully working example in the [example/](./example/) directory.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const GithubStrategy = require('passport-github').Strategy;
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const oauth2 = require('feathers-authentication-oauth2');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(oauth2({
    name: 'github',
    Strategy: GithubStrategy,
    clientID: '<your client id>',
    clientSecret: '<your client secret>',
    scope: ['user']
  }))
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
