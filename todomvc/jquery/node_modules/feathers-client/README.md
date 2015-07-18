# feathers-client

[![Build Status](https://travis-ci.org/feathersjs/feathers-client.png?branch=master)](https://travis-ci.org/feathersjs/feathers-client)

> A client for Feathers services supporting many different transport libraries.

## About

`feathers-client` is a small module that lets you use remote Feathers services relying on any of the following libraries:

- REST API
  - [jQuery](https://jquery.com/)
  - [Superagent](http://visionmedia.github.io/superagent/)
  - [request](https://github.com/request/request)
- Websockets (with real-time updates)
  - [Socket.io](http://socket.io/)
  - [Primus](https://github.com/primus/primus)

## Usage

`feathers-client` is used much the same way as you would use Feathers on the server making it seamless to use in other NodeJS applications or in the browser. With NodeJS or Browserify:

> npm install feathers-client

```js
var feathers = require('feathers-client');
```

The `dist/feathers.js` file also provides a UMD version that works with most module loaders or standalone (providing a `feathers` global name).

```html
<script type="text/javascript" src="node_modules/feathers-client/dist/feathers.js"></script>
```

```js
var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.socketio());

var todoService = app.service('todos');

todoService.on('created', function(todo) {
  console.log('Todo created', todo);
});

todoService.create({
  text: 'A todo',
  complete: false
}, function(error, todo) {
  console.log('Success');
});

todoService.find(function(error, todos) {
  console.log('Got the following Todos', todos);
});
```

## REST

Connecting to a Feathers service via the REST API is possible using [jQuery](https://jquery.com/), [request](https://github.com/request/request) or [Superagent](http://visionmedia.github.io/superagent/):

__Important__: REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

### jQuery

jQuery [$.ajax](http://api.jquery.com/jquery.ajax/) needs the API base URL and an instance of jQuery passed to `feathers.jquery`. If no jQuery instance is passed the global `jQuery` will be used.

```js
var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.jquery());
```

### Request

The [request](https://github.com/request/request) object needs to be passed explicitly to `feathers.request`. Using [request.defaults](https://github.com/request/request#convenience-methods) - which creates a new request object - is a great way to set things like default headers or authentication information:

```js
var request = require('request');
var client = request.defaults({
  'auth': {
    'user': 'username',
    'pass': 'password',
    'sendImmediately': false
  }
});

var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.request(client));
```

### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```js
var superagent = require('superagent');
var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.superagent(superagent));
```

## Websockets

Websocket real-time connections can be established via [Socket.io](http://socket.io/) or [Primus](https://github.com/primus/primus). Websocket services emit all events that they receive allowing you to implement real-time functionality.

### Socket.io

#### In the browser

Provide either a connected socket or the URL of the websocket endpoint:

```js
var socket = io('http://todos.feathersjs.com');
var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.socketio(socket))
  // or
  .configure(feathers.socketio('http://todos.feathersjs.com'))
```

#### Between NodeJS applications

Websocket connections are also very efficient for real-time communication between different NodeJS servers. First install `socket.io-client`:

> npm install socket.io-client

Then pass the connection just like in the browser:

```js
var io = require('socket.io-client');
var socket = io('http://todos.feathersjs.com');
var app = feathers('http://todos.feathersjs.com')
  .configure(feathers.socketio(socket));
```

### Primus

[Primus](https://github.com/primus/primus) works similar to Socket.io:

```html
<script type="text/javascript" src="node_modules/feathers-client/dist/feathers.js"></script>
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript">
  var primus = new Primus('http://todos.feathersjs.com');
  var app = feathers('http://todos.feathersjs.com')
    .configure(feathers.primus(primus));
</script>
```

## Changelog

__0.1.0__

- Initial release

## Author

- [David Luecke](https://github.com/daffl)

## License

Copyright (c) 2015 David Luecke

Licensed under the [MIT license](LICENSE).
