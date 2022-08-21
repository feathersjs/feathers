---
outline: deep
---

# App Loader

<BlockQuote type="danger" label="Unpublished">

This package is not yet available on npm. A pre-release will be available, soon.

</BlockQuote>

<BlockQuote label="Work in Progress">

These docs are incomplete. Feel free to review with the understanding that they will continue to evolve.

</BlockQuote>

## class AppLoader(options)

Create a new app-loader. This is the most commonly-used class.

**Arguments:**

- **options** `{Object}`
  - **app** `{Object}` - a Feathers app
  - **services** `{Object}` - An object where each property is a service name and the value is loader options for that service. These options override the `globalLoaderOptions`. Defaults to `{}`
  - **globalLoaderOptions** `{Object}` - Options that will be assigned to every new `ServiceLoader`. Defaults to `{}`

### AppLoader Example

```js
const { AppLoader } = require('@feathersjs/loader')

const appLoader = new AppLoader({
  app,
  services: {
    users: { maxBatchSize: 100 }
  },
  maxBatchSize: 500
})

const loader = appLoader.service('users')

const user = await loader.load(1, params)
const user = await loader.key('username').load('DaddyWarbucks', params)
const users = await loader.load([1, 2, 3], params)

const authorUsers = await loader.multi('role').load('author', params)
const usersByRole = await loader.multi('role').load(['author', 'reader'], params)

const user = await loader.get(1, params)
const users = await loader.find(params)

loader.clearAll()
```

### AppLoader Instances

After you have created an `AppLoader` instance, as shown in the [previous example](#apploader-example), each loader instance has single `service` method available.

**Instance Methods**

- **service** `(servicePath: string) => ServiceLoader` - look up or create a ServiceLoader for the provided `servicePath`.
