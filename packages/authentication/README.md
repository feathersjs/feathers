# feathers-authentication

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication)

> Add Authentication to your FeathersJS app.

`feathers-authentication` adds shared [PassportJS](http://passportjs.org/) authentication for Feathers HTTP REST and WebSockets services using [JSON Web Tokens](http://jwt.io/).


## Installation

```
npm install feathers-authentication --save
```

## Documentation

Please refer to the [Authentication documentation](http://docs.feathersjs.com/authentication/readme.html) for more details:

- [Local Auth Tutorial](http://docs.feathersjs.com/authentication/local.html) - How to implement a username and password-based authentication.
- [Use Hooks for Authorization](http://docs.feathersjs.com/authorization/readme.html) - Learn about the bundled hooks.


## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication` for local auth.  It includes a `users` service that uses `feathers-mongoose`.  *Note that it does NOT implement any authorization.*

```js
/* * * Import Feathers and Plugins * * */
var feathers = require('feathers');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');
var feathersAuth = require('feathers-authentication').default;
var authHooks = require('feathers-authentication').hooks;

/* * * Prepare the Mongoose service * * */
var mongooseService = require('feathers-mongoose');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true },
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});
var UserModel = mongoose.model('User', UserSchema);

/* * * Connect the MongoDB Server * * */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

/* * * Initialize the App and Plugins * * */
var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  // Configure feathers-authentication
  .configure(feathersAuth({
    secret: 'feathers-rocks'
  }));

/* * * Setup the User Service and hashPassword Hook * * */
app.use('/api/users', new mongooseService('user', UserModel))
var service = app.service('/api/users');
service.before({
  create: [authHooks.hashPassword('password')]
});

/* * * Start the Server * * */
var port = 3030;
var server = app.listen(port);
server.on('listening', function() {
  console.log(`Feathers application started on localhost:3030);
});
```




## Changelog

__0.0.5__

- Initial release

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
