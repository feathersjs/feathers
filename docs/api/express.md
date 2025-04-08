---
outline: deep
---

# Express

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/express.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/express)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/express/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/express --save
```

The `@feathersjs/express` module contains [Express](http://expressjs.com/) framework integrations for Feathers:

- The [Express framework bindings](#expressapp) to make a Feathers application Express compatible
- An Express based transport to expose services through a [REST API](#expressrest)
- An [Express error handler](#expresserrorhandler) for [Feathers errors](./errors.md)

```ts
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const app = express(feathers())
```

<BlockQuote type="warning" label="Important">

As of Feathers v5, [Koa](./koa.md) is the recommended framework integration since it is more modern, faster and easier to use. When chosen explicitly, you should already be familiar with [Express](http://expressjs.com/en/guide/routing.html).

</BlockQuote>

## express(app)

`express(app) -> app` is a function that turns a [Feathers application](./application.md) into a fully Express (4+) compatible application that additionally to Feathers functionality also lets you use the [Express API](http://expressjs.com/en/4x/api.html).

```ts
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const app = express(feathers())
```

Note that `@feathersjs/express` also exposes the Express [built-in middleware](#built-ins)

## express(app, expressApp)

`express(app, expressApp) -> app` allows to extend an existing Express application with the Feathers application `app`.

## express()

If no Feathers application is passed, `express() -> app` returns a plain Express application just like a normal call to Express would.

## app.use(path, service|mw|\[mw\])

`app.use(path, service|mw|[mw]) -> app` registers either a [service object](./services.md), an [Express middleware](http://expressjs.com/en/guide/writing-middleware.html) or an array of [Express middleware](http://expressjs.com/en/guide/writing-middleware.html) on the given path. If [a service object](./services.md) is passed it will use Feathers registration mechanism, for a middleware function Express.

```ts
// Register a service
app.use('todos', {
  async get(id) {
    return { id }
  }
})

// Register an Express middleware
app.use('/test', (req, res) => {
  res.json({
    message: 'Hello world from Express middleware'
  })
})

// Register multiple Express middleware functions
app.use(
  '/test',
  (req, res, next) => {
    res.data = 'Step 1 worked'
    next()
  },
  (req, res) => {
    res.json({
      message: `Hello world from Express middleware ${res.data}`
    })
  }
)
```

## app.listen(port)

`app.listen(port) -> Promise<HttpServer>` will first call Express [app.listen](http://expressjs.com/en/4x/api.html#app.listen) and then internally also call the [app.setup(server)](./application.md#setup-server).

```ts
// Listen on port 3030
const server = await app.listen(3030)
```

## app.setup(server)

`app.setup(server) -> app` is usually called internally by `app.listen` but in the cases described below needs to be called explicitly.

### Sub-Apps

When registering an application as a sub-app, `app.setup(server)` has to be called to initialize the sub-apps services.

```ts
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const api = feathers()

api.use('service', myService)

const mainApp = express(feathers()).use('/api/v1', api)

const server = await mainApp.listen(3030)

// Now call setup on the Feathers app with the server
await api.setup(server)
```

### HTTPS

HTTPS requires creating a separate server in which case `app.setup(server)` also has to be called explicitly. In a generated application `src/index.js` should look like this:

```ts
import https from 'https'
import { app } from './app'

const port = app.get('port')
const server = https
  .createServer(
    {
      key: fs.readFileSync('privatekey.pem'),
      cert: fs.readFileSync('certificate.pem')
    },
    app
  )
  .listen(443)

// Call app.setup to initialize all services and SocketIO
app.setup(server)

server.on('listening', () => logger.info('Feathers application started'))
```

### Virtual Hosts

The [vhost](https://github.com/expressjs/vhost) Express middleware can be used to run a Feathers application on a virtual host but again requires `app.setup(server)` to be called explicitly.

```ts
import vhost from 'vhost'
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const app = express(feathers())

app.use('/todos', todoService)

const host = express().use(vhost('foo.com', app))
const server = await host.listen(8080)

