---
layout: page
title: Support
description: Look through some of our most frequently asked questions.
permalink: /support/
weight: 5
---

On this page you can find ways to get help, a list of Feathers related questions that came up before and the changelog and license. Make sure to also head over to the [Express FAQ](http://expressjs.com/faq.html). As already mentioned, since Feathers directly extends Express, everything there applies to Feathers as well.

## Getting help

If you have any questions, feel free to post them on our [Gitter channel](https://gitter.im/feathersjs/feathers), submit them as a [GitHub issue](https://github.com/feathersjs/feathers/issues) or on [Stackoverflow](http://stackoverflow.com) using the [feathersjs](http://stackoverflow.com/questions/tagged/feathersjs) tag. We are also on [Slack](https://feathersjs.slack.com/) and on IRC in the [#feathersjs](http://webchat.freenode.net/?channels=feathersjs) channel on Freenode.

We are also collecting tutorials and news on Medium in the ["All About FeathersJS"](https://medium.com/all-about-feathersjs) publication.

## FAQ

### Nested routes

Feathers does not provide an ORM so it does not know about associations between your services. Generally services are connected by their resource ids so any nested route can be expressed by query paramters. For example if you have a user service and would like to get all todos (assuming the associated user id is stored in each todo) for that user the url would be `/todos?userId=<userid>`.

You can however add Express style parameters to your routes when you register a service which will then be set in the `params` object in each service call. For example a `/users/:userId/todos` route can be provided like this:

```js
app.use('/users/:userId/todos', {
  find: function(params, calllback) {
    // params.userId == current user id
  },
  create: function(data, params, callback) {
    data.userId = params.userId;
    // store the data
  }
})
```

__Note:__ This route has to be registered _before_ the `/users` service otherwise the `get` route from the user service at `/users` will be matched first.

### Get websocket events from REST calls

Every service emits all events no matter from where it has been called. So even creating a new  Todo internally on the server will send the event out on every socket that should receive it. This is very similar to what [Firebase](http://firebase.io/) does (but for free and open source). For a more detailed comparison and migration guide read [Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee).

You can also listen to events on the server by retrieving the wrapped service object which is an event emitter:

```js
// Retrieve the registered Todo service
var todoService = app.service('todos');
var todoCount = 0;

todoService.on('created', function(todo) {
  // Increment the total number of created todos
  todoCount++;
});
```

### Find where a method call came from

Sometimes you want to allow certain service calls internally (like creating a new user) but not through the REST or websocket API. This can be done by adding the information in a middleware to the `request.feathers` object which will be merged into service call parameters:

```js
app.use(function(req, res, next) {
  req.feathers.external = 'rest';
  next();
});

app.configure(feathers.socketio(function(io) {
  io.use(function(socket, next) {
    // For websockets the feathers object does not exist by default
    if(!socket.feathers) {
      socket.feathers = {};
    }

    socket.feathers.external = 'socketio';
    next();
  });
}));


app.use('/todos', {
  get: function(id, params, callback) {
    if(!params.external) {
      return callback(null, {
        id: id,
        text: 'Do ' + id + '!'
      });
    }
    callback(new Error('External access not allowed'));
  }
});

var todoService = app.service('todos');
// Call .get without the external parameter set to get the result
todoService.get('laundry', {}, function(error, todo) {
  todo.text // -> 'Do laundry!'
});
```

### Add authentication

Generally any authentication mechanism used for Express can also be implemented in Feathers.

Please refer to the [authentication](/learn/authentication/) and [authorization](/learn/authorization) section of the guide and, in more detail, the [feathers-hooks](https://github.com/feathersjs/feathers-hooks) and [feahters-passport](https://github.com/feathersjs/feathers-passport) modules for more information.

### Only send certain events

In almost any larger application not every user is supposed to receive every event through websockets. The [event filtering section](/api/#event-filtering) in the API documentation contains detailed documentation on how to only send events to authorized users.

The following example only dispatches the Todo `updated` event if the authorized user belongs to the same company:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, callback) {
    // Authorize using the /users service
    app.lookup('users').find({
      username: handshake.username,
      password: handshake.password
    }, function(error, user) {
      if(!error || !user) {
        return callback(error, false);
      }

      socket.feathers = {
        user: user
      };

      callback(null, true);
    });
  });
}));

app.use('todos', {
  update: function(id, data, params, callback) {
    // Update
    callback(null, data);
  },

  updated: function(todo, params, callback) {
    // params === handshake.feathers
    if(todo.companyId === params.user.companyId) {
      // Dispatch the todo data to this client
      return callback(null, todo);
    }

    // Call back with a falsy value to prevent dispatching
    callback(null, false);
  }
});
```

### Custom service middleware

Custom Express middleware that only should be run before a specific service can simply be passed to `app.use` before the service object:

```js
app.use('/todos', ensureAuthenticated, logRequest, todoService);
```

Keep in mind that shared authentication (between REST and websockets) should use a service based approach as described in the [authentication section of the guide](/learn/authentication).

### Another Node web framework

We know! Oh God another NodeJS framework! We really didn't want to add another name to the long list of NodeJS web frameworks but also wanted to explore a different approach than any other library we have seen. We strongly believe that data is the core of the web and should be the focus of web applications.

Many web frameworks focus on things like rendering views, defining routes and handling HTTP requests and responses without providing a structure for implementing application logic separate from those secondary concerns. The result - even when using the MVC pattern - are big monolithic controllers where your actual application logic and how it is accessed - usually via HTTP - are all mixed up together.

Feathers services bring two important concepts together that help to separate those concerns from how your application works:

1) A __[service layer](http://martinfowler.com/eaaCatalog/serviceLayer.html)__ which helps to decouple your application logic from how it is being accessed and represented. Besides also making things a lot easier to test - you just call your service methods instead of having to make fake HTTP requests - this is what allows Feathers to provide the same API through both HTTP REST and websockets. It can even be extended to use any other RPC protocol and you won't have to change any of your services.

2) A __[uniform interface](http://en.wikipedia.org/wiki/Representational_state_transfer#Uniform_interface)__ which is one of the key constraints of [REST](http://en.wikipedia.org/wiki/Representational_state_transfer) in which context it is commonly referred to as the different HTTP verbs (GET, POST, PUT, PATCH and DELETE). This translates almost naturally into the Feathers service object interface:

```js
var myService = {
  // GET /path
  find: function(params, callback) {},
  // GET /path/<id>
  get: function(id, params, callback) {},
  // POST /path
  create: function(data, params, callback) {},
  // POST /path/<id>
  update: function(id, data, params, callback) {},
  // PATCH /path/<id>
  patch: function(id, data, params, callback) {},
  // DELETE /patch/<id>
  remove: function(id, params, callback) {}
}
```

This interface also makes it easier to hook into the execution of those methods and emit events when they return which can naturally be used to provide real-time functionality.

### What about Koa?

Koa is a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware. This approach does unfortunately not easily play well with Feathers services so there are no direct plans yet to use it as a future base for Feathers.

There are however definite plans of using ES6 features for Feathers once they make it into `node --harmony`, specifically:

- [Promises](http://www.html5rocks.com/en/tutorials/es6/promises/) instead of callbacks for asynchronous processing
- [ES6 classes](http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes) for defining services.

And a lot of the other syntactic sugar that comes with ES6 like arrow functions etc. If you want to join the discussion, chime in on [Feathers issue #83](https://github.com/feathersjs/feathers/issues/83)

## Changelog

__1.1.1__

- Fix 404 not being properly thrown by REST provider ([#146](https://github.com/feathersjs/feathers/pull/146))

__1.1.0__

- Service `setup` called before `app.io` instantiated ([#131](https://github.com/feathersjs/feathers/issues/131))
- Allow to register services that already are event emitter ([#118](https://github.com/feathersjs/feathers/issues/118))
- Clustering microservices ([#121](https://github.com/feathersjs/feathers/issues/121))
- Add debug module and messages ([#114](https://github.com/feathersjs/feathers/issues/114))
- Server hardening with socket message validation and normalization ([#113](https://github.com/feathersjs/feathers/issues/113))
- Custom service events ([#111](https://github.com/feathersjs/feathers/issues/111))
- Support for registering services dynamically ([#67](https://github.com/feathersjs/feathers/issues/67), [#96](https://github.com/feathersjs/feathers/issues/96), [#107](https://github.com/feathersjs/feathers/issues/107))

__1.0.2__

- Use Uberproto extended instance when creating services ([#105](https://github.com/feathersjs/feathers/pull/105))
- Make sure that mixins are specific to each new app ([#104](https://github.com/feathersjs/feathers/pull/104))

__1.0.1__

- Rename Uberproto .create to avoid conflicts with service method ([#100](https://github.com/feathersjs/feathers/pull/100), [#99](https://github.com/feathersjs/feathers/issues/99))

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

Copyright (C) 2015 [Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
