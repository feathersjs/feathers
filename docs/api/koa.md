---
outline: deep
---

# Koa

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/koa.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/koa)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/koa/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/koa --save
```

The `@feathersjs/koa` module contains the [KoaJS](https://koajs.com/) framework integrations for Feathers. It will turn the Feathers app into a fully compatible KoaJS application.

## koa(app)

`koa(app) -> app` is a function that turns a [Feathers application](./application.md) into a fully KoaJS compatible application that additionally to Feathers functionality also lets you use the [KoaJS API](https://koajs.com/).

```ts
import { feathers } from '@feathersjs/feathers'
import { koa, errorHandler, bodyParser, rest } from '@feathersjs/koa'

const app = koa(feathers())

app.use(errorHandler())
app.use(authentication())
app.use(bodyParser())
app.configure(rest())
```

Also see the [additional middleware](#middleware) that `@feathersjs/koa` exposes.

## koa(app, koaApp)

`koa(app, koaApp) -> app` allows to extend an existing Koa application with the Feathers application `app`.

## koa()

If no Feathers application is passed, `koa() -> app` returns a plain Koa application (`new Koa()`).

## app.use(location|mw[, service])

`app.use(location|mw[, service]) -> app` registers either a [service object](./services.md), or a Koa middleware. If a path and [service object](./services.md) is passed it will use Feathers registration mechanism, for a middleware function Koa.

## app.listen(port)

`app.listen(port) -> HttpServer` will first call Koa [app.listen](https://github.com/koajs/koa/blob/master/docs/api/index.md#applisten) and then internally also call the [Feathers app.setup(server)](./application.md#setupserver).

```js
// Listen on port 3030
const server = await app.listen(3030)
```

## app.setup(server)

`app.setup(server) -> app` is usually called internally by `app.listen` but in the cases described below needs to be called explicitly.

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
    app.callback()
  )
  .listen(443)

// Call app.setup to initialize all services and SocketIO
app.setup(server)

server.on('listening', () => logger.info('Feathers application started'))
```

## params

In a Koa middleware, `ctx.feathers` is an object which will be extended as `params` in a service method call.

```ts
import { rest } from '@feathersjs/koa'
import type { NextFunction } from '@feathersjs/koa'
import type { Id, Params } from '@feathersjs/feathers'

class TodoService {
  async get(id: Id, params: Params & { fromMiddleware: string }) {
    const { fromMiddleware } = params

    return { id, fromMiddleware }
  }
}

// Register Koa middleware
app.use(async (ctx: any, next: NextFunction) => {
  ctx.feathers = {
    ...ctx.feathers,
    fromMiddleware: 'Hello from Koa middleware'
  }

  await next()
})
app.configure(rest())

// Register a service
app.use('todos', new TodoService())
```

<BlockQuote type="warning" label="Important">

Note that `app.configure(rest())` has to happen **after** any custom middleware.

</BlockQuote>

### params.query

`params.query` will contain the URL query parameters sent from the client parsed using [koa-qs](https://github.com/koajs/qs).

<BlockQuote type="warning" label="important">

Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to other `params` properties in a [hook](./hooks.md).

</BlockQuote>

To increase the array limit in query strings, `koa-qs` can be reinitalized with the options for the [qs](https://www.npmjs.com/package/qs) module:

```ts
// app.ts
import koaQs from 'koa-qs'

// ...
koaQs(app, 'extended', {
  arrayLimit: 200
})
```

### params.provider

For any [service method call](./services.md) made through REST `params.provider` will be set to `rest`.

### params.route

Route placeholders in a service URL will be added to the services `params.route`. See the [FAQ entry on nested routes](../help/faq.md#how-do-i-do-nested-or-custom-routes) for more details on when and when not to use nested routes.

```ts
import { feathers } from '@feathersjs/feathers'
import { koa, errorHandler, bodyParser, rest } from '@feathersjs/koa'

const app = koa(feathers())

app.use('users/:userId/messages', {
  async get(id, params) {
    console.log(params.query) // -> ?query
    console.log(params.provider) // -> 'rest'
    console.log(params.fromMiddleware) // -> 'Hello world'
    console.log(params.route) // will be `{ userId: '1' }` for GET /users/1/messages

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

## Service middleware

When registering a service, it is also possible to pass custom Koa middleware that should run `before` the specific service method in the `koa` [service option](./application.md#usepath-service--options):

```ts
app.use('/todos', new TodoService(), {
  koa: {
    before: [
      async (ctx, next) => {
        ctx.feathers // data that will be merged into sevice `params`

        // This will run all subsequent middleware and the service call
        await next()

        // Then we have additional properties available on the context
        ctx.hook // the hook context from the method call
        ctx.body // the return value
      }
    ]
  }
})
```

Note that the order of middleware will be `[...before, serviceMethod]`.

## Middleware

### rest

```ts
import { rest } from '@feathersjs/koa'

app.configure(rest())
```

Configures the middleware for handling service calls via HTTP. It will also register authentication header parsing. The following (optional) options are available:

- `formatter` - A middleware that formats the response body
- `authentication` - The authentication `service` and `strategies` to use for parsing authentication information

### errorHandler

```ts
import { errorHandler } from '@feathersjs/koa'

app.use(errorHandler())
```

A middleware that formats errors as a Feathers error and sets the proper status code. Needs to be the first middleware registered in order to catch all other errors.

### authenticate

A middleware that allows to authenticate a user (or other authentication entity) using the [authentication service](./authentication/service.md) setting `ctx.feathers.user`. Not necessary for use with services but can be used in custom middleware.

```ts
import { authenticate } from '@feathersjs/koa'

// Authenticate other middleware with the JWT strategy
app.use(authenticate('jwt'))

// Authenticate a non default service
app.use(
  authenticate({
    service: 'api/v1',
    strategies: ['jwt']
  })
)
```

### parseAuthentication

The `parseAuthentication` middleware is registered automatically and will use the strategies of the default [authentication service](./authentication/service.md) to parse headers for authentication information. If you want to additionally parse authentication with a different authentication service this middleware can be registered again with that service configured.

```ts
import { parseAuthentication } from '@feathersjs/koa'

app.use(
  parseAuthentication({
    service: 'api/v1/authentication',
    strategies: ['jwt', 'local']
  })
)
```

### bodyParser

A reference to the [koa-body](https://github.com/koajs/koa-body) module.

### cors

A reference to the [@koa/cors](https://github.com/koajs/cors) module.

### serveStatic

A reference to the [koa-static](https://github.com/koajs/static) module.
