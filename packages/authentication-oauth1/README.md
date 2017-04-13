# feathers-authentication-oauth1

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-authentication-oauth1.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-oauth1.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-oauth1)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-oauth1/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-oauth1.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-oauth1)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-oauth1.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-oauth1)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> A Feathers OAuth1 authentication strategy

## Installation

```
npm install feathers-authentication-oauth1 --save
```

**Note:** This is only compatibile with `feathers-authentication@1.x` and above.

## Documentation

Please refer to the [feathers-authentication-oauth1 documentation](http://docs.feathersjs.com/) for more details.

## Supported Strategies

There aren't a ton of OAuth1 strategies anymore as most have moved to OAuth2, however this will work for any [Passport OAuth1 strategy](http://passportjs.org/). Most notably [Twitter](https://github.com/jaredhanson/passport-twitter).

## API

This module contains 2 core pieces:

1. The main entry function
2. The `Verifier` class

### Main Initialization

In most cases initializing the `feathers-authentication-oauth1` module is as simple as doing this:

```js
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;
app.use(session({ secret: 'super secret', resave: true, saveUninitialized: true }));
app.configure(authentication(settings));
app.configure(oauth1({
  name: 'twitter',
  Strategy: TwitterStrategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>'
}));
```

This will set up session middleware and authentication pulling from your global `auth` object in your config file. It will also mix in the following defaults, which can be customized.

#### Default Options

```js
{
    idField: '<provider>Id', // The field to look up the entity by when logging in with the provider. Defaults to '<provider>Id' (ie. 'twitterId').
    path: '/auth/<provider>', // The route to register the middleware
    callbackPath: '/auth/<provider>/callback', // The route to register the callback handler
    callbackURL: 'http(s)://hostame[:port]/auth/<provider>/callback', // The callback url. Will automatically take into account your host and port and whether you are in production based on your app environment to construct the url. (ie. in development http://localhost:3030/auth/twitter/callback)
    entity: 'user', // the entity that you are looking up
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: true // whether to use sessions,
    handler: function, // Express middleware for handling the oauth callback. Defaults to the built in middleware.
    formatter: function, // The response formatter. Defaults the the built in feathers-rest formatter, which returns JSON.
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional passport strategy options can be provided based on the OAuth1 strategy you are configuring.

### Verifier

This is the verification class that handles the OAuth1 verification by looking up the entity (normally a `user`) on a given service and either creates or updates the entity and returns them. It has the following methods that can all be overridden. All methods return a promise except `verify`, which has the exact same signature as [passport-oauth1](https://github.com/jaredhanson/passport-oauth1).

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
import oauth1, { Verifier } from 'feathers-authentication-oauth1';

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

app.configure(oauth1({
  name: 'twitter'
  Strategy: TwitterStrategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>',
  Verifier: CustomVerifier
}));
```

## Customizing The OAuth Response

Whenever you authenticate with an OAuth1 provider such as Twitter, the provider sends back an `accessToken`, `refreshToken`, and a `profile` that contains the authenticated entity's information based on the OAuth1 `scopes` you have requested and been granted.

By default the `Verifier` takes everything returned by the provider and attaches it to the `entity` (ie. the user object) under the provider name. You will likely want to customize the data that is returned. This can be done by adding a `before` hook to both the `update` and `create` service methods on your `entity`'s service.

```js
app.configure(oauth1({
  name: 'twitter',
  entity: 'user',
  service: 'users',
  Strategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>'
}));

function customizeTwitterProfile() {
  return function(hook) {
    console.log('Customizing Twitter Profile');
    // If there is a twitter field they signed up or
    // signed in with twitter so let's pull the email. If
    if (hook.data.twitter) {
      hook.data.email = hook.data.twitter.email; 
    }

    // If you want to do something whenever any OAuth
    // provider authentication occurs you can do this.
    if (hook.params.oauth) {
      // do something for all OAuth providers
    }

    if (hook.params.oauth.provider === 'twitter') {
      // do something specific to the twitter provider
    }

    return Promise.resolve(hook);
  };
}


app.service('users').hooks({
  before: {
    create: [customizeTwitterProfile()],
    update: [customizeTwitterProfile()]
  }
});
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-oauth1`. You can see a fully working example in the [example/](./example/) directory.

**Note:** You must setup some session middleware. OAuth1 strategies rely on sessions in order to authenticate.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const oauth1 = require('feathers-authentication-oauth1');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // set up session support. This is required for OAuth1 strategies
  .use(session({ secret: 'super secret', resave: true, saveUninitialized: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(oauth1({
    name: 'twitter',
    Strategy: TwitterStrategy,
    consumerKey: '<your consumer key>',
    consumerSecret: '<your consumer secret>'
  }))
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