// Here we need to call app.setup because .listen on our virtual hosted
// app is never called
app.setup(server)
```

## rest()

Registers a Feathers transport mechanism that allows you to expose and consume [services](./services.md) through a [RESTful API](https://en.wikipedia.org/wiki/Representational_state_transfer). This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

| Service method | HTTP method | Path        |
| -------------- | ----------- | ----------- |
| .find()        | GET         | /messages   |
| .get()         | GET         | /messages/1 |
| .create()      | POST        | /messages   |
| .update()      | PUT         | /messages/1 |
| .patch()       | PATCH       | /messages/1 |
| .remove()      | DELETE      | /messages/1 |

### app.configure(rest())

Configures the transport provider with a standard formatter sending JSON response via [res.json](http://expressjs.com/en/4x/api.html#res.json).

```ts
import { feathers } from '@feathersjs/feathers'
import express, { json, urlencoded, rest } from '@feathersjs/express'

// Create an Express compatible Feathers application
const app = express(feathers())

// Turn on JSON parser for REST services
app.use(json())
// Turn on URL-encoded parser for REST services
app.use(urlencoded({ extended: true }))
// Set up REST transport
app.configure(rest())
```

<BlockQuote type="danger" label="Important">

The `json` and `urlencoded` body parser and [params middleware](#params) has to be registered **before** any service.

</BlockQuote>

### app.configure(rest(formatter))

The default REST response formatter is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `formatter` middleware pass a `formatter(req, res)` function. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation.

```ts
import { feathers } from '@feathersjs/feathers'
import express, { json, urlencoded, rest } from '@feathersjs/express'

const app = express(feathers())

// Turn on JSON parser for REST services
app.use(json())
// Turn on URL-encoded parser for REST services
app.use(urlencoded({ extended: true }))
// Set up REST transport
app.configure(
  rest(function (req, res) {
    // Format the message as text/plain
    res.format({
      'text/plain': function () {
        res.end(`The Message is: "${res.data.text}"`)
      }
    })
  })
)
```

## Custom service middleware

Custom Express middleware that only should run before or after a specific service can be passed to `app.use` in the order it should run:

```ts
const todoService = {
  async get(id: Id) {
    return {
      id,
      description: `You have to do ${id}!`
    }
  }
}

app.use('todos', logRequest, todoService, updateData)
```

<BlockQuote type="danger">

Custom middleware will only run for REST requests and not when used with other transports (like Socket.io). If possible try to avoid custom middleware and use [hooks](hooks.md) or customized services instead which will work for all transports.

</BlockQuote>

Middleware that runs after the service has the service call information available as

- `res.data` - The data that will be sent
- `res.hook` - The [hook](./hooks.md) context of the service method call

For example `updateData` could look like this:

```js
function updateData(req, res, next) {
  res.data.updateData = true
  next()
}
```

If you run `res.send` in a custom middleware after the service and don't call `next`, other middleware (like the REST formatter) will be skipped. This can be used to e.g. render different views for certain service method calls, for example to export a file as CSV:

```ts
import json2csv from 'json2csv'

const fields = ['done', 'description']

app.use('todos', todoService, function (req, res) {
  const result = res.data
  const data = result.data // will be either `result` as an array or `data` if it is paginated
  const csv = json2csv({ data, fields })

  res.type('csv')
  res.end(csv)
})
```

## params

All Express middleware will have access to the `req.feathers` object to set properties on the service method `params`:

```ts
import { feathers } from '@feathersjs/feathers'
import type { Id, Params } from '@feathersjs/feathers'
import express, { json, urlencoded, rest } from '@feathersjs/express'

const app = express(feathers())

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(function (req, res, next) {
  req.feathers.fromMiddleware = 'Hello world'
  next()
})
app.configure(rest())

app.use('todos', {
  async get(id: Id, params: Params) {
    console.log(params.provider) // -> 'rest'
    console.log(params.fromMiddleware) // -> 'Hello world'

    return {
      id,
      params,
      description: `You have to do ${id}!`
    }
  }
})

