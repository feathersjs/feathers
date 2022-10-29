---
outline: deep
---

# Configuration

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/configuration.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/configuration)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/configuration/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/configuration --save
```

`@feathersjs/configuration` is a wrapper for [node-config](https://github.com/lorenwest/node-config) to make configuration values available via [app.get](./application.md#get-name) which can then be used to configure an application.

By default it will look in `config/*` for `default.json`. It will be merged with other configuration files in the `config/` folder using the `NODE_ENV` environment variable. So setting `NODE_ENV=production` will merge `config/default.json` with `config/production.json`.

For more information also see the [node-config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

## Usage

`app.configure(configuration())` loads the configuration from `node-config` and makes it available via `app.get()`.

```ts
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'

// Use the application root and `config/` as the configuration folder
const app = feathers().configure(configuration())

// Will return 3030 with  `{ "port": 3030 }` in config/default.json
app.get('port')
```

<BlockQuote type="warning" label="Important">

Direct access to nested config properties is not supported via `app.get()`. To access a nested config property (e.g. `Customer.dbConfig.host`, use `app.get('Customer').dbConfig.host`.

</BlockQuote>

## Configuration validation

`app.configure(configuration(validator))` loads the configuration from `node-config`, makes it available via `app.get()` and validates the original configuration against a [Feathers schema](./schema/) validator when [app.setup](./application.md#setup-server) (or [app.listen](./application.md#listen-port)) is called.

```ts
import { feathers } from '@feathersjs/feathers'
import { Ajv } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import configuration from '@feathersjs/configuration'

const configurationSchema = Type.Object(
  {
    port: Type.Number(),
    host: Type.String()
  },
  { $id: 'Configuration', additionalProperties: false }
)

const configurationValidator = getValidator(configurationSchema, new Ajv())

type ServiceTypes = {}
// Use the schema type for typed `app.get` and `app.set` calls
type Configuration = Static<typeof configurationSchema>

// Use the application root and `config/` as the configuration folder
const app = feathers<ServiceTypes, Configuration>().configure(configuration(configurationValidator))

// Configuration will only be validated now
app
  .listen()
  .then(() => console.log('Server started'))
  .catch((error) => {
    // Configuration validation errors will show up here
    console.log(error.data)
  })
```

## Environment variables

As recommended by node-config, it is possible to override the configuration with custom variables by passing a JSON object in the [`NODE_CONFIG` environment variable](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config):

```
$ export NODE_CONFIG='{ "port":  8080, "host": "production.app" }'
$ node myapp.js
```

Individual environment variables can be used through [Custom Environment Variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables) by creating a `config/custom-environment-variables.json` like this:

```js
{
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

## Configuration directory

By default, Feathers will use the `config/` directory in the root of your project’s source directory. To change this, e.g., if you have Feathers installed under the `server/` directory and you want your configuration at `server/config/`, you have to set the `NODE_CONFIG_DIR` environment variable in `app.js` _before_ importing `@feathersjs/configuration`:

```
$ export NODE_CONFIG_DIR=server/config
$ node myapp.js
```

<BlockQuote type="info" label="Note">

The NODE_CONFIG_DIR environment variable isn’t used directly by @feathersjs/configuration but by the [node-config](https://github.com/lorenwest/node-config) module that it uses. For more information on configuring node-config settings, see the [Configuration Files Wiki page](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

</BlockQuote>
