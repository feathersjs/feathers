---
outline: deep
---

# Cache Loaders

<BlockQuote type="danger" label="Unpublished">

This package is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

## class FindLoader(options)

Create a new FindLoader. Create a loader that caches `find()` queries based on their params. FindLoaders are used by ServiceLoaders when calling `find(params)`.

**Arguments:**

- **options** `{Object}`
  - **service** `{Object}` - A service for this loader. For example, `app.service('users')`
  - **cacheMap** `{Object}` - Instance of Map (or an object with a similar API) to be used as cache. Defaults to `new Map()`
  - **cacheParamsFn** `{Function}` - A function that returns JSON.strinify-able params of a query to be used in the `cacheMap`. This function should return a set of params that will be used to identify this unique query and removes any non-serializable items. The default function returns traverses params and removes any functions. Defaults to `defaultCacheParamsFn`
  - **cacheKeyFn** `{Function}` - Normalize keys. `(key) => key && key.toString ? key.toString() : String(key)` Defaults to `defaultCacheKeyFn`

### FindLoader Example

```js
  const { FindLoader } = require("@feathersjs/loader");

  const loader = new FindLoader({
    service: app.service('users'),
    cacheMap: new Map(),
    cacheParamsFn: (params) => {
      return {
        paginate: false,
        query: params.query,
        user_id: params.user.id
      }
    }
    cacheKeyFn: (key) => key
  });

 const users = await loader.load(params);
 loader.clear(params);
 loader.clearAll();
```

### FindLoader Instances

After you have created an `FindLoader` instance, as shown in the [previous example](#findloader-example), the following instance methods are available.

**Instance Methods**

- **load** `(id | id[]) => Promise<Data | Data[]>` -
- **clear** `(id | id[]) => self` -
- **clearAll** `(id | id[]) => self` -
- **prime** `(id | id[]) => Promise<Data>` -

## class GetLoader(options)

Create a new GetLoader. Create a loader that caches `get()` requests based on their id/params. GetLoaders are used by ServiceLoaders when calling `get(id, params)`.

**Arguments:**

- **options** `{Object}`
  - **service** `{Object}` - A service for this loader, like `app.service('users')`
  - **cacheMap** `{Object}` - Instance of Map (or an object with a similar API) to be used as cache. Defaults to `new Map()`
  - **cacheParamsFn** `{Function}` - A function that returns JSON.strinify-able params of a query to be used in the `cacheMap`. This function should return a set of params that will be used to identify this unique query and removes any non-serializable items. The default function returns traverses params and removes any functions. Defaults to `defaultCacheParamsFn`.
  - **cacheKeyFn** `{Function}` - Normalize keys. `(key) => key && key.toString ? key.toString() : String(key)` Defaults to `defaultCacheKeyFn`.

### GetLoader Example

```js
  const { GetLoader } = require("@feathersjs/loader");

  const loader = new GetLoader({
    service: app.service('users'),
    cacheMap: new Map(),
    cacheParamsFn: (params) => {
      return {
        paginate: false,
        query: params.query,
        user_id: params.user.id
      }
    }
    cacheKeyFn: (key) => key
  });

  const user = await loader.load(1, params);
  loader.clear(id, params);
  loader.clearAll();
```

### GetLoader Instances