app.listen(3030)
```

Avoid setting `req.feathers = something` directly since it may already contain information that other Feathers plugins rely on. Adding individual properties or using `{ ...req.feathers, something }` is the more reliable option.

<BlockQuote type="warning" label="Important">

Since the order of Express middleware matters, any middleware that sets service parameters has to be registered **before** `app.configure(rest())` or as a [custom service middleware](#custom-service-middleware)

</BlockQuote>

<BlockQuote type="tip">

Although it may be convenient to set `req.feathers.req = req` to have access to the request object in the service, we recommend keeping your services as provider independent as possible. There usually is a way to pre-process your data in a middleware so that the service does not need to know about the HTTP request or response.

</BlockQuote>

### params.query

`params.query` will contain the URL query parameters sent from the client. For the REST transport the query string is parsed using the [qs](https://github.com/ljharb/qs) module. For some query string examples see the [database querying](./databases/querying.md) chapter.

<BlockQuote type="warning">

Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to other `params` properties in a [hook](./hooks.md).

</BlockQuote>

For example:

```
GET /messages?read=true&$sort[createdAt]=-1
```

Will set `params.query` to

```json
{
  "read": "true",
  "$sort": { "createdAt": "-1" }
}
```

<BlockQuote type="tip">

Note that the URL is a string so type conversion may be necessary. This is usually done with [query schemas and resolvers](./schema/index.md).

</BlockQuote>

<BlockQuote type="danger">

If an array in your request consists of more than 20 items, the [qs](https://www.npmjs.com/package/qs) parser implicitly [converts](https://github.com/ljharb/qs#parsing-arrays) it to an object with indices as keys. To extend this limit, you can set a custom query parser: `app.set('query parser', str => qs.parse(str, {arrayLimit: 1000}))`

</BlockQuote>

### params.provider

For any [service method call](./services.md) made through REST `params.provider` will be set to `rest`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```ts
import { HookContext } from 'declarations'

app.service('users').hooks({
  before: {
    remove: [
      async (context: HookContext) => {
        // check for if(context.params.provider) to prevent any external call
        if (context.params.provider === 'rest') {
          throw new Error('You can not delete a user via REST')
        }
      }
    ]
  }
})
```

### params.headers

`params.headers` will contain the original service request headers.

### params.route

Express route placeholders in a service URL will be added to the services `params.route`. See the [FAQ entry on nested routes](../help/faq.md#how-do-i-do-nested-or-custom-routes) for more details on when and when not to use nested routes.

```ts
import { feathers } from '@feathersjs/feathers'
import express, { rest } from '@feathersjs/express'

const app = express(feathers())

app.configure(rest())
app.use(function (req, res, next) {
  req.feathers.fromMiddleware = 'Hello world'
  next()
})

app.use('users/:userId/messages', {
  async get(id, params) {
    console.log(params.query) // -> ?query
    console.log(params.provider) // -> 'rest'
    console.log(params.fromMiddleware) // -> 'Hello world'
    console.log(params.route.userId) // will be `1` for GET /users/1/messages

    return {
      id,
      params,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date().getTime()
    }
  }
})

app.listen(3030)
```

## Middleware

`@feathersjs/express` comes with the following middleware

### notFound(options)

`notFound()` returns middleware that returns a `NotFound` (404) [Feathers error](./errors.md). It should be used as the last middleware **before** the error handler. The following options are available:

- `verbose`: Set to `true` if the URL should be included in the error message (default: `false`)

```ts
import { notFound, errorHandler } from '@feathersjs/express'

// Return errors that include the URL
app.use(notFound({ verbose: true }))
app.use(errorHandler())
```

### errorHandler()

`errorHandler` is an [Express error handler](https://expressjs.com/en/guide/error-handling.html) middleware that formats any error response to a REST call as JSON (or HTML if e.g. someone hits our API directly in the browser) and sets the appropriate error code.

<BlockQuote type="tip">

You can still use any other Express compatible [error middleware](http://expressjs.com/en/guide/error-handling.html) with Feathers.

</BlockQuote>

<BlockQuote type="danger" label="Important">

Just like in Express, the error handler has to be registered _after_ all middleware and services.

</BlockQuote>

#### app.use(errorHandler())

Set up the error handler with the default configuration.

```ts
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const app = express(feathers())

