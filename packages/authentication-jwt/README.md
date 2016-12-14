# feathers-authentication-jwt

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-jwt.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-jwt)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-jwt/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-jwt)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-jwt/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-jwt/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-jwt.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-jwt)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-jwt.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-jwt)

> JWT authentication strategy for feathers-authentication using Passport

## Installation

```
npm install feathers-authentication-jwt --save
```

## Documentation

<!-- Please refer to the [feathers-authentication-jwt documentation](http://docs.feathersjs.com/) for more details. -->

## API

This module contains 3 core pieces:

1. The main entry function
2. The `Verifier` class
3. The [`ExtractJwt`](https://github.com/themikenicholson/passport-jwt#extracting-the-jwt-from-the-request) object from passport-jwt.

### Main Initialization

In most cases initializing the `feathers-authentication-jwt` module is as simple as doing this:

```js
app.configure(authentication(settings));
app.configure(jwt());
```

This will pull from your global `auth` object in your config file. It will also mix in the following defaults, which can be customized.

#### Default Options

```js
{
    name: 'jwt', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that you pull from if an 'id' is present in the payload
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    jwtFromRequest: ExtractJwt.fromHeader, // a passport-jwt option determining where to parse the JWT
    secretOrKey: auth.secret, // Your main secret provided to passport-jwt
    session: false // whether to use sessions,
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional [passport-jwt](https://github.com/themikenicholson/passport-jwt) options can be provided.

### Verifier

This is the verification class that receives the JWT payload (if verification is successful) and either returns the payload or, if an `id` is present in the payload, populates the entity (normally a `user`) and returns both the entity and the payload. It has the following methods that can all be overridden. The `verify` function has the exact same signature as [passport-jwt](https://github.com/themikenicholson/passport-jwt).

```js
{
    constructor(app, options) // the class constructor
    verify(req, payload, done) // queries the configured service
}
```

#### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import jwt, { Verifier } from 'feathers-authentication-jwt';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and 
  // return values as a vanilla passport strategy
  verify(req, payload, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    done(null, payload);
  }
}

app.configure(jwt({ Verifier: CustomVerifier }));
```

### ExtractJwt

This is a collection of functions provided by [passport-jwt](https://github.com/themikenicholson/passport-jwt) that allow you to parse the JWT from anywhere. By default the `header` field from when you initialize `feathers-authentication` is used. However you can customize to pull from whatever you like.

```js
// Example of pulling from the body instead
import jwt, { ExtractJwt } from 'feathers-authentication-jwt';

app.configure(jwt({ jwtFromRequest: ExtractJwt.fromBodyField('accessToken') }));
```

## Expected Request Data
By default, this strategy expects a payload in this format:

```js
{
  strategy: 'jwt',
  accessToken: '<token>'
}
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-jwt`. You can see a fully working example in the [example/](./example/) directory.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(jwt())
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
