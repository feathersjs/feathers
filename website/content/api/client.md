# Feathers Client

One of the most notable features of Feathers is that it can also be used as the client. In contrast with most other frameworks, it isn't a separate library; instead you get the exact same functionality with a client and on a server. This means you can use [services](./services) and [hooks](./hooks) and configure plugins. By default, a Feathers client automatically creates services that talk to a Feathers server.

In order to connect to a Feathers server, a client creates [Services](./services) that use HTTP to relay method calls and allow listening to real-time [events](./events) via [Server-Sent Events (SSE)](./client/sse). This means the [Feathers application instance](./application) is usable the exact same way as on the server.

Modules most relevant on the client are:

- `feathers` to initialize a new Feathers [application](./application)
- [feathers/client](./client/rest) to connect to services through HTTP using `fetch`
- [SSE](./client/sse) for real-time events via Server-Sent Events
- [@feathersjs/authentication-client](./authentication/client) to authenticate a client

::warning[Important]
You do not have to use Feathers on the client to connect to a Feathers server. The [REST client](./client/rest) chapter also describes how to use a direct HTTP connection without Feathers on the client side.
::

This chapter describes how to set up Feathers as the client in Node, React Native and in the browser with a module loader like Webpack or Parcel or through a `<script>` tag.

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
import { AsyncStorage } from 'react-native'
import authentication from '@feathersjs/authentication-client'

const app = feathers()

app.configure(fetchClient(fetch, {
  baseUrl: 'http://api.my-feathers-server.com',
  sse: 'sse'
}))
app.configure(authentication({
  storage: AsyncStorage
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

### Webpack

No additional setup should be necessary to use the Feathers client modules in a standard configuration with Webpack.

### create-react-app

[create-react-app](https://github.com/facebookincubator/create-react-app) uses [Webpack](#webpack) and also no longer requires additional setup to load the individual Feathers client modules.

### Others

For non-CommonJS formats (like AMD) version of Feathers and its client modules the [@feathersjs/client module](#feathers-client) can be used.

## @feathersjs/client

::badges{npm="@feathersjs/client" changelog="https://github.com/feathersjs/feathers/blob/dove/packages/client/CHANGELOG.md"}
::

```
npm install @feathersjs/client --save
```

`@feathersjs/client` is a module that bundles the separate Feathers client-side modules into one file which can be loaded directly in the browser through a `<script>` tag and in most other JavaScript runtimes.

::danger[Important]
If you are using a module loader like Webpack, Parcel etc., create-react-app and in React Native and Node you **should not use** `@feathersjs/client`. Use the individual client modules instead. This will give you the most modern builds and reduce bundle size and build/load time. See the [REST client](./client/rest) and [SSE client](./client/sse) chapters for individual module use.
::

Here is a table of which Feathers client module is included:

| Feathers module                   | @feathersjs/client      |
| --------------------------------- | ----------------------- |
| @feathersjs/feathers              | feathers (default)      |
| @feathersjs/errors                | feathers.errors         |
| @feathersjs/rest-client           | feathers.rest           |
| @feathersjs/authentication-client | feathers.authentication |

When you are loading `@feathersjs/client` you do not have to install or load any of the other modules listed in the table above.

### When to use

`@feathersjs/client` can be used directly in the browser using a `<script>` tag without a module loader as well as module loaders that do not support CommonJS (like RequireJS).

### Load from CDN with `<script>`

Below is an example of the scripts you would use to load `@feathersjs/client` from [unpkg.com](https://unpkg.com).

```html
<script src="//unpkg.com/@feathersjs/client@^5.0.0/dist/feathers.js"></script>
<script>
  // @feathersjs/client is exposed as the `feathers` global.
  const app = feathers()

  app.configure(feathers.rest(fetch, {
    baseUrl: 'http://localhost:3030',
    sse: 'sse'
  }))
  app.configure(feathers.authentication())

  app.setup().then(() => {
    app.service('messages').create({
      text: 'A new message'
    })
  })

  // feathers.errors is an object with all of the custom error types.
</script>
```
