---
outline: deep
---

# Feathers Client

One of the most notable features of Feathers is that it can also be used as the client. In contrast with most other frameworks, it isn't a separate library; instead you get the exact same functionality with a client and on a server. This means you can use [services](./services.md) and [hooks](./hooks.md) and configure plugins. By default, a Feathers client automatically creates services that talk to a Feathers server.

In order to connect to a Feathers server, a client creates [Services](./services.md) that use a REST or websocket connection to relay method calls and allow listening to [events](./events.md) on the server. This means the [Feathers application instance](./application.md) is usable the exact same way as on the server.

Modules most relevant on the client are:

- `@feathersjs/feathers` to initialize a new Feathers [application](./application.md)
- [@feathersjs/rest-client](./client/rest.md) to connect to services through [REST HTTP](./express.md).
- [@feathersjs/socketio-client](./client/socketio.md) to connect to services through [Socket.io](./socketio.md).
- [@feathersjs/authentication-client](./authentication/client.md) to authenticate a client

<BlockQuote type="warning" label="Important">

You do not have to use Feathers on the client to connect to a Feathers server. The client [REST client](./client/rest.md) and [Socket.io client](./client/socketio.md) chapters also describe how to use the connection directly without Feathers on the client side. For details on authentication, see the [Authentication client chapter](./authentication/client.md).

</BlockQuote>

This chapter describes how to set up Feathers as the client in Node, React Native and in the browser with a module loader like Webpack or Browserify or through a `<script>` tag. The examples are using [the Socket.io client](./client/socketio.md). For other connection methods see the chapters linked above.

<BlockQuote type="warning" label="Important">

Feathers can be used on the client through the individual modules or the [@feathersjs/client](#feathersjsclient) module. The latter combines all modules mentioned above into a single file. Use with modules and a loader like Webpack, Parcel etc. is recommended.

</BlockQuote>

## Node

To connect to a Feathers server in NodeJS, install the desired client connection library (here, `socket.io-client`), alongside the Feathers core library, and the connection-specific library:

```
npm install @feathersjs/feathers @feathersjs/socketio-client socket.io-client --save
```

Then initialize like this:

```ts
import io from 'socket.io-client'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'

const socket = io('http://api.my-feathers-server.com')
const client = feathers()

client.configure(socketio(socket))

const messageService = client.service('messages')

messageService.on('created', (message: Message) => console.log('Created a message', message))

// Use the messages service from the server
messageService.create({
  text: 'Message from client'
})
```

## React Native

React Native usage is the same as for the [Node client](#node). Install the required packages into your [React Native](https://facebook.github.io/react-native/) project.

```bash
npm install @feathersjs/feathers @feathersjs/socketio-client socket.io-client
```

Then in the main application file:

```ts
import io from 'socket.io-client'
import { AsyncStorage } from 'react-native'
import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import authentication from '@feathersjs/authentication-client'

const socket = io('http://api.my-feathers-server.com', {
  transports: ['websocket'],
  forceNew: true
})
const client = feathers()

client.configure(socketio(socket))
client.configure(authentication({
  storage: AsyncStorage
}))

const messageService = client.service('messages')

messageService.on('created', (message: Message) => console.log('Created a message', message))

// Use the messages service from the server
messageService.create({
  text: 'Message from client'
})
```

Since React Native for Android doesn't handle timeouts exceeding one minute, consider setting lower values for `pingInterval` and `pingTimeout` of [Socket.io](./socketio.md) **on your server**. This will stop warnings related to this [issue](https://github.com/facebook/react-native/issues/12981). For example:

```js
import socketio from '@feathersjs/socketio'

const app = feathers()

app.configure(socketio({
  pingInterval: 10000,
  pingTimeout: 50000
}))
```

## Module loaders

All modules in the `@feathersjs` namespace are using ES6. They must be transpiled to support browsers that don't completely support ES6. Most client-side module loaders exclude the `node_modules` folder from being transpiled and have to be configured to include modules in the `@feathersjs` namespace.

### Webpack

For Webpack, the recommended `babel-loader` rule normally excludes everything in `node_modules`. It has to be adjusted to skip `node_modules/@feathersjs`. In the `module` `rules` in your `webpack.config.js`, update the `babel-loader` section to this:

```js
{
  test: /\.jsx?$/,
  exclude: /node_modules(\/|\\)(?!(@feathersjs))/,
  loader: 'babel-loader'
}
```

### create-react-app

[create-react-app](https://github.com/facebookincubator/create-react-app) uses [Webpack](#webpack) but does not allow to modify the configuration unless you eject. If you do not want to eject, use the [@feathersjs/client](https://github.com/feathersjs/client) module instead.

```
npm i --save @feathersjs/client
```

You can then import the transpiled libraries from this package:

```js
import feathers from "@feathersjs/client";
```

### Others

As mentioned above, `node_modules/@feathersjs` and all its subfolders must be included in the ES6+ transpilation step when using any module loader that is using a transpiler. For non-CommonJS formats (like AMD) version of Feathers and its client modules you can use the [@feathersjs/client module](#feathersjsclient).

## @feathersjs/client

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/client/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/client --save
```

`@feathersjs/client` is a module that bundles the separate Feathers client-side modules into one file which can be loaded directly in the browser through a `<script>` tag and in most other JavaScript runtimes. 

<BlockQuote type="danger">

If you are using a module loader like Webpack, Parcel etc. and in React Native and Node you **should not use** `@feathersjs/client`. Use the individual client modules instead. See the [REST client](./client/rest.md) and [Socket.io client](./client/socketio.md) chapters for invidual module use. This will give you the most modern builds and reduce bundle size and build/load time.

</BlockQuote>

Here is a table of which Feathers client module is included:

| Feathers module                   | @feathersjs/client      |
|-----------------------------------|-------------------------|
| @feathersjs/feathers              | feathers (default)      |
| @feathersjs/errors                | feathers.errors         |
| @feathersjs/rest-client           | feathers.rest           |
| @feathersjs/socketio-client       | feathers.socketio       |
| @feathersjs/authentication-client | feathers.authentication |


When you are loading `@feathersjs/client` you do not have to install or load any of the other modules listed in the table above.

### When to use

`@feathersjs/client` can be used directly in the browser using a `<script>` tag without a module loader as well as with module loaders that do not support CommonJS (like RequireJS).

If you are using the Feathers client with Node or React Native you should follow the steps described in the [Node](#node) and [React Native](#react-native) sections and __not__ use `@feathersjs/client`.

### Load from CDN with `<script>`

Below is an example of the scripts you would use to load `@feathersjs/client` from [unpkg.com](https://unpkg.com).

```html
<script src="//unpkg.com/@feathersjs/client@^5.0.0/dist/feathers.js"></script>
<script src="//unpkg.com/socket.io-client@^4.0.0/dist/socket.io.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  const socket = io('http://localhost:3030')
  // @feathersjs/client is exposed as the `feathers` global.
  const app = feathers()

  app.configure(feathers.socketio(socket))
  app.configure(feathers.authentication())

  app.service('messages').create({
    text: 'A new message'
  })

  // feathers.errors is an object with all of the custom error types.
</script>
```
