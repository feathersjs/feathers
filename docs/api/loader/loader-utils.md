---
outline: deep
---

# Loader Utilities

<BlockQuote type="danger" label="Unpublished">

This package is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

## class DataLoader(...)

**class DataLoader(batchLoadFunc [, options])**

This library re-exports [Dataloader](https://www.npmjs.com/package/dataloader) from its original package. Refer to [its documentation](https://github.com/graphql/dataloader) for more information. The `loaderOptions` given to `BatchLoader` will be used to configure DataLoaders. You can also import `Dataloader` along with some helpful utility functions to build custom loaders.

```js
const { DataLoader uniqueResults, uniqueKeys } = require("@feathersjs/loader");

const batchFn = async (keys, context) => {
  const data = await users.find({
    query: { id: { $in: uniqueKeys(keys) } },
    paginate: false,
  });
  return uniqueResults(keys, data);
}

const usersLoader = new DataLoader(
  batchFn,
  {
    batch: true,
    cache: true,
    maxBatchSize: 100,
    cacheKeyFn: (key) => key,
    cacheMap: new Map()
  }
);
```

## uniqueKeys(keys)

Returns the unique elements in an array.

**Arguments:**

- **keys** `{Array<String | Number>}` - The keys. May contain duplicates.

```js
const usersLoader = new DataLoader(async keys =>
  const data = users.find({ query: { id: { $in: uniqueKeys(keys) } } })
  ...
);
```

## uniqueResults(...)

#### uniqueResults(keys, result, idProp = 'id', defaultValue = null)

Reorganizes the records from the service call into the result expected from the batch function. Returns one result per key and is generally used for `get({ id: 1 })`

**Arguments:**

- **keys** `{Array<String | Number>}` - An array of `key` elements, which the value the batch loader function will use to find the records requested.
- **result** `{Object | Array<Object>}` - Any service method result.
- **idProp** `{String}` - The "id" property of the records. Defaults to `'id'`.
- **defaultValue** `{Any}` - The default value returned when there is no result matching a key. Defaults to `null`.

```js
const usersLoader = new DataLoader(async (keys) => {
  const data = users.find({ query: { id: { $in: uniqueKeys(keys) } } })
  return uniqueResults(keys, result, 'id', null)
})
```

## uniqueResultsMulti(...)

**uniqueResultsMulti(keys, result, idProp = 'id', defaultValue = null)**

Reorganizes the records from the service call into the result expected from the batch function. Returns multiple results per key and is generally used for `find({ id: 1 })`.

**Arguments:**

- **keys** `{Array<String | Number>}` - An array of `key` elements, which the value the batch loader function will use to find the records requested.
- **result** `{Object | Array<Object>}` - Any service method result.
- **idProp** `{String}` - The "id" property of the records. Defaults to `'id'`.
- **defaultValue** `{Any}` - The default value returned when there is no result matching a key. Defaults to `null`.

```js
const usersLoader = new DataLoader(async (keys) => {
  const keys = uniqueKeys(keys)
  const result = users.find({ query: { id: { $in: uniqueKeys(keys) } } })
  return uniqueResultsMulti(keys, result, 'id', null)
})
```
