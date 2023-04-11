---
outline: deep
---

# Client

A generated application can be used as an npm module that provides a [Feathers client](../../api/client.md). It gives you a fully typed client that can be installed in any TypeScript (e.g. React, VueJS, React Native etc.) application.

## Local installation

The application can be linked into a client application by running

```
npm run bundle:client
npm link
```

Then go to your client side app

```
cd path/to/client
npm link my-app
```

## Creating a package

To create an installable SDK package that does not include any of the server code (other than the shared types) you can run

```
npm run bundle:client
```

By default this will create an `appname-x.x.x.tgz` npm package in the `public/` folder.
This package can be installed from a running server via

```
npm install https://myapp.com/appname-x.x.x.tgz
```

## Usage

Once installed, the application can be used as follows with Socket.io:

```ts
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import { createClient } from 'my-app'

const connection = socketio(io('https://myapp.com'))

const client = createClient(connection)
```

And like this with a REST client:

```ts
import rest from '@feathersjs/rest-client'
import { createClient } from 'my-app'

const connection = rest('https://myapp.com').fetch(window.fetch.bind(window))

const client = createClient(connection)
```
