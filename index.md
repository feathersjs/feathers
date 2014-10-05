---
layout: index
title: Guide
weight: 1
permalink: /
anchor: guide
---

## To get started

Feathers extends [Express 4](http://expressjs.com), one of the most popular web frameworks for [NodeJS](http://nodejs.org/). It makes it easy to create shared RESTful web services and real-time applications using SocketIO and several other NodeJS websocket libraries supported by [Primus](http://primus.io).

If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html) to get an idea. Feathers works the exact same way and supports the same functionality except that `var app = require('express')();` is replaced with `var app = require('feathers')()`. This means that you can literally drop Feathers into your existing Express 4 application and start adding new services right away.

The following guide will walk through creating a basic Todo REST and websocket API with Feathers and MongoDB and also explain how to add authentication and authorization. For additional information also make sure to read through the [API documentation](/api/) and [FAQ](/faq/) later.

To get started with this guide, lets create a new folder and in it run

> `npm install feathers`

## Your first service

The most important concept Feathers adds to Express is that of *services*. Services can be used just like an Express middleware function but instead are JavaScript objects that provide at least one of the following methods:

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

> `node app.js`

You can go to [localhost:3000/todos/dishes](http://localhost:3000/todos/dishes) and should see the following JSON response:

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

> `npm install body-parser`

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


<blockquote><pre>curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "You have to do dishes!" }'</pre></blockquote>

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

To test the connection, we can create an `index.html` file in the same folder. The example page will connect to SocketIO, create a new Todo and also log when any Todo has been created, updated or patched:

```html
<!DOCTYPE HTML>
<html>
<head>
  <title>Feathers SocketIO example</title>
</head>
<body>
  <h1>A Feathers SocketIO example</h1>
  <pre id="log"></pre>

  <script src="http://localhost:3000/socket.io/socket.io.js"></script>
  <script type="text/javascript">
    // Connect to SocketIO on the same host
    var socket = io.connect();
    var logElement = document.getElementBydId('log');
    var log = function(message, data) {
      logElement.innerHTML = logElement.innerHTML + '\n'
        + message + '\n' + JSON.stringify(data, null, '  ');
    }

    socket.on('todos created', function(todo) {
      log('Someone created a new Todo:', todo);
    });

    socket.on('todos updated', function(todo) {
      log('Someone updated a Todo', todo);
    });

    socket.on('todos patched', function(todo) {
      log('Someone patched a Todo', todo);
    });

    socket.on('todos removed', function(todo) {
      log('Someone deleted a Todo', todo);
    });

    socket.emit('todos::create', {
      description: 'You have to do something real-time!'
    }, {}, function(error, todo) {
      log('Created Todo', todo);
      socket.emit('todos::find', {}, function(error, todos) {
        log('Todos from server:', todos);
      });
    });
  </script>
</body>
</html>
```

