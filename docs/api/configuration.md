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

`@feathersjs/configuration` is a wrapper for [node-config](https://github.com/lorenwest/node-config) which allows to configure a server side Feathers application.

By default this implementation will look in `config/*` for `default.json`. It will be merged with other configuration files in the `config/` folder using the `NODE_ENV` environment variable. So setting `NODE_ENV=production` will merge `config/default.json` with `config/production.json`.

For more information refer to the  [node-config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

## Usage

The `@feathersjs/configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```ts
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'

// Use the application root and `config/` as the configuration folder
const app = feathers().configure(configuration())
```

<BlockQuote type="warning" label="Important">

Direct access to nested config properties is not supported via `app.get()`. To access a nested config property (e.g. `Customer.dbConfig.host`, use `app.get('Customer').dbConfig.host` or `import config from 'config'` directly and use it [as documented](https://github.com/lorenwest/node-config).

</BlockQuote>

## Configuration schema

The application configuration can be validated against a [Feathers schema](./schema/) when [app.setup](./application.md#setupserver) (or `app.listen`) is called by passing a schema when initializing `@feathersjs/configuration`:

```ts
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('avatar')
  })

  await knex.schema.alterTable('messages', (table) => {
    table.bigint('createdAt')
    table.bigint('userId').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar')
  })

  await knex.schema.alterTable('messages', (table) => {
    table.dropColumn('createdAt')
    table.dropColumn('userId')
  })
}
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

> __Note:__ The NODE_CONFIG_DIR environment variable isn’t used directly by @feathersjs/configuration but by the [node-config](https://github.com/lorenwest/node-config) module that it uses. For more information on configuring node-config settings, see the [Configuration Files Wiki page](https://github.com/lorenwest/node-config/wiki/Configuration-Files).
