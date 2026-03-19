# Feathers Client

One of the most notable features of Feathers is that it can also be used as the client. In contrast with most other frameworks, it isn't a separate library; instead you get the exact same functionality with a client and on a server. This means you can use [services](./services) and [hooks](./hooks) and configure plugins. By default, a Feathers client automatically creates services that talk to a Feathers server.

In order to connect to a Feathers server, a client creates [Services](./services) that use [HTTP](./client/http) to relay method calls and allow listening to real-time [events](./events) via [Server-Sent Events (SSE)](./client/sse). This means the [Feathers application instance](./application) is usable the exact same way as on the server.

::warning[Important]
You do not have to use Feathers on the client to connect to a Feathers server. See the [HTTP API](./client/http#http-api) section for how to use a direct HTTP connection without Feathers on the client side.
::

This chapter describes how to set up Feathers as the client in Node, React Native and in the browser with a module loader like Webpack or Parcel.

## Typed client

A Feathers application generated with Feathers v5 or later now exports a client file, including the types you defined in [schemas](./schema/index) on the server. For more information see the [CLI guide](../guides/cli/client)

## Node

To connect to a Feathers server in NodeJS, install the Feathers core library:

```
npm install feathers --save
```

Then initialize like this:

```ts
import { feathers } from 'feathers'
import { fetchClient } from 'feathers/client'

const app = feathers()

app.configure(fetchClient(fetch, {
  baseUrl: 'http://api.my-feathers-server.com',
  sse: 'sse'
}))

await app.setup()

const messageService = app.service('messages')

messageService.on('created', (message: Message) => console.log('Created a message', message))

// Use the messages service from the server
messageService.create({
  text: 'Message from client'
})
```

## React Native

React Native usage is the same as for the [Node client](#node). Install the required packages into your [React Native](https://facebook.github.io/react-native/) project.

```bash
npm install feathers
```

Then in the main application file:

```ts
import { feathers } from 'feathers'
import { fetchClient } from 'feathers/client'

const app = feathers()

app.configure(fetchClient(fetch, {
  baseUrl: 'http://api.my-feathers-server.com',
  sse: 'sse'
}))

await app.setup()

const messageService = app.service('messages')

messageService.on('created', (message: Message) => console.log('Created a message', message))

// Use the messages service from the server
messageService.create({
  text: 'Message from client'
})
```

## Module loaders

Feathers client libraries work with the out-of-the-box configuration of all modern module loaders like Webpack, Parcel, Vite etc.
