# Feathers Passport-JWT

[![Build Status](https://travis-ci.org/feathersjs/feathers-passport-jwt.png?branch=master)](https://travis-ci.org/feathersjs/feathers-passport-jwt)

feathers-passport-jwt adds shared [PassportJS](http://passportjs.org/) authentication for Feathers HTTP REST and websockets services using [JSON Web Tokens](http://jwt.io/).

## Usage
If you are using the default options, setting up JWT auth for your Feathers app is as simple as the below example.  Note: You must set up the `body-parser` module before setting up `feathers-passport-jwt`.
```js
var feathers = require('feathers');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');
var feathersPassportJwt = require('feathers-passport-jwt');
var mongooseService = require('feathers-mongoose');

var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-passport-jwt
  .configure(feathersPassportJwt({
    secret: 'feathers-rocks'
  }))
  .use('/api/users', mongooseService({
    schema: {
      email: {type: String, required: true, unique: true },
      password: {type: String, required: true },
      admin: {type: Boolean, default: false }
    },
    before:{
      create: [feathersPassportJwt.hashPassword('password')]
    }
  }))
```

### REST Requests
Authenticated REST requests must have an `Authorization` header in the format `'Bearer <token>'`, where the <token> is the JWT token. For example:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklseWEgRmFkZWV2IiwiYWRtaW4iOnRydWV9.YiG9JdVVm6Pvpqj8jDT5bMxsm0gwoQTOaZOLI-QfSNc
```

### Websocket Connections
In order to authenticate a Websocket connection, you must first obtain a token using an Ajax request to your `loginEndpoint`.  You then include that token in the request.  The example below is for Socket.io, but the same `query` key can be passed to Primus.

```js
socket = io('', {
    // Assuming you've already saved a token to localStorage.
    query: 'token=' + localStorage.getItem('featherstoken'),
    transports: ['websocket'], // optional, see below
    forceNew:true,             // optional, see below
});
```

In the above example, the `transports` key is only needed if you for some reason need to force the browser to only use websockets.  The `forceNew` key is only needed if you have previously connected an *unauthenticated* Websocket connection and you now want to start an authenticated request.

## Options

The following options are available:

- __secret__ *required* - The secret used to create encrypted tokens.
- __userEndpoint__ - The api endpoint used to look up the user service. The default is `'/api/users`.
- __loginEndpoint__ - The url for posting the username and password during login. The default is `/api/login`.
- __usernameField__ The database field containing the username on the user service.  The default is `username`.
- __passwordField__ The database field containing the password on the user service.  The default is `password`.
- __loginError__ - The message to return for invalid login.  Default is 'Invalid login.'
- __jwtOptions__ - Used to customize the configuration for the jsonwebtoken library.  [See the API](https://github.com/auth0/node-jsonwebtoken)
- __jwtOptions.expiresIn__ - The number of **seconds** until the token expires.  Default is 36000 (10 hours).
- __strategy__ - Allows you to pass a custom strategy to use for local auth.  The default strategy should fit most projects.
- __passport__ (default: `require('passport')`) - The passport module

## Example

The following shows a commented example for an application using local authentication with a Feathers user service:

```js
var feathers = require('feathers');
var passport = require('passport');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');
var feathersPassportJwt = require('feathers-passport-jwt');
var hashPassword = feathersPassportJwt.hashPassword;

// Initialize the application
var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-passport-jwt
  .configure(feathersPassportJwt({
    secret: 'feathers-rocks'
  }))
  // Initialize a user service
  .use('/api/users', memory())
  // A simple Todos service that we can used for testing
  .use('/todos', {
    get: function(id, params, callback) {
      callback(null, {
        id: id,
        text: 'You have to do ' + id + '!',
        user: params.user
      });
    }
  })
  .use('/', feathers.static(__dirname));

var userService = app.service('/api/users');

// Add a hook to the user service that automatically replaces 
// the password with a hash of the password before saving it.
userService.before({
  create: hashPassword()
});

// Create a user that we can use to log in
userService.create({
  username: 'feathers',
  password: 'secret'
}, {}, function(error, user) {
  console.log('Created default user', user);
});

app.listen(4000);
```

Add a `login.html` with an HTML form that allows to log our user in:

```html
<!DOCTYPE html>
<html>
<head lang="en">
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
  <form action="/login" method="post">
    <div>
      <label>Username:</label>
      <input type="text" name="username"/>
    </div>
    <div>
      <label>Password:</label>
      <input type="password" name="password"/>
    </div>
    <div>
      <input type="submit" value="Log In"/>
    </div>
  </form>
</body>
</html>
```

## Changelog

__1.0.0__

- Initial release

## Author

- [Marshall Thompson](https://github.com/marshallswain)

## License

Copyright (c) 2015 Marshall Thompson

Licensed under the [MIT license](LICENSE).
