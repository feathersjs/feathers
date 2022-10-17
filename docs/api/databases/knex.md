---
outline: deep
---

# SQL Databases

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/knex.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/knex)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/knex/CHANGELOG.md)

</Badges>

Support for SQL databases like PostgreSQL, MySQL, MariaDB, SQLite or MSSQL is provided in Feathers via the `@feathersjs/knex` database adapter which uses [KnexJS](https://knexjs.org/). Knex is a fast and flexible query builder for SQL and supports many databases without the overhead of a full blown ORM like Sequelize. It still provides an intuitive syntax and more advanced tooling like migration support.

```bash
$ npm install --save @feathersjs/knex
```

<BlockQuote>

The Knex adapter implements the [common database adapter API](./common) and [querying syntax](./querying).

</BlockQuote>

## API

### `service(options)`

Returns a new service instance initialized with the given options.

```js
const knex = require('knex')
const service = require('feathers-knex')

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
})

// Create the schema
db.schema.createTable('messages', (table) => {
  table.increments('id')
  table.string('text')
})

app.use(
  '/messages',
  service({
    Model: db,
    name: 'messages'
  })
)
app.use('/messages', service({ Model, name, id, events, paginate }))
```

**Options:**

- `Model` (**required**) - The KnexJS database instance
- `name` (**required**) - The name of the table
- `schema` (_optional_) - The name of the schema table prefix (example: `schema.table`)
- `id` (_optional_, default: `'id'`) - The name of the id field property.
- `events` (_optional_) - A list of [custom service events](https://docs.feathersjs.com/api/events.html#custom-events) sent by this service
- `paginate` (_optional_) - A [pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination) containing a `default` and `max` page size
- `multi` (_optional_) - Allow `create` with arrays and `update` and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)
- `whitelist` (_optional_) - A list of additional query parameters to allow (e..g `[ '$regex', '$geoNear' ]`). Default is the supported `operators`

### `adapter.createQuery(query)`

Returns a KnexJS query with the [common filter criteria](https://docs.feathersjs.com/api/databases/querying.html) (without pagination) applied.

### params.knex

When making a [service method](https://docs.feathersjs.com/api/services.html) call, `params` can contain an `knex` property which allows to modify the options used to run the KnexJS query. See [customizing the query](#customizing-the-query) for an example.

## Example

Here's a complete example of a Feathers server with a `messages` SQLite service. We are using the [Knex schema builder](http://knexjs.org/#Schema) and [SQLite](https://sqlite.org/) as the database.

```
$ npm install @feathersjs/feathers @feathersjs/errors @feathersjs/express @feathersjs/socketio feathers-knex knex sqlite3
```

In `app.js`:

```js
const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')

const service = require('feathers-knex')
const knex = require('knex')

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
})

// Create a feathers instance.
const app = express(feathers())
// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }))
// Enable REST services
app.configure(express.rest())
// Enable Socket.io services
app.configure(socketio())
// Create Knex Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use(
  '/messages',
  service({
    Model: db,
    name: 'messages',
    paginate: {
      default: 2,
      max: 4
    }
  })
)
app.use(express.errorHandler())

// Clean up our data. This is optional and is here
// because of our integration tests
db.schema
  .dropTableIfExists('messages')
  .then(() => {
    console.log('Dropped messages table')

    // Initialize your table
    return db.schema.createTable('messages', (table) => {
      console.log('Creating messages table')
      table.increments('id')
      table.string('text')
    })
  })
  .then(() => {
    // Create a dummy Message
    app
      .service('messages')
      .create({
        text: 'Message created on server'
      })
      .then((message) => console.log('Created message', message))
  })

// Start the server.
const port = 3030

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`)
})
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

## Querying

