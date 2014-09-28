---
layout: index
title: Guide
weight: 1
permalink: /
anchor: guide
---

## To get started

Feathers is a lightweight web application framework that rides on top of [Express](http://expressjs.com), one of the most popular web frameworks for [NodeJS](http://nodejs.org/). It makes it easy to create RESTful web services and real-time applications using SocketIO and several other NodeJS real-time libraries.

If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html) to get an idea. Feathers works the exact same way except that `var app = require('express')();` is replaced with `var app = require('feathers')()`. This means that you can literally drop Feathers into your existing Express 4.0 application and start adding new services right away. The following guide will walk through creating a basic Todo REST and websocket API with Feathers and MongoDB. For additional information also make sure to read through the [API documentation](/api/).

To get started with this guide, lets create a new folder and in it

> npm install feathers

## Your first service

The most important concept Feathers adds to Express is that of __services__. Services can be used just like an Express middleware function but instead are JavaScript objects that provide at least one of the following methods:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  patch: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app, path) {}
}
```

This object can be registered like `app.use('/my-service', myService)` which - if configured - makes it available as a REST endpoint at `/my-service` and also through websockets. As usual in NodeJS, `callback` has to be called with the error (if any) first and the data as the second parameter.

### Simple Todo

With those methods available we can implement a very basic Todo service that returns a single Todo using the id passed to the `get` method:

```js
// app.js
var feathers = require('feathers');
var app = feathers();
var todoService = {
  get: function(id, params, callback) {
    // Call back with no error and the Todo object
    callback(null, {
      id: id,
      text: 'You have to do ' + id + '!'
    });
  }
};

app.configure(feathers.rest())
  .use('/todos', todoService)
  .listen(3000);
```

After running

> node app.js

You can go to `http://localhost:3000/todos/dishes` and should see the following JSON response:

```js
{
  "id": "dishes",
  "text": "You have to do dishes!"
}
```

### CRUD Todos

As you might have noticed, service methods mainly reflect basic [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) functionality. Following up is a longer example with comments for implementing a complete Todo service that manages all Todos in memory:

```js
// todos.js
module.exports = {
  // The current id counter
  id: 0,
  // An array with all todos
  todos: [],

  // Tries to get a single Todo by its id.
  // Throws an error if none can be found.
  getTodo: function(id) {
    var todos = this.todos;

    for(var i = 0; i < todos.length; i++) {
      if(todos[i].id === parseInt(id, 10)) {
        return todos[i];
      }
    }

    // If we didn't return yet we can throw an error
    throw new Error('Could not find Todo');
  },

  // Return all Todos
  find: function(params, callback) {
    callback(null, this.todos);
  },

  // Returns a single Todo by id
  get: function(id, params, callback) {
    try {
      callback(null, this.getTodo(id));
    } catch(error) {
      callback(error);
    }
  },

  // Create a new Todo
  create: function(data, params, callback) {
    // Increment the global ID counter and
    // use it as the Todos id
    data.id = this.id++;
    this.todos.push(data);
    callback(null, data);
  },

  // Update (replace) an existing Todo with new data
  update: function(id, data, params, callback) {
    try {
      var todo = this.getTodo(id);
      var index = this.todos.indexOf(todo);

      data.id = todo.id;
      // Replace all the data
      this.todos[index] = data;
      callback(null, data);
    } catch(error) {
      callback(error);
    }
  },

  // Extend the data of an existing Todo
  patch: function(id, data, params, callback) {
    try {
      var todo = this.getTodo(id);

      // Extend the existing Todo with the new data
      Object.keys(data).forEach(function(key) {
        if(key !== 'id') {
          todo[key] = data[key];
        }
      });

      callback(null, todo);
    } catch(error) {
      callback(error);
    }
  },

  // Remove an existing Todo by id
  remove: function(id, params, callback) {
    try {
      var todo = this.getTodo(id);
      var index = this.todos.indexOf(todo);

      // Splice it out of our Todo list
      this.todos.splice(index, 1);
      callback(null, todo);
    } catch(error) {
      callback(error);
    }
  }
}
```

