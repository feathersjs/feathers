---
outline: deep
---

# MongoDB

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/mongodb.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/mongodb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/mongodb/CHANGELOG.md)

</Badges>

A [Feathers](https://feathersjs.com) service adapter MongoDB.

```bash
$ npm install --save @feathersjs/mongodb
```

<BlockQuote>

The MongoDB adapter implements the [common database adapter API](./common) and [querying syntax](./querying).

</BlockQuote>

## API

### `service([options])`

## Validating MongoDB Data

### Using Resolvers

The simplest way to convert ObjectIds is to make a resolver.

```ts
import { ObjectId } from 'mongodb'

// Resolver for the basic data model (e.g. creating new entries)
export const commentsDataResolver = resolve<commentsData, HookContext>({
  schema: commentsDataSchema,
  validate: false,
  properties: {
    text: { type: 'string' },
    userId: async (value) => {
      return value ? new ObjectId(value) : value
    }
  }
})
```

### Using a Custom AJV Instance

All [Feathers schemas](/api/schema/schema) share an implicit AJV instance by default.

It's possible to validate MongoDB ObjectIds and dates with AJV, as well. This is more complicated than using resolvers, but can also handle the full query syntax. You can create a custom AJV instance with extra formatters attached.

#### Custom AJV Instance

Here's an example of a custom AJV instance, which could be placed in `src/schemas/ajv.ts` and referenced by all other services.

```ts
import Ajv, { AnySchemaObject } from 'ajv'
import addFormats from 'ajv-formats'
import { ObjectId } from 'mongodb'

export { type Infer, validateData, validateQuery, schema, queryProperty } from '@feathersjs/schema'

// Reusable `convert` keyword.
const keywordConvert = {
  keyword: 'convert',
  type: 'string',
  compile(schemaVal: boolean, parentSchema: AnySchemaObject) {
    if (!schemaVal) return () => true

    // Update date-time string to Date object
    if (['date-time', 'date'].includes(parentSchema.format)) {
      return function (value: string, obj: any) {
        const { parentData, parentDataProperty } = obj
        console.log(value)
        parentData[parentDataProperty] = new Date(value)
        return true
      }
    }
    // Update objectid string to ObjectId
    else if (parentSchema.format === 'objectid') {
      return function (value: string, obj: any) {
        const { parentData, parentDataProperty } = obj
        // Update date-time string to Date object
        parentData[parentDataProperty] = new ObjectId(value)
        return true
      }
    }
    return () => true
  }
} as const

// Reusable `ObjectId` Formatter
const formatObjectId = {
  type: 'string',
  validate: (id: string | ObjectId) => {
    if (ObjectId.isValid(id)) {
      if (String(new ObjectId(id)) === id) return true
      return false
    }
    return false
  }
} as const

// Create a custom AJV
export const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  schemas: []
})
addFormats(ajv)
ajv.addKeyword(keywordConvert)
ajv.addFormat('objectid', formatObjectId)

// Create a custom AJV instance that doesn't coerce types
export const ajvNoCoerce = new Ajv({
  coerceTypes: false,
  useDefaults: true,
  schemas: []
})
addFormats(ajvNoCoerce)
ajvNoCoerce.addKeyword(keywordConvert)
ajvNoCoerce.addFormat('objectid', formatObjectId)
```

#### Pass the Custom AJV Instance to `schema`

Once created, all service schema files should use the custom AJV instance. Here's an example:

```ts
// Schema for the data that is being returned
export const connectionsResultSchema = schema(
  {
    $id: 'ConnectionsResult',
    type: 'object',
    additionalProperties: false,
    required: ['_id'],
    properties: {
      ...common,
      _id: {
        anyOf: [
          { type: 'string', format: 'objectid', convert: true },
          { type: 'object' } // ObjectId
        ]
      },
      createdAt: { type: 'string', format: 'date-time', convert: true }
    }
  } as const,
  ajv
)
```

## Common Pitfalls

Here are a couple of errors you might run into while using validators.

### unknown keyword: "convert"

You'll see an error like `"Error: strict mode: unknown keyword: "convert"` in a few scenarios:

- You fail to [Pass the Custom AJV Instance to every `schema`](#pass-the-custom-ajv-instance-to-schema). If you're using a custom AJV instance, be sure to provide it to **every** place where you call `schema()`.
- You try to use custom keywords in your schema without registering them, first.
- You make a typo in your schema. For example, it's common to forget to accidentally mis-document arrays and collapse the item `properties` up one level.

### unknown format "date-time"

You'll see an error like `Error: unknown format "date-time" ignored in schema at path "#/properties/createdAt"` in a few scenarios.

- You're attempting to use a formatter not built into AJV.
- You fail to [Pass the Custom AJV Instance to every `schema`](#pass-the-custom-ajv-instance-to-schema). If you're using a custom AJV instance, be sure to provide it to **every** place where you call `schema()`.

## API

### `service(options)`

Returns a new service instance initialized with the given options. `Model` has to be a MongoDB collection.

```js
const MongoClient = require('mongodb').MongoClient
const service = require('feathers-mongodb')

MongoClient.connect('mongodb://localhost:27017/feathers').then((client) => {
  app.use(
    '/messages',
    service({
      Model: client.db('feathers').collection('messages')
    })
  )
  app.use('/messages', service({ Model, id, events, paginate }))
})
```

**Options:**

- `Model` (**required**) - The MongoDB collection instance
- `id` (_optional_, default: `'_id'`) - The name of the id field property. By design, MongoDB will always add an `_id` property.
- `disableObjectify` (_optional_, default `false`) - This will disable the objectify of the id field if you want to use normal strings
- `events` (_optional_) - A list of [custom service events](https://docs.feathersjs.com/api/events.html#custom-events) sent by this service
- `paginate` (_optional_) - A [pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination) containing a `default` and `max` page size
- `whitelist` (_optional_) - A list of additional query parameters to allow (e..g `[ '$regex', '$geoNear' ]`)
- `multi` (_optional_) - Allow `create` with arrays and `update` and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)
- `useEstimatedDocumentCount` (_optional_, default `false`) - If `true` document counting will rely on `estimatedDocumentCount` instead of `countDocuments`

### params.mongodb

When making a [service method](https://docs.feathersjs.com/api/services.html) call, `params` can contain an `mongodb` property (for example, `{upsert: true}`) which allows to modify the options used to run the MongoDB query.

#### Transactions

You can utilized a [MongoDB Transactions](https://docs.mongodb.com/manual/core/transactions/) by passing a `session` with the `params.mongodb`:

```js
import { ObjectID } from 'mongodb'

export default async app => {
  app.use('/fooBarService', {
    async create(data) {
      // assumes you have access to the mongoClient via your app state
      let session = app.mongoClient.startSession()
      try {
        await session.withTransaction(async () => {
            let fooID = new ObjectID()
            let barID = new ObjectID()
            app.service('fooService').create(
              {
                ...data,
                _id: fooID,
                bar: barID,
              },
              { mongodb: { session } },
            )
            app.service('barService').create(
              {
                ...data,
                _id: barID
                foo: fooID
              },
              { mongodb: { session } },
            )
        })
      } finally {
        await session.endSession()
      }
    }
  })
}
```

## Example

Here is an example of a Feathers server with a `messages` endpoint that writes to the `feathers` database and the `messages` collection.

```
$ npm install @feathersjs/feathers @feathersjs/errors @feathersjs/express @feathersjs/socketio feathers-mongodb mongodb
```

In `app.js`:

```js
const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')

const MongoClient = require('mongodb').MongoClient
const service = require('feathers-mongodb')

// Create an Express compatible Feathers application instance.
const app = express(feathers())
// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }))
// Enable REST services
app.configure(express.rest())
// Enable Socket.io
app.configure(socketio())

// Connect to the db, create and register a Feathers service.
app.use(
  '/messages',
  service({
    paginate: {
      default: 2,
      max: 4
    }
  })
)

// A basic error handler, just like Express
app.use(express.errorHandler())

// Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/feathers')
  .then(function (client) {
    // Set the model now that we are connected
    app.service('messages').Model = client.db('feathers').collection('messages')

    // Now that we are connected, create a dummy Message
    app
      .service('messages')
      .create({
        text: 'Message created on server'
      })
      .then((message) => console.log('Created message', message))
  })
  .catch((error) => console.error(error))

// Start the server.
const port = 3030

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`)
})
```

## Querying

Additionally to the [common querying mechanism](https://docs.feathersjs.com/api/databases/querying.html) this adapter also supports [MongoDB's query syntax](https://docs.mongodb.com/v3.2/tutorial/query-documents/) and the `update` method also supports MongoDB [update operators](https://docs.mongodb.com/v3.2/reference/operator/update/).

> **Important:** External query values through HTTP URLs may have to be converted to the same type stored in MongoDB in a before [hook](https://docs.feathersjs.com/api/hooks.html) otherwise no matches will be found. Websocket requests will maintain the correct format if it is supported by JSON (ObjectIDs and dates still have to be converted).

For example, an `age` (which is a number) a hook like this can be used:

```js
const ObjectID = require('mongodb').ObjectID

app.service('users').hooks({
  before: {
    find(context) {
      const { query = {} } = context.params

      if (query.age !== undefined) {
        query.age = parseInt(query.age, 10)
      }

      context.params.query = query

      return Promise.resolve(context)
    }
  }
})
```

Which will allows queries like `/users?_id=507f1f77bcf86cd799439011&age=25`.

## Collation Support

This adapter includes support for [collation and case insensitive indexes available in MongoDB v3.4](https://docs.mongodb.com/manual/release-notes/3.4/#collation-and-case-insensitive-indexes). Collation parameters may be passed using the special `collation` parameter to the `find()`, `remove()` and `patch()` methods.

### Example: Patch records with case-insensitive alphabetical ordering

The example below would patch all student records with grades of `'c'` or `'C'` and above (a natural language ordering). Without collations this would not be as simple, since the comparison `{ $gt: 'c' }` would not include uppercase grades of `'C'` because the code point of `'C'` is less than that of `'c'`.

```js
const patch = { shouldStudyMore: true };
const query = { grade: { $gte: 'c' } };
const collation = { locale: 'en', strength: 1 };
students.patch(null, patch, { query, collation }).then( ... );
```

### Example: Find records with a case-insensitive search

Similar to the above example, this would find students with a grade of `'c'` or greater, in a case-insensitive manner.

```js
const query = { grade: { $gte: 'c' } };
const collation = { locale: 'en', strength: 1 };
students.find({ query, collation }).then( ... );
```

For more information on MongoDB's collation feature, visit the [collation reference page](https://docs.mongodb.com/manual/reference/collation/).

## Search