// before starting the app
app.use(express.errorHandler())
```

#### app.use(errorHandler(options))

```ts
import { feathers } from '@feathersjs/feathers'
import express from '@feathersjs/express'

const app = express(feathers())

// Just like Express your error middleware needs to be
// set up last in your middleware chain.
app.use(
  express.errorHandler({
    html: function (error, req, res, next) {
      // render your error view with the error object
      res.render('error', error)
    }
  })
)

app.use(
  errorHandler({
    html: {
      404: 'path/to/notFound.html',
      500: 'there/will/be/robots.html'
    }
  })
)
```

<BlockQuote type="warning" label="important">

If you want to have the response in json format be sure to set the `Accept` header in your request to `application/json` otherwise the default error handler will return HTML.

</BlockQuote>

The following options can be passed when creating a new error handler:

- `html` (Function|Object) [optional] - A custom formatter function or an object that contains the path to your custom html error pages. Can also be set to `false` to disable html error pages altogether so that only JSON is returned.
- `logger` (Function|false) (default: `console`) - Set a logger object to log the error (it will be logger with `logger.error(error)`

### authenticate()

`express.authenticate(...strategies)` allows to protect an Express middleware with an [authentication service](./authentication/service.md) that has [strategies](./authentication/strategy.md) registered that can parse HTTP headers. It will set the authentication information on the `req.feathers` object (e.g. `req.feathers.user`). The following example protects the `/hello` endpoint with the JWT strategy (so the `Authorization: Bearer <JWT>` header needs to be set) and uses the user email to render the message:

```ts
import { authenticate } from '@feathersjs/express'

app.use('/hello', authenticate('jwt'), (req, res) => {
  const { user } = req.feathers

  res.render(`Hello ${user.email}`)
})

// When using with the non-default authentication service
app.use(
  '/hello',
  authenticate({
    service: 'v2/auth',
    strategies: ['jwt', 'api-key']
  }),
  (req, res) => {
    const { user } = req.feathers

    res.render(`Hello ${user.email}`)
  }
)
```

When clicking a normal link, web browsers do _not_ send the appropriate header. In order to initate an authenticated request to a middleware from a browser link, there are two options. One is using a session which is described in the [Server Side rendering guide](../cookbook/express/view-engine.md), another is to add the JWT access token to the query string and mapping it to an authentication request:

```ts
import { authenticate } from '@feathersjs/express'

const setQueryAuthentication = (req, res, next) => {
  const { access_token } = req.query

  if (access_token) {
    req.authentication = {
      strategy: 'jwt',
      accessToken: access_token
    }
  }

  next()
}

// Request this with `hello?access_token=<your jwt>`
app.use('/hello', setQueryAuthentication, authenticate('jwt'), (req, res) => {
  const { user } = req.feathers

  res.render(`Hello ${user.email}`)
})
```

How to get the access token from the authentication client is described in the [authentication client documentation](../api/authentication/client.md#app-get-authentication).

<BlockQuote type="warning">

When using HTTPS URLs are safely encrypted but when using this method you have to make sure that access tokens are not logged through any of your logging mechanisms.

</BlockQuote>

### parseAuthentication

The `parseAuthentication` middleware is registered automatically and will use the strategies of the default [authentication service](./authentication/service.md) to parse headers for authentication information. If you want to additionally parse authentication with a different authentication service this middleware can be registered again with that service configured.

```ts
import { parseAuthentication } from '@feathersjs/express'

app.use(
  parseAuthentication({
    service: 'api/v1/authentication',
    strategies: ['jwt', 'local']
  })
)
```

### cors

A reference to the [cors](https://github.com/expressjs/cors) module.

### compression

A reference to the [compression](https://github.com/expressjs/compression) module.

### Built ins

Note that `@feathersjs/express` also exposes the standard [Express middleware](http://expressjs.com/en/4x/api.html#express):

- `json` - A JSON body parser
- `urlencoded` - A URL encoded form body parser
- `serveStatic` - To statically host files in a folder
- `Router` - Creates an Express router object
