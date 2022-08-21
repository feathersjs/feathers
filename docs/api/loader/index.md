---
outline: deep
---

# Data Loader

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/loader.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/loader)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs-ecosystem/data-loader/blob/main/CHANGELOG.md)

</Badges>

<BlockQuote type="danger" label="Unpublished">

This package is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

```bash
$ npm install --save @feathersjs/loader
```

Data loaders reduce requests to backend services by batching calls and caching records. When paired with resolvers, they are an ideal for solution for populating data.

## Usage

The easiest way to use `@feathersjs/loader` is to use the `AppLoader`. This is a high-level class that configures and caches instances of the lower-level classes with common defaults and best practices, all on the fly.

```js
const { AppLoader } = require('@feathersjs/loader')

const loader = new AppLoader({ app })

// Load one user with id 1
const user = await loader.service('users').load(1, params)

// Load one user with username "DaddyWarbucks"
const user = await loader.service('users').key('username').load('DaddyWarbucks', params)

// Load one user per userId in the array
const users = loader.service('users').load([1, 2, 3], params)

// Load multiple comments for user with userId 1
const comments = await loader.service('comments').multi('userId').load(1, params)

// Load multiple comments for each userId in the array
const comments = await loader.service('comments').multi('userId').load([1, 2, 3], params)

// You can also call get() and find() methods.
// These are helpful for gets/finds that are not necessarily
// "relationships" but still benefit from caching the results.
const user = await loader.service('users').get(1)
const users = await loader.service('users').find({ query: { status: 'active' } })
```

Loaders are most commonly used when resolving data onto results. This is generally done in [resolvers](/api/schema/resolvers). Setup a loader in before hooks to make it available to these other hooks.

```js
const { AppLoader } = require('@feathersjs/loader')

// Use app.hooks() to initiliaze or pass on a loader
// with each service request. This ensures there is
// always params.loader available in subsequent hooks.
const initializeLoader = (context) => {
  if (context.params.loader) {
    return context
  }

  context.params.loader = new AppLoader({ app: context.app })
  return context
}

app.hooks({
  before: {
    all: [initializeLoader]
  }
})
```

Now loaders are available everywhere! No need to instantiate or configure a `ServiceLoader` for each service ahead of time. `ServiceLoader` are lazily created and cached as they are called. It is also best practice to pass the loader onto susequent service/loader calls to maximize effeciency. See the [Guide](./docs/guide.md) section for more info.

```js
const { resolveResult, resolve } = require('@feathersjs/schema')

const postResultsResolver = resolve({
  properties: {
    user: (value, post, context) => {
      const { loader } = context.params
      return loader.service('users').load(post.userId, { loader })
    }
  }
})

app.service('posts').hooks({
  after: {
    all: [resolveResult(postResultsResolver)]
  }
})
```

The `AppLoader` lazily configures a new `ServiceLoader` per service as you use them. This means that you do not have to configure the lower level `ServiceLoader` classes. But, you can use these classes individually, although it is generally not needed.

```js
const { ServiceLoader } = require('@feathersjs/loader')

const serviceLoader = new ServiceLoader({ service: app.service('users') })
const user = await serviceLoader.load(1, params)
const user = await serviceLoader.get(1, params)
const users = await serviceLoader.find(params)

serviceLoader.clearAll()
```

The `ServiceLoader` configures a `DataLoader` with some basic options. The `DataLoader` is a powerful batching and caching class that dramatically imporoves performance. It is based on the [facebook/dataloader](https://github.com/facebook/dataloader). If you are interested in how this works in depth, check out this [GREAT VIDEO](https://www.youtube.com/watch?v=OQTnXNCDywA) by its original author. You should also checkout the [GUIDE](./guide.md) for a comprehensive explanation of how the `DataLoader` works.

```js
const { DataLoader, uniqueKeys, uniqueResults } = require('@feathersjs/loader')

const usersLoader = new DataLoader(async (keys) => {
  const results = await users.find({ query: { id: { $in: uniqueKeys(keys) } } })
  return uniqueResults(keys, results)
})

const user = await usersLoader.load(1)
```