After restarting, going directly to [localhost:3000](http://localhost:3000) with the console open will show what is happening on the HTML page. You can also see the newly created Todo at the REST endpoint [localhost:3000/todos](http://localhost:3000/todos). With the page open, creating a new  Todo via the REST API, for example

<blockquote><pre>curl 'http://localhost:3000/todos/' -H 'Content-Type: application/json' --data-binary '{ "text": "Do something" }'</pre></blockquote>

will also log `Someone created a new Todo`. This is how you can implement real-time functionality in any web page without a lot of magic using standardized websocket messages instead of having to re-invent your own.

## Persisting to MongoDB

Our CRUD Todo functionality implemented in the service is very common and doesn't have to be implemented from scratch every time. In fact, this is almost exactly what is being provided already in the [feathers-memory](https://github.com/feathersjs/feathers-memory) module. Luckily we don't have to stop at storing everything in-memory. For the popular NoSQL database [MongoDB](http://mongodb.org) , for example, there already is the [feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) module and if you need more ORM-like functionality through [Mongoose](http://mongoosejs.com/) you can also use [feathers-mongoose](https://github.com/feathersjs/feathers-mongoose).

> `npm install feathers-mongodb`

With a MongoDB instance running locally, we can replace our `todoService` in `app.js` with a MongoDB storage on the `feathers-demo` database and the `todos` collection like this:

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

The next important step in is validating and processing our data. With the MongoDB service functionality already implemented we have two options to extend the basic functionality.

### Service Extension

*feathers-mongodb* uses the ES5 inheritance library [Uberproto](https://github.com/daffl/uberproto). This allows us to `extend` the original object returned by the call to `mongodb(options)` and overwrite the existing implementation of `create` to process the Todo data and then pass it to the original method. This way we can also easily add our own functionality to the service.

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

Another option is the [feathers-hooks](https://github.com/feathersjs/feathers-hooks) plugin which allows you to add asynchronous hooks before or after a service method call. Hooks work similar to Express middleware. The following example adds a hook that converts our Todo data and makes sure that nobody submits anything that we don't want to put into MongoDB:

> `npm install feathers-hooks`

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
  // Configure hooks
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
    // Replace the old data by creating a new object
    hook.data = {
      text: oldData.text,
      complete: oldData.complete || oldData.complete === 'true'
    };
    next();
  }
});
```

You might have noticed the call to [.service](/api/#service) in `app.service('todos')`. This will basically return the original service object (`todoService` in our case) *but* contain some functionality added by Feathers. Most notably, the returned service object will be an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) that emits `created`, `updated` etc. events.

The *feathers-hooks* plugin also adds a `.before` and `.after` method that allows you to add hooks to that service. When you need to access services, *always* use `app.service(name)` and not the original service object otherwise things will not work as expected.

## Authentication

Since Feathers directly extends Express you can use any of its authentication mechanism, the one  used quite often being [Passport](http://passportjs.org/). Manually setting up shared authentication between websockets and an HTTP REST API can be tricky. This is what the [feathers-passport](https://github.com/feathersjs/feathers-passport) module aims to make a lot easier. The following examples show how to add local authentication that uses a Feathers service for storing and retrieving user information.

### Configuring Passport

The first step is to add the Passport, local strategy and feathers-passport modules to our application. Since we are using MongoDB already we will also use it as the session store through the [connect-mongo](https://github.com/kcbanner/connect-mongo) module:

> `npm install passport passport-local connect-mongo feathers-passport`

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');

var passport = require('passport');
var connectMongo = require('connect-mongo');
var feathersPassport = require('feathers-passport');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(feathersPassport(function(defaults) {
    // MongoStore needs the session function
    var MongoStore = connectMongo(defaults.createSession);
    return {
      secret: 'feathers-rocks'
      store: new MongoStore({
        db: 'feathers-demo'
      })
    };
  }))
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname));
```

### User storage

Next, we create a MongoDB service for storing user information. It is always a good idea to not store plain text passwords in the database so we add a `.before` hook that SHA1 hashes the password when creating a new user. This can be done in the service `.setup` which is called when the application is ready to start up. We will also add an `.authenticate` method that we can use to look up a user by username and compare the SHA1 hashed passwords.

```js
var crypto = require('crypto');
// SHA1 hashes a string
var sha1 = function(string) {
  var shasum = crypto.createHash('sha1');
  shasum.update(string);
  return shasum.digest('hex');
};

var userService = mongodb({
  db: 'feathers-demo',
  collection: 'users'
}).extend({
  authenticate: function(username, password, callback) {
    // This will be used as the MongoDB query
    var query = {
      username: username
    };

    this.find({ query: query }, function(error, users) {
      if(error) {
        return callback(error);
      }

      var user = users[0];

      if(!user) {
        return callback(new Error('No user found'));
      }

      // Compare the hashed passwords
      if(user.password !== sha1(password)) {
        return callback(new Error('User password does not match'));
      }

      // If we got to here, we call the callback
      // With the user information
      return callback(null, user);
    });
  },

  setup: function() {
    // Adds the hook during service setup
    this.before({
      // SHA1 hash the password before sending it to MongoDB
      create: function(hook, next) {
        hook.data.password = sha1(hook.data.password);
        next();
      }
    });
  }
});

app.use('/users', userService);
```

Now we need to set up Passport to use that service and tell it how to deserialize and serialize our user information. For us, the serialized form is the `_id` generated by MongoDB. To deserialize by `_id` we can simply call the user services `.get` method. Then we add the local strategy which simply calls the `.authenticate` method that we implemented in the user service.

```js
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  // Use the `_id` property to serialize the user
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  // Get the user information from the service
  app.service('users').get(id, {}, done);
});

passport.use(new LocalStrategy(function(username, password, done) {
  app.service('users').authenticate(username, password, done);
}));
```

### Login

The last step is to add the authentication route that we can POST the login to:

```js
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login.html',
    failureFlash: false
}));

app.listen(3000);
```

And to add a `login.html` page:

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

To test the login, we might want to add a new user as well:

<blockquote><pre>curl 'http://localhost:3000/users/' -H 'Content-Type: application/json' --data-binary '{ "username": "feathers", "password": "supersecret" }'</pre></blockquote>

Not it should be possible to log in with the `feathers` username and `supersecret` password.

## Authorization

Authorization is the process of determining after successful authentication if the user is allowed to perform the requested action. This is again where hooks come in very handy.

### User authorization

Since *feathers-passport* adds the authenticated user information to the service call parameters we can just check those in the hook and return with an error if the user is not authorized:

```js
app.service('todos').before({
  create: function(hook, next) {
    // We only allow creating hooks with an authenticated user
    if(!hook.params.user) {
      return next(new Error('User not authenticated'));
    }

    // Check if the user belongs the `admin` group
    var groups = hook.params.user.groups;
    if(groups.indexOf('admin') === -1) {
      // Return with an error if not
      return next(new Error('User is not allowed to create a new Todo'));
    }

    // Otherwise just continue on to the
    // next hook or the service method
    next();
  }
});
```

### Event filtering

This is also a good time to talk a little about [filtering events](/api/#event-filtering). It is very likely that you only want to send certain events to specific users instead of everybody. Following up on the group authorization example from above, we might only want to dispatch a `todos created` event to users that are in the admin group. This can be done by adding a `created(data, params, callback)` method to the Todo MongoDB service:

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  created: function(data, params, callback) {
    if(params.user && params.user.groups.indexOf('admin') !== -1) {
      // Call back with the data we want to dispatch
      return callback(null, data);
    }

    // Call back with falsy value to not dispatch the event
    callback(null, false);
  }
});
```

The `created` method is being called for every connected user with the `params` set in the `request.feathers` object and the data from the event. You can either call back with the original  or modified data (which will then be dispatched to that user) or a falsy value which will prevent the event from being dispatched to that connection.

## What's next?

This guide hopefully gave you an overview of how Feathers works. We created a Todo service and made it available through a REST API and SocketIO. Then we moved to using MongoDB as the backend storage and learned how to process and validate our data. After that we added PassportJS authentication for both, the REST API and websockets and then briefly discussed how you might authorize that authenticated user and make sure that websocket events only get dispatched to where we want them to.

The next step is definitely reading through the [API documentation](/api/) for a more detailed information on how to configure and use certain parts of Feathers. The [FAQ](/faq/) also has some answers to questions that come up regularly. For a growing list of official plugins, have a look at the [Feathersjs GitHub organization](https://github.com/feathersjs).

If you have any other questions, feel free to submit them as a [GitHub issue](https://github.com/feathersjs/feathers/issues) or on [Stackoverflow](http://stackoverflow.com) using the `feathers` or `feathersjs` tag or join [#feathersjs](http://webchat.freenode.net/?channels=feathersjs) on Freenode IRC.


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
