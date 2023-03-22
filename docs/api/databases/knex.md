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

### KnexService(options)

`new KnexService(options)` returns a new service instance initialized with the given options. The following example extends the `KnexService` and then uses the `sqliteClient` from the app configuration and provides it to the `Model` option, which is passed to the new `MessagesService`.

```ts
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesQuery } from './messages.schema'

export interface MessagesParams extends KnexAdapterParams<MessagesQuery> {}

export class MessagesService<ServiceParams extends Params = MessagesParams> extends KnexService<
  Messages,
  MessagesData,
  ServiceParams
> {}

export const messages = (app: Application) => {
  const options: KnexAdapterOptions = {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'messages'
  }
  app.use('messages', new MessagesService(options))
}
```

### Options

The Knex specific adapter options are:

- `Model {Knex}` (**required**) - The KnexJS database instance
- `name {string}` (**required**) - The name of the table
- `schema {string}` (_optional_) - The name of the schema table prefix (example: `schema.table`)

The [common API options](./common.md#options) are:

- `id {string}` (_optional_, default: `'_id'`) - The name of the id field property. By design, MongoDB will always add an `_id` property.
- `events {string[]}` (_optional_) - A list of [custom service events](/api/events.html#custom-events) sent by this service
- `paginate {Object}` (_optional_) - A [pagination object](/api/databases/common.html#pagination) containing a `default` and `max` page size
- `multi {string[]|true}` (_optional_) - Allow `create` with arrays and `update` and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)

### getModel([params])

`service.getModel([params])` returns the [Knex](https://knexjs.org/guide/query-builder.html) client for this table.

### db(params)

`service.db([params])` returns the Knex database instance for a request. This will include the `schema` table prefix and use a transaction if passed in `params`.

### createQuery(params)

`service.createQuery(params)` returns a query builder for a service request, including all conditions matching the query syntax. This method can be overriden to e.g. [include associations](#associations) or used in a hook customize the query and then passing it to the service call as [params.knex](#paramsknex).

```ts
app.service('messages').hooks({
  before: {
    find: [
      async (context: HookContext) => {
        const query = context.service.createQuery(context.params)

        // do something with query here
        query.orderBy('name', 'desc')

        context.params.knex = query
      }
    ]
  }
})
```

### params.knex

When making a [service method](https://docs.feathersjs.com/api/services.html) call, `params` can contain an `knex` property which allows to modify the options used to run the KnexJS query. See [createQuery](#createqueryparams) for an example.

## Querying

In addition to the [common querying mechanism](./querying.md), this adapter also supports the following operators. Note that these operators need to be added for each query-able property to the [TypeBox query schema](../schema/typebox.md#query-schemas) or [JSON query schema](../schema/schema.md#querysyntax) like this:

```ts
const messageQuerySchema = Type.Intersect(
  [
    // This will additionally allow querying for `{ name: { $ilike: 'Dav%' } }`
    querySyntax(messageQueryProperties, {
      name: {
        $ilike: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object({})
  ],
  { additionalProperties: false }
)
```

### $like

Find all records where the value matches the given string pattern. The following query retrieves all messages that start with `Hello`:

```ts
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

```ts
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

```ts
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

## Search

Basic search can be implemented with the [query operators](#querying).

## Associations

While [resolvers](../schema/resolvers.md) offer a reasonably performant way to fetch associated entities, it is also possible to join tables to populate and query related data. This can be done by overriding the [createQuery](#createqueryparams) method and using the [Knex join methods](https://knexjs.org/guide/query-builder.html#join) to join the tables of related services.

### Querying

Considering a table like this:

```ts
await db.schema.createTable('todos', (table) => {
  table.increments('id')
  table.string('text')
  table.bigInteger('personId').references('id').inTable('people').notNullable()
  return table
})
```

To query based on properties from the `people` table, join the tables you need in `createQuery` like this:

```ts
class TodoService<ServiceParams = KnexAdapterParams<TodoQuery>> extends KnexService<Todo> {
  createQuery(params: KnexAdapterParams<AdapterQuery>) {
    const query = super.createQuery(params)

    query.join('people as person', 'todos.personId', 'person.id')

    return query
  }
}
```

This will alias the table name from `people` to `person` (since our Todo only has a single person) and then allow to query all related properties as dot separated properties like `person.name`, including the [Feathers query syntax](./querying.md):

```ts
// Find the Todos for all Daves older than 100
app.service('todos').find({
  query: {
    'person.name': 'Dave',
    'person.age': { $gt: 100 }
  }
})
```

Note that in most applications, the query-able properties have to explicitly be added to the [TypeBox query schema](../schema/typebox.md#query-schemas) or [JSON query schema](../schema/schema.md#querysyntax). Support for the query syntax for a single property can be added with the `queryProperty` helper:

```ts
import { queryProperty } from '@feathersjs/typebox'

export const todoQueryProperties = Type.Pick(userSchema, ['text'])
export const todoQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        // Only query the name for strings
        'person.name': Type.String(),
        // Support the query syntax for the age
        'person.age': queryProperty(Type.Number())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
```

### Populating

Related properties from the joined table can be added as aliased properties with [query.select](https://knexjs.org/guide/query-builder.html#select):

```ts
class TodoService<ServiceParams = KnexAdapterParams<TodoQuery>> extends KnexService<Todo> {
  createQuery(params: KnexAdapterParams<AdapterQuery>) {
    const query = super.createQuery(params)

    query
      .join('people as person', 'todos.personId', 'person.id')
      // This will add a `personName` property
      .select('person.name as personName')
      // This will add a `person.age' property
      .select('person.age')

    return query
  }
}
```

<BlockQuote type="warning" label="important">

Since SQL does not have a concept of nested objects, joined properties will be dot separated strings, **not nested objects**. Conversion can be done by e.g. using Lodash `_.set` in a [resolver converter](../schema/resolvers.md#options).

</BlockQuote>

This works well for individual properties, however if you require the complete (and safe) representation of the entire related data, use a [resolver](../schema/resolvers.md) instead.

## Transactions

The Knex adapter comes with three hooks that allows to run service method calls in a transaction. They can be used as application wide hooks or per service like this:

```ts
import { transaction } from '@feathersjs/knex'

// A configure function that registers the service and its hooks via `app.configure`
export const message = (app: Application) => {
  // Register our service on the Feathers application
  app.use('messages', new MessageService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service('messages').hooks({
    around: {
      all: []
    },
    before: {
      all: [transaction.start()],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: []
    },
    after: {
      all: [transaction.end()]
    },
    error: {
      all: [transaction.rollback()]
    }
  })
}
```

To use the transactions feature, you must ensure that the three hooks (start, end and rollback) are being used.

At the start of any request, a new transaction will be started. All the changes made during the request to the services that are using knex will use the transaction. At the end of the request, if sucessful, the changes will be commited. If an error occurs, the changes will be forfeit, all the `creates`, `patches`, `updates` and `deletes` are not going to be commited.

The object that contains `transaction` is stored in the `params.transaction` of each request.

<BlockQuote type="warning" label="Important">

If you call another Knex service within a hook and want to share the transaction you will have to pass `context.params.transaction` in the parameters of the service call.

</BlockQuote>

Sometimes it can be important to know when the transaction has been completed (committed or rolled back). For example, we might want to wait for transaction to complete before we send out any realtime events. This can be done by awaiting on the `transaction.committed` promise which will always resolve to either `true` in case the transaction has been committed, or `false` in case the transaction has been rejected.

```ts
app.service('messages').publish(async (data, context) => {
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

## Error handling

The adapter only throws [Feathers Errors](https://docs.feathersjs.com/api/errors.html) with the message to not leak sensitive information to a client. On the server, the original error can be retrieved through a secure symbol via `import { ERROR } from '@feathersjs/knex'`

```ts
import { ERROR } from 'feathers-knex'

try {
  await knexService.doSomething()
} catch (error: any) {
  // error is a FeathersError with just the message
  // Safely retrieve the Knex error
  const knexError = error[ERROR]
}
```

## Migrations

In a generated application, migrations are already set up. See the [CLI guide](../../guides/cli/knexfile.md) and the [KnexJS migrations documentation](https://knexjs.org/guide/migrations.html) for more information.
