---
outline: deep
---

# Service Loader

<BlockQuote type="danger" label="Unpublished">

This package is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

## The ServiceLoader Class

Create a new service-loader. This class lazily configures underlying `DataLoader` and `FindLoader` for a given service

<BlockQuote label="todo">

TODO: Provide Links to the DataLoader and FindLoader options.

</BlockQuote>

**Arguments:**

- **options** `{Object}`
  - **service** `{Object}` - A service for this loader, like `app.service('users')`
  - **loaderOptions** `{Object}` - See `DataLoader`, `FindLoader` and `GetLoader`

There are two ways to create `ServiceLoader` instances.

### Create With AppLoader

The most common way to create `ServiceLoader` instances is through the [`AppLoader` class](/api/loader/app-loader). Here's an example:

```js
const { AppLoader } = require('@feathersjs/loader')

const loader = new AppLoader({ app, maxBatchSize: 500 })

// This is our ServiceLoader instance
const userLoader = loader.service('users')
```

### Create Directly

You can also directly create an instance using the `ServiceLoader` class.

```js
const { ServiceLoader } = require('@feathersjs/loader')

// This is our ServiceLoader instance
const userLoader = new ServiceLoader({ service: app.service('users') })
```

## Example

```js
const { ServiceLoader } = require('@feathersjs/loader')

// See DataLoader and FindLoader options
const loaderOptions = {}

const loader = new ServiceLoader({
  service: app.service('users'),
  ...loaderOptions
})

// Any Feathers Params
const params = {}

const user = await loader.load(1, params)
const user = await loader.key('username').load('DaddyWarbucks', params)
const users = await loader.load([1, 2, 3], params)

const authorUsers = await loader.multi('role').load('author', params)
const usersByRole = await loader.multi('role').load(['author', 'reader'], params)

const user = await loader.get(1, params)
const users = await loader.find(params)

loader.clearAll()
```

## Instances

Each `ServiceLoader` instance provides the several methods for handling data. There are three sets of methods:

- The [Chainable Loader Methods](#chainable-loader-methods): `load`, `key`, and `multi`.
- The [Configurable Loader Method](#configurable-loader-method): `exec`.
- The [Cache Loader Methods](#cache-loader-methods): `find`, `get`, and `clearAll`.

### Chainable Loader Methods

A memorable, shorthand API for performing intelligent data loading through query/relationship batching and caching.

- **load** `(id | id[], params) => Promise<RelatedData>` - loads one relationship for each `id`. The name of the attribute to use as the key will be pulled from the service options, unless changed using the chainable `key()` method, below.
- **key** `(key: string) => { load }` - Specifies the attribute to use as the key for the relationship. This key represents the attribute name in the service specified when creating the current ServiceLoader.
- **multi** `(key: string) => { load }` -

### Configurable Loader Method

This method is similar to the chainable methods in that it performs query/relationship batching and caching, but it also allows passing a custom `cacheParamsFn`.

- **exec** `(options: ExecOptions) => Promise<RelatedData>` - runs the data loader with the provided options.
  - **options** `{ExecOptions}`
    - **id** `{id | id[]}` - the value of the `idKey` in the relationship to be loaded.
    - **idKey** `{string}` - the key on the remote service on which to query. Will use the `id` value to retrieve each relationship.
    - **multi** `{boolean}` - whether to return multiple results for each id/relationship. Defaults to `false`.
    - **params** `{ServiceParams}` - additional params to provide to the underlying Feathers service.
    - **cacheParamsFn** `() => ?` **//TODO fill in cacheParamsFn**

### Cache Loader Methods

The `find` and `get` methods work similar to `service.find` and `service.get` and also perform result caching. They do not perform query/relationship batching.

- **find** `(params) => Promise<Data>` - makes a request with the underlying `FindLoader` instance and caches the result. This is the same as calling `findLoader.load`
- **get** `(id, params) => Promise<Data>` - makes a request with the underlying `GetLoader` instance and caches the result. This is the same as calling `getLoader.load`
- **clearAll** `(id | id[]) => self` - clears the internal cache map.

## Loading on a Custom Key

You can change the key of the loaded relationship by using the `multi(keyName)` or `key(keyName)` chainable methods OR by providing the `idKey` option when calling the `exec` method.

<BlockQuote label="database tip">

For faster queries when you query on a different key, make sure your database has an index on the matching key.

</BlockQuote>

```js
// Use `.key` to change the relationship key
await app.service('users').key('email').load('one@test.com')

// Use `.multi` to change the relationship key
await app.service('comments').multi('userId').load(5)

// Same as the previous line, but using `.exec` to change the relationship key
await app.service('comments').exec({
  id: 5,
  multi: true,
  idKey: 'userId'
})
```

## Instance Examples

After you have created an `ServiceLoader` instance, as shown in the [previous example](#serviceloader-example), the following instance methods are available.

Think of a ServiceLoader as a relationship loader. One "relationship" of data is retrieved per provided `id`. A "relationship" will either contain one result or multiple results, depending on the value of `multi`.

### Load a Single User by `id`

This example returns a single user with the `id` of `1`.

```js
await app.service('users').load(1)
/*
{ id: 1, name: '...' }
*/
```

### Load a Array of Users by `id`

This example returns an array of users, one for each `id` in the array. The order of the returned users will match the index of their corresponding `email` in the array.

```js
await app.service('users').load([1, 2, 3])
/*
[
  { id: 1, name: '...' },
  { id: 2, name: '...' },
  { id: 3, name: '...' }
]
*/
```

### Load a Single User by `email`

This example returns a single user with the `email` of `icecream@strausmilk.com`.

```js
await app.service('users').key('email').load('icecream@strausmilk.com')
/*
{ id: 5, email: 'icecream@strausmilk.com' }
*/
```

### Load Users by Many `email`s

This example returns an array of users, one for each `email` in the array. The order of the returned users will match the index of their corresponding `email` in the array. This is kind of like a query using `{ email: { $in: emails } }`, and returns the results in an idempotent order.

```js
await app.service('users').load(['one@test.com', 'two@test.com', 'three@test.com'])
/*
[
  { id: 72, name: 'one@test.com' },
  { id: 26, name: 'two@test.com' },
  { id: 23, name: 'three@test.com' }
]
*/
```

### Load Multiple for One `userId`

This example returns an array comments where each comment's `userId` is `1`.

```js
await app.service('comments').multi('userId').load(1)
/*
[
  { id: 14, userId: 1, text: '...' },
  { id: 25, userId: 1, text: '...' },
  { id: 52, userId: 1, text: '...' }
]
*/
```

### Load Multiple for Each `userId`

This example returns an array comments where each comment's `userId` matches each `id` in `[1, 2, 3]`. The returned result is a two-dimensional array, where the order of results matches the order of the provided ids.

```js
await app.service('comments').multi('userId').load([1, 2, 3])
/*
[
  // result set for userId of 1
  [
    { id: 14, userId: 1, text: '...' },
    { id: 25, userId: 1, text: '...' },
    { id: 52, userId: 1, text: '...' }
  ],
  // result set for userId of 2
  [
    { id: 24, userId: 2, text: '...' },
    { id: 35, userId: 2, text: '...' },
    { id: 62, userId: 2, text: '...' }
  ],
  // result set for userId of 3
  [
    { id: 64, userId: 3, text: '...' },
    { id: 75, userId: 3, text: '...' },
    { id: 12, userId: 3, text: '...' }
  ]
]
*/
```
