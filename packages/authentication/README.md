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
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import bodyParser from 'body-parser';
import authentication from 'feathers-authentication';
import { hooks as authHooks } from 'feathers-authentication';
import mongoose from 'mongoose';
import service from 'feathers-mongoose';

const port = 3030;
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true },
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});
let UserModel = mongoose.model('User', UserSchema);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

let app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(authentication());

app.use('/users', new service('user', {Model: UserModel}))

let userService = app.service('users');
userService.before({
  create: [authHooks.hashPassword('password')]
});

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
import authentication from 'feathers-authentication/client';

const socket = io('http://localhost:3030/');
const app = feathers()
  .configure(socketio(socket)) // you could use Primus or REST instead
  .configure(hooks())
  .configure(authentication({ storage: window.localStorage }));

app.authenticate({
  type: 'local',
  'email': 'admin@feathersjs.com',
  'password': 'admin'
}).then(function(result){
  console.log('Authenticated!', result);
}).catch(function(error){
  console.error('Error authenticating!', error);
});
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