The above example exports the service as a module from its own file, `todos.js`. This means that in  `app.js` we can replace the previous `todoService` with loading that module. In order to parse JSON encoded HTTP bodies we additionally need to install and load the Express [body-parser](https://github.com/expressjs/body-parser):

> npm install body-parser

```js
// app.js
var feathers = require('feathers');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = require('./todos');

app.configure(feathers.rest())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .listen(3000);
```

Running `app.js` will now provide a fully functional REST API at `http://localhost:3000/todos`. You can test it, for example, using the [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en) REST client plugin for Google chrome or via CURL:

    curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "You have to do dishes!" }'

## Getting real-time

As previously mentioned, a Feathers service can also be exposed through websockets. You can either use [SocketIO](http://socket.io) or [Primus](https://github.com/primus/primus) - an abstraction layer for differentNode websocket libraries. In the following examples we will use SocketIO.

SocketIO can be enabled by calling `app.configure(feathers.socketio())`. Once set up, it is possible to call service methods by emitting events like `<servicepath>::<methodname>` on the socket and also receive events by listening to `<servicepath> <eventname>` (*eventname* can be `created`, `updated`, `patched` or `removed`). To make it easier to test in a web page, lets also statically host the files in the current folder. `app.js` then looks like this:

```js
// app.js
var feathers = require('feathers');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = require('./todos');

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);
```

To test the connection, we can create an `index.html` file in the same folder. The example will connect to SocketIO, create a new Todo and also log when any Todo has been created, updated or patched:

```html
<!DOCTYPE HTML>
<html>
<head>
  <title>Feathers SocketIO example</title>
</head>
<body>
  <h1>A Feathers SocketIO example</h1>
  <script src="http://localhost:3000/socket.io/socket.io.js"></script>
  <script type="text/javascript">
    // Connect to SocketIO on the same host
    var socket = io.connect();

    socket.on('todos created', function(todo) {
      console.log('Someone created a new Todo', todo);
    });

    socket.on('todos updated', function(todo) {
      console.log('Someone updated a Todo', todo);
    });

    socket.on('todos patched', function(todo) {
      console.log('Someone patched', todo);
    });

    socket.emit('todos::create', {
      description: 'You have to do something real-time!'
    }, {}, function(error, todo) {
      socket.emit('todos::find', {}, function(error, todos) {
        console.log('Todos from server:', todos);
      });
    });
  </script>
</body>
</html>
```

After restarting, going directly to `http://localhost:3000` with the console open will show what is happening. You can also see the newly created Todo at `http://localhost:3000/todos`. Creating a new  Todo via the REST API, for example

> CURL

with the page open at `http://localhost:3000` will also log *Someone created a new Todo*.

## Persisting to MongoDB

Our CRUD Todo functionality implemented in the service is very common and doesn't have to be re-done yourself every time. In fact, this is almost exactly what is being provided for you already in the [feathers-memory](https://github.com/feathersjs/feathers-memory) module. Luckily we don't have to stop at storing everything in-memory. For the popular NoSQL database [MongoDB](http://mongodb.org) for example there already is the [feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) module. If you need more ORM-like functionality, also have a look at [feathers-mongoose](https://github.com/feathersjs/feathers-mongoose).

After installing and loading `feathers-mongodb` and with a MongoDB instance running locally we can replace our `todoService` in `app.js` with a MongoDB storage on the `feathers-demo` database and the `todos` collection like this:

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);
```

And just like this we have a full REST and real-time Todo API that stores its data into MongoDB in just 16 lines of code!

## Validation and processing

With the storage already implemented there are several ways to pre- or postprocess incoming and outgoing data.

### Service Extension

The MongoDB service implementation uses the ES5 inheritance library [Uberproto](https://github.com/daffl/uberproto) so you can just `extend` the service object, process the Todo data and then pass it to the original method or add your own methods:

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  create: function(data, params, callback) {
    // We want to convert possible string in `complete` to
    // an actual boolean and also only use the `text` and
    // `complete` properties
    var newData = {
      text: data.text,
      complete: data.complete || data.complete === 'true'
    };
    // Call the original method with the new data
    this._super(newData, params, callback);
  },

  // Or add other methods
  addDefaultTodo: function(callback) {
    this.create({
      text: 'The default todo',
      complete: false
    }, {}, callback);
  }
});
```

### Hooks

Another option is the [feathers-hooks](https://github.com/feathersjs/feathers-hooks) plugin which allows you to asynchronously hook in before or after a service method executes.

> npm install feathers-hooks

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);

// Get the wrapped todos service object and
// add a `before` create hook modifying the data
app.service('todos').before({
  create: function(hook, next) {
    var oldData = hook.data;
    hook.data = {
      text: oldData.text,
      complete: oldData.complete || oldData.complete === 'true'
    };
    next();
  }
});
```

## Authentication

Since Feathers directly extends Express you can use any of its authentication plugins, the one most commonly used being [Passport](http://passportjs.org/). The following examples first show how to implement a stateless HTTP basic authorization for only the REST API and then a session based authorization that can also be used for SocketIO.

### Stateles basic HTTP

A stateles [username and password](http://passportjs.org/guide/username-password/) HTTP authentication for the REST API using a Feathers user service (with the user information stored in a MongoDB collecion) can look like this:

> npm install passport passport-http

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');
var passport = require('passport');
var BasicStrategy = require('passport-http').Strategy;
var crypto = require('crypto')
// SHA1 hashes a string
var sha1 = function(string) {
  var shasum = crypto.createHash('sha1');
  shasum.update(string);
  return shasum.digest('hex');
};

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});
var userService = mongodb({
  db: 'feathers-demo',
  collection: 'users'
}).extend({
  // Add a method to this service that authenticates a user
  authenticate: function(username, password, callback) {
    this.find({ username: username }, {}, function(error, users) {
      if(error) {
        return callback(error);
      }

      var user = users[0];

      // If we didn't find a user or the hashed password doesn't
      // match we are not authenticated
      if(!user || (user.password !== sha1(users[0].password))) {
        return callback(null, false);
      }

      callback(null, user);
    });
  }
});

passport.use(new BasicStrategy(function(username, password, done) {
  // Look up the user service. Technically the same as the
  // `userService` object but with important Feathers functionality added
  var users = app.service('users');
  // Call the `authenticate` functionality implemented above
  users.authenticate(username, password, done);
});

app.configure(feathers.rest())
  .use(bodyParser.json())
  // Register before the services so they are protected
  .use(passport.authenticate('basic', { session: false }))
  .use('/todos', todoService)
  .use('/users', userService)
  .listen(3000);

// When the application starts, create a new user in the database
app.service('users').create({
  username: 'daffl',
  password: sha1('password')
}, {}, function(error, user) {
  console.log('Created default user', user);
});
```

This will provide a username and password protected, MongoDB persisted API for todos and users. Since it transmits the password in plain text, make sure to always secure the connection with HTTPS in production.

In case you are wondering about authorization (for example we wouldn't want even an authenticated user to be able to see delete or modify other users), we will implement that after the next chapter in which we will set up session based authentication and third party logins (like Facebook, Google or GitHub) .

### Third party logins

Basic HTTP authentication is great for REST-only APIs where we have user information in the database already. In many web applications however, you are more likely to have users enter their username and password on a login page or use third party services like Facebook, Google or Twitter. Upon successful authentication the application sets up a session (so that you don't have to sign in again for every request). This also applies to websocket services since they also use HTTP (and its session) to establish the initial connection.

The first step is - just like in Express - to set up proper session handling. Since we are already using MongoDB we will also use it as the session store.

> npm install cookie-parser express-session connect-mongo

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('connect-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});
var userService = mongodb({
  db: 'feathers-demo',
  collection: 'users'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .use(bodyParser.json())
  // Set up session and passport middleware
  .use(cookieParser())
  .use(session({
    secret: 'feathers-supersecret',
    store: new MongoStore({
      db : 'feathers-demo'
    })
  }))
  .use(passport.initialize())
  .use(passport.session())
  // Set up services
  .use('/todos', todoService)
  .use('/users', userService)
  .listen(3000);
```

## Authorization

Authorization is the process of determining after successful authentication if the authenticated user is allowed to perform the requested action.

## Frontend integration

## What's next?

## Changelog

__[1.0.0](https://github.com/feathersjs/feathers/issues?q=milestone%3A1.0.0)__

- Remove app.lookup and make the functionality available as app.service ([#94](https://github.com/feathersjs/feathers/pull/94))
- Allow not passing parameters in websocket calls ([#92](https://github.com/feathersjs/feathers/pull/91))
- Add _setup method ([#91](https://github.com/feathersjs/feathers/pull/91))
- Throw an error when registering a service after application start ([#78](https://github.com/feathersjs/feathers/pull/78))
- Send socket parameters as params.query ([#72](https://github.com/feathersjs/feathers/pull/72))
- Send HTTP 201 and 204 status codes ([#71](https://github.com/feathersjs/feathers/pull/71))
- Upgrade to SocketIO 1.0 ([#70](https://github.com/feathersjs/feathers/pull/70))
- Upgrade to Express 4.0 ([#55](https://github.com/feathersjs/feathers/pull/55), [#54](https://github.com/feathersjs/feathers/issues/54))
- Allow service methods to return a promise ([#59](https://github.com/feathersjs/feathers/pull/59))
- Allow to register services with custom middleware ([#56](https://github.com/feathersjs/feathers/pull/56))
- REST provider should not be added by default ([#53](https://github.com/feathersjs/feathers/issues/53))

__[0.4.0](https://github.com/feathersjs/feathers/issues?q=milestone%3A0.4.0)__

- Allow socket provider event filtering and params passthrough ([#49](https://github.com/feathersjs/feathers/pull/49), [#50](https://github.com/feathersjs/feathers/pull/50), [#51](https://github.com/feathersjs/feathers/pull/51))
- Added `patch` support ([#47](https://github.com/feathersjs/feathers/pull/47))
- Allow to configure REST handler manually ([#40](https://github.com/feathersjs/feathers/issues/40), [#52](https://github.com/feathersjs/feathers/pull/52))


__0.3.2__

- Allows Feathers to use other Express apps ([#46](https://github.com/feathersjs/feathers/pull/46))
- Updated dependencies and switched to Lodash ([#42](https://github.com/feathersjs/feathers/pull/42))

__0.3.1__

- REST provider refactoring ([#35](https://github.com/feathersjs/feathers/pull/35)) to make it easier to develop plugins
- HTTP requests now return 405 (Method not allowed) when trying to access unavailable service methods ([#35](https://github.com/feathersjs/feathers/pull/35))

__0.3.0__

- Added [Primus](https://github.com/primus/primus) provider ([#34](https://github.com/feathersjs/feathers/pull/34))
- `app.setup(server)` to support HTTPS (and other functionality that requires a custom server) ([#33](https://github.com/feathersjs/feathers/pull/33))
- Removed bad SocketIO configuration ([#19](https://github.com/feathersjs/feathers/issues/19))
- Add .npmignore to not publish .idea folder ([#30](https://github.com/feathersjs/feathers/issues/30))
- Remove middleware: connect.bodyParser() ([#27](https://github.com/feathersjs/feathers/pull/27))

__0.2.0__

- Pre-initialize `req.feathers` in REST provider to set service parameters
- Allowing to initialize services with or without slashes to be more express-compatible

__0.1.0__

- First beta release
- Directly extends Express
- Removed built in services and moved to [Legs](https://github.com/feathersjs/legs)
- Created [example repository](https://github.com/feathersjs/examples)

__0.0.x__

- Initial test alpha releases

## License

Copyright (C) 2014 David Luecke daff@neyeon.com
Copyright (C) 2014 Eric Kryski e.kryski@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
