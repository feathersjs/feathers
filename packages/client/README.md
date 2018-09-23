# @feathersjs/client

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/client.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/client.png?branch=master)](https://travis-ci.org/feathersjs/client)
[![Dependency Status](https://img.shields.io/david/feathersjs/client.svg?style=flat-square)](https://david-dm.org/feathersjs/client)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/client)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/feathersjs.svg)](https://saucelabs.com/u/feathersjs)

> A client for Feathers services supporting many different transport libraries.

## About

While Feathers and its modules can be used on the client with an NPM compatible module loader like [Browserify](http://browserify.org/), [Webpack](https://webpack.github.io/) or [StealJS](http://stealjs.com), `@feathersjs/client` consolidates a standard set of client plugins into a single distributable that can be used standalone in the browser or with other module loaders (like [RequireJS](http://requirejs.org/)) that don't support NPM. The following modules are included:

- [@feathersjs/feathers](https://github.com/feathersjs/feathers) as `feathers` (or the default module export)
- [@feathersjs/errors](https://github.com/feathersjs/errors) as `feathers.errors`
- [@feathersjs/rest-client](https://github.com/feathersjs/rest-client) as `feathers.rest`
- [@feathersjs/socketio-client](https://github.com/feathersjs/socketio-client) as `feathers.socketio`
- [@feathers/primus-client](https://github.com/feathersjs/primus-client) as `feathers.primus`
- [@feathersjs/authentication-client](https://github.com/feathersjs/authentication-client) as `feathers.authentication`

In the browser a client that connects to the local server via websockets can be initialized like this:

```html
<script type="text/javascript" src="//unpkg.com/socket.io-client@1.7.3/dist/socket.io.js"></script>
<script type="text/javascript" src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  var socket = io();
  var client = feathers()
    .configure(feathers.socketio(socket));
  var todoService = client.service('todos');
  
  todoService.on('created', function(todo) {
    console.log('Someone created a todo', todo);
  });
  
  todoService.create({
    description: 'Todo from client'
  });
</script>
```

For the full documentation see [the Feathers documentation](http://docs.feathersjs.com/clients/feathers.html).

## License

Copyright (c) 2018 [Feathers contributors](https://github.com/feathersjs/client/graphs/contributors)

Licensed under the [MIT license](LICENSE).
