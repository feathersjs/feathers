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

// Create an app that is a Feathers AND Express application
const app = koa(feathers())

app.use(errorHandler())
app.use(authentication())
app.use(bodyParser())
app.configure(rest())
```

`@feathersjs/koa` also exposes the following middleware:

- `rest` - A middleware to expose services as REST APIs
- `authentication` - A middleware for parsing HTTP headers for Feathers authentication information
- `bodyParser` - The [koa-bodyparser](https://github.com/koajs/bodyparser) middleware for parsing request bodies
- `errorHandler` - A JSON error handler middleware. Should always be registered as the very first middleware.

## koa(app, koaApp)

`koa(app, koaApp) -> app` allows to extend an existing Koa application with the Feathers application `app`.

## koa()

If no Feathers application is passed, `koa() -> app` returns a plain Koa application (`new Koa()`).

## app.use(location|mw[, service])

`app.use(location|mw[, service]) -> app` registers either a [service object](./services.md), or a Koa middleware. If a path and [service object](./services.md) is passed it will use Feathers registration mechanism, for a middleware function Koa.

### Koa middleware

In a Koa middleware, `ctx.feathers` is an object which will be extended as `params` in a service method call. 

```ts
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
  ctx.feathers.fromMiddleware = 'Hello from Koa middleware'

  await next()
})

// Register a service
app.use('todos', new TodoService())
```

### Service middleware

When registering a service, it is also possible to pass custom Koa middleware that should run `before` the specific service method in the `koa` [service option](./application.md#usepath-service--options):


```ts
app.use('/todos', new TodoService(), {
  koa: {
    before: [async (ctx, next) => {
      ctx.feathers // data that will be merged into sevice `params`
      
      // This will run all subsequent middleware and the service call
      await next()

      // Then we have additional properties available on the context
      ctx.hook // the hook context from the method call
      ctx.body // the return value
    }]
  }
})
```

Note that the order of middleware will be `[...before, serviceMethod]`.

## app.listen(port)

`app.listen(port) -> HttpServer` will first call Koa [app.listen](http://expressjs.com/en/4x/api.html#app.listen) and then internally also call the [Feathers app.setup(server)](./application.md#setupserver).

```js
// Listen on port 3030
const server = await app.listen(3030)
```

## app.setup(server)

`app.setup(server) -> app` is usually called internally by `app.listen` but in the cases described below needs to be called explicitly.

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

app.configure(errorHandler())
```

A middleware that formats errors as a Feathers error and sets the proper status code. Needs to be the first middleware registered in order to catch all other errors.

### authenticate

A middleware that allows to authenticate a user (or other authentication entity) setting `ctx.feathers.user`. Not necessary for use with services but can be used in custom middleware.

### bodyParser

A reference to the [koa-bodyparser](https://github.com/koajs/bodyparser) module.
