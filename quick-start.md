---
layout: page
title: Quick Start
weight: 1
permalink: /quick-start/
anchor: quick-start
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

  <script src="/socket.io/socket.io.js"></script>
  <script type="text/javascript">
    // Connect to SocketIO on the same host
    var socket = io.connect();

    // This lets us log messages and JSON on the page
    var logElement = document.getElementById('log');
    var log = function(message, data) {
      logElement.innerHTML = logElement.innerHTML + '\n'
        + message + '\n' + JSON.stringify(data, null, '  ');
    }

    // Listen to all the service events
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

    // Create a new Todo and then log all Todos from the server
    socket.emit('todos::create', {
      text: 'You have to do something real-time!'
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

will also log `Someone created a new Todo`. This is how you can implement real-time functionality in any web page by using standardized websocket messages instead of having to make up your own.

## Persisting to MongoDB

Our CRUD Todo functionality implemented in the service is very common and doesn't have to be re-done from scratch every time. In fact, this is almost exactly what is being provided already in the [feathers-memory](https://github.com/feathersjs/feathers-memory) module. Luckily we don't have to stop at storing everything in-memory. For the popular NoSQL database [MongoDB](http://mongodb.org) , for example, there already is the [feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) module and if you need more ORM-like functionality through [Mongoose](http://mongoosejs.com/) you can also use [feathers-mongoose](https://github.com/feathersjs/feathers-mongoose).

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

And just like this we have a full REST and real-time Todo API that stores its data into MongoDB in just 16 lines of code! We will continue using MongoDB so we don't need our example `todos.js` service anymore.

## Validation and processing

The next step is validating and processing our data. With the MongoDB service already implemented we have two options to extend its functionality.

### Service Extension

*feathers-mongodb* uses the ES5 inheritance library [Uberproto](https://github.com/daffl/uberproto). This allows us to `extend` the original object returned by the call to `mongodb(options)` and overwrite the existing implementation of `create` to process the Todo data and then pass it to the original (`_super`) method. This way we can also easily add our own methods to the service.

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  create: function(data, params, callback) {
    // We want to make sure that `complete` is always set
    // and also only use the `text` and `complete` properties
    var newData = {
      text: data.text,
      complete: data.complete === 'true' || !!data.complete
    };
    // Call the original method with the new data
    this._super(newData, params, callback);
  },

  // Add another method
  addDefaultTodo: function(callback) {
    this.create({
      text: 'The default todo',
      complete: false
    }, {}, callback);
  }
});
```

### Hooks

Another option is the [feathers-hooks](https://github.com/feathersjs/feathers-hooks) plugin which allows us to add asynchronous hooks before or after a service method call. Hooks work similar to Express middleware. The following example adds a hook that converts our Todo data and makes sure that nobody submits anything that we don't want to put into MongoDB:

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
      complete: oldData.complete === 'true' || !!oldData.complete
    };
    next();
  }
});
```

You might have noticed the call to [.service](/api/#toc9) in `app.service('todos')`. This will basically return the original service object (`todoService` in our case) *but* contain some functionality added by Feathers. Most notably, the returned service object will be an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) that emits `created`, `updated` etc. events.

The *feathers-hooks* plugin also adds a `.before` and `.after` method that allows to add hooks to that service. When you need to access services, *always* use `app.service(name)` and not the original service object otherwise things will not work as expected.

## Authentication

Since Feathers directly extends Express you can use any of its authentication mechanism. [Passport](http://passportjs.org/) is one that is used quite often and also really flexible. Manually setting up shared authentication between websockets and an HTTP REST API can be tricky. This is what the [feathers-passport](https://github.com/feathersjs/feathers-passport) module aims to make easier. The following examples show how to add local authentication that uses a Feathers service for storing and retrieving user information.

### Configuring Passport

The first step is to add the Passport, local strategy and feathers-passport modules to our application. Since we are using MongoDB already we will also use it as the session store through the [connect-mongo](https://github.com/kcbanner/connect-mongo) module:

> `npm install passport passport-local connect-mongo feathers-passport`

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');
var hooks = require('feathers-hooks');

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
  .configure(hooks())
  .configure(feathersPassport(function(result) {
    // MongoStore needs the session function
    var MongoStore = connectMongo(result.createSession);

    result.secret = 'feathers-rocks';
    result.store = new MongoStore({
      db: 'feathers-demo'
    });

    return result;
  }))
  .use(bodyParser.json())
  // Now we also need to parse HTML form submissions
  .use(bodyParser.urlencoded({ extended: true }))
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname));
```

### User storage

Next, we create a MongoDB service for storing user information. It is always a good idea to not store plain text passwords in the database so we add a `.before` hook that salts and then hashes the password when creating a new user. This can be done in the service `.setup` which is called when the application is ready to start up. We also add an `.authenticate` method that we can use to look up a user by username and compare the hashed and salted passwords.

```js
var crypto = require('crypto');
// One-way hashes a string
var hash = function(string, salt) {
  var shasum = crypto.createHash('sha256');
  shasum.update(string + salt);
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

      // Compare the hashed and salted passwords
      if(user.password !== hash(password, user.salt)) {
        return callback(new Error('User password does not match'));
      }

      // If we got to here, we call the callback with the user information
      return callback(null, user);
    });
  },

  setup: function() {
    // Adds the hook during service setup
    this.before({
      // Hash the password before sending it to MongoDB
      create: function(hook, next) {
        // Create a random salt string
        var salt = crypto.randomBytes(128).toString('base64');
        // Change the password to a hashed and salted password
        hook.data.password = hash(hook.data.password, salt);
        // Add the salt to the user data
        hook.data.salt = salt;
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

Now it should be possible to log in with the `feathers` username and `supersecret` password and you will get the logged in user information in every service call in `params.user`.

## Authorization

Authorization is the process of determining after successful authentication if the user is allowed to perform the requested action. This is again where hooks come in handy.

### User authorization

Since *feathers-passport* adds the authenticated user information to the service call parameters we can just check those in the hook and return with an error if the user is not authorized:

```js
app.service('todos').before({
  create: function(hook, next) {
    // We only allow creating todos with an authenticated user
    if(!hook.params.user) {
      return next(new Error('You need to be authenticated'));
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

This is also a good time to talk a little about [filtering events](/api/#event-filtering). It is very likely that you eventually only want to send certain events to specific users instead of everybody. Following up on the group authorization example from above, we might only want to dispatch a `todos created` event to users that are in the admin group. This can be done by adding a `created(data, params, callback)` method to the Todo MongoDB service:

```js
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
}).extend({
  created: function(data, params, callback) {
    // Only dispatch if we have a user and user belongs to the admin group
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