In addition to the [common querying mechanism](https://docs.feathersjs.com/api/databases/querying.html), this adapter also supports:

### $and

Find all records that match all of the given criteria. The following query retrieves all messages that have foo and bar attributes as true.

```js
app.service('messages').find({
  query: {
    $and: [{ foo: true }, { bar: true }]
  }
})
```

Through the REST API:

```
/messages?$and[][foo]=true&$and[][bar]=true
```

### $like

Find all records where the value matches the given string pattern. The following query retrieves all messages that start with `Hello`:

```js
app.service('messages').find({
  query: {
    text: {
      $like: 'Hello%'
    }
  }
})
```

Through the REST API:

```
/messages?text[$like]=Hello%
```

### $notlike

The opposite of `$like`; resulting in an SQL condition similar to this: `WHERE some_field NOT LIKE 'X'`

```js
app.service('messages').find({
  query: {
    text: {
      $notlike: '%bar'
    }
  }
})
```

Through the REST API:

```
/messages?text[$notlike]=%bar
```

### $ilike

For PostgreSQL only, the keywork $ilike can be used instead of $like to make the match case insensitive. The following query retrieves all messages that start with `hello` (case insensitive):

```js
app.service('messages').find({
  query: {
    text: {
      $ilike: 'hello%'
    }
  }
})
```

Through the REST API:

```
/messages?text[$ilike]=hello%
```

## Transaction Support

The Knex adapter comes with three hooks that allows to run service method calls in a transaction. They can be used as application wide (`app.hooks.js`) hooks or per service like this:

```javascript
// A common hooks file
const { hooks } = require('feathers-knex')

const { transaction } = hooks

module.exports = {
  before: {
    all: [transaction.start()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [transaction.end()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [transaction.rollback()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
```

To use the transactions feature, you must ensure that the three hooks (start, end and rollback) are being used.

At the start of any request, a new transaction will be started. All the changes made during the request to the services that are using the `feathers-knex` will use the transaction. At the end of the request, if sucessful, the changes will be commited. If an error occurs, the changes will be forfeit, all the `creates`, `patches`, `updates` and `deletes` are not going to be commited.

The object that contains `transaction` is stored in the `params.transaction` of each request.

> **Important:** If you call another Knex service within a hook and want to share the transaction you will have to pass `context.params.transaction` in the parameters of the service call.

## Customizing the query

In a `find` call, `params.knex` can be passed a KnexJS query (without pagination) to customize the find results.

Combined with `.createQuery({ query: {...} })`, which returns a new KnexJS query with the [common filter criteria](https://docs.feathersjs.com/api/databases/querying.html) applied, this can be used to create more complex queries. The best way to customize the query is in a [before hook](https://docs.feathersjs.com/api/hooks.html) for `find`.

```js
app.service('messages').hooks({
  before: {
    find(context) {
      const query = context.service.createQuery(context.params)

      // do something with query here
      query.orderBy('name', 'desc')

      context.params.knex = query
      return context
    }
  }
})
```

## Configuring migrations

For using knex's migration CLI, we need to make the configuration available by the CLI. We can do that by providing a `knexfile.js` (OR `knexfile.ts` when using TypeScript) in the root folder with the following contents:

knexfile.js

```js
const app = require('./src/app')
module.exports = app.get('postgres')
```

OR

knexfile.ts

```ts
import app from './src/app'
module.exports = app.get('postgres')
```

You will need to replace the `postgres` part with the adapter you are using. You will also need to add a `migrations` key to your feathersjs config under your database adapter. Optionally, add a `seeds` key if you will be using [seeds](http://knexjs.org/#Seeds-CLI).

```js
// src/config/default.json
...
  "postgres": {
    "client": "pg",
    "connection": "postgres://user:password@localhost:5432/database",
    "migrations": {
      "tableName": "knex_migrations"
    },
    "seeds": {
      "directory": "../src/seeds"
    }
  }
```

Then, by running: `knex migrate:make create-users`, a `migrations` directory will be created, with the new migration.

### Error handling

As of version 4.0.0 `feathers-knex` only throws [Feathers Errors](https://docs.feathersjs.com/api/errors.html) with the message. On the server, the original error can be retrieved through a secure symbol via `error[require('feathers-knex').ERROR]`

```js
const { ERROR } = require('feathers-knex')

try {
  await knexService.doSomething()
} catch (error) {
  // error is a FeathersError with just the message
  // Safely retrieve the Knex error
  const knexError = error[ERROR]
}
```

### Waiting for transactions to complete

Sometimes it can be important to know when the transaction has been completed (committed or rolled back). For example, we might want to wait for transaction to complete before we send out any realtime events. This can be done by awaiting on the `transaction.committed` promise which will always resolve to either `true` in case the transaction has been committed, or `false` in case the transaction has been rejected.

```js
app.service('messages').publish((data, context) => {
  const { transaction } = context.params

  if (transaction) {
    const success = await transaction.committed
    if (!success) {
      return []
    }
  }

  return app.channel(`rooms/${data.roomId}`)
})
```

This also works with nested service calls and nested transactions. For example, if a service calls `transaction.start()` and passes the transaction param to a nested service call, which also calls `transaction.start()` in it's own hooks, they will share the top most `committed` promise that will resolve once all of the transactions have succesfully committed.
