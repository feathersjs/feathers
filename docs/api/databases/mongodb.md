---
outline: deep
---

# MongoDB

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/mongodb.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/mongodb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/mongodb/CHANGELOG.md)

</Badges>

Support for MongoDB is provided in Feathers via the `@feathersjs/mongodb` database adapter which uses the [MongoDB Client for Node.js](https://www.npmjs.com/package/mongodb). The adapter uses the [MongoDB Aggregation Framework](https://www.mongodb.com/docs/manual/aggregation/), internally, and enables using Feathers' friendly syntax with the full power of [aggregation operators](https://www.mongodb.com/docs/manual/meta/aggregation-quick-reference/). The adapter automatically uses the [MongoDB Query API](https://www.mongodb.com/docs/drivers/node/current/quick-reference/) when you need features like [Collation](https://www.mongodb.com/docs/drivers/node/current/fundamentals/collations/).

```bash
$ npm install --save @feathersjs/mongodb
```

<BlockQuote>

The MongoDB adapter implements the [common database adapter API](./common) and [querying syntax](./querying).

</BlockQuote>

## API

### `MongoDBService(options)`

`new MongoDBService(options)` returns a new service instance initialized with the given options. The following example extends the `MongoDBService` and then uses the `mongodbClient` from the app configuration and provides it to the `Model` option, which is passed to the new `MessagesService`.

```ts
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesQuery } from './messages.schema'

export interface MessagesParams extends MongoDBAdapterParams<MessagesQuery> {}

export class MessagesService<ServiceParams extends Params = MessagesParams> extends MongoDBService<
  Messages,
  MessagesData,
  ServiceParams
> {}

export const messages = (app: Application) => {
  const options: MongoDBAdapterOptions = {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('messages'))
  }
  app.use('messages', new MessagesService(options))
}
```

Here's an overview of the `options` object:

### Options

MongoDB adapter specific options are:

- `Model {Promise<MongoDBCollection>}` (**required**) - A Promise that resolves with the MongoDB collection instance. This can also be the return value of an `async` function without `await`
- `disableObjectify {boolean}` (_optional_, default `false`) - This will disable conversion of the id field to a MongoDB ObjectID if you want to e.g. use normal strings
- `useEstimatedDocumentCount {boolean}` (_optional_, default `false`) - If `true` document counting will rely on `estimatedDocumentCount` instead of `countDocuments`

The [common API options](./common.md#options) are:

- `id {string}` (_optional_, default: `'_id'`) - The name of the id field property. By design, MongoDB will always add an `_id` property. But you can choose to use a different property as your primary key.
- `paginate {Object}` (_optional_) - A [pagination object](#pagination) containing a `default` and `max` page size
- `multi {string[]|boolean}` (_optional_, default: `false`) - Allow `create` with arrays and `patch` and `remove` with id `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)

There are additionally several legacy options in the [common API options](./common.md#options)

### getModel()

`getModel([params])` returns a Promise that resolves with the MongoDB collection object. The optional `params` is the service parameters which may allow to override the collection via [params.adapter](./common.md#paramsadapter).

### aggregateRaw(params)

The `find` method has been split into separate utilities for converting params into different types of MongoDB requests. When using `params.pipeline`, the `aggregateRaw` method is used to convert the Feathers params into a MongoDB aggregation pipeline with the `model.aggregate` method. This method returns a raw MongoDB Cursor object, which can be used to perform custom pagination or in custom server scripts, if desired.

### findRaw(params)

`findRaw(params)` This method is used when there is no `params.pipeline` and uses the common `model.find` method. It returns a raw MongoDB Cursor object, which can be used to perform custom pagination or in custom server scripts, if desired.

### makeFeathersPipeline(params)

`makeFeathersPipeline(params)` takes a set of Feathers params and converts them to a pipeline array, ready to pass to `model.aggregate`. This utility comprises the bulk of the `aggregateRaw` functionality, but does not use `params.pipeline`.

### Custom Params

The `@feathersjs/mongodb` adapter utilizes three custom params which control adapter-specific features: `params.pipeline`, `params.mongodb`, and `params.adapter`. As mentioned [here](/api/services#params), these custom params are not intended to be used directly from the client. Directly exposing `params.pipeline` or `params.mongodb` to the client directly would expose the entire database to the client through powerful pipeline queries.

#### params.adapter

Allows to dynamically set the [adapter options](#options) (like the `Model` collection) for a service method call.

#### params.pipeline

Used for [aggregation pipelines](#aggregation-pipeline). Whenever this property is set, the adapter will use the `model.aggregate` method instead of the `model.find` method. The `pipeline` property should be an array of [aggregation stages](https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/).

#### params.mongodb

When making a [service method](/api/services.md) call, `params` can contain an`mongodb` property (for example, `{ upsert: true }`) which allows modifying the options used to run the MongoDB query. This param can be used for both find and aggregation queries.

## Transactions

[MongoDB Transactions](https://docs.mongodb.com/manual/core/transactions/) can be used by passing a `session` in [params.mongodb](#paramsmongodb). For example in a [hook](../hooks.md):

```ts
import { ObjectId } from 'mongodb'
import { HookContext } from '../declarations'

export const myHook = async (context: HookContext) => {
  const { app } = context
  const session = app.get('mongoClient').startSession()

  try {
    await session.withTransaction(async () => {
      const fooData = { message: 'Data for foo' }
      const barData = { text: 'Data for bar' }

      await app.service('fooService').create(fooData, {
        mongodb: { session }
      })
      await app.service('barService').create(barData, {
        mongodb: { session }
      })
    })
  } finally {
    await session.endSession()
  }
}
```

## Indexes

Indexes and unique constraints can be added to the `Model` Promise, usually in the `getOptions` in `<service>.class`:

```ts
export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app
      .get('mongodbClient')
      .then((db) => db.collection('myservice'))
      .then((collection) => {
        collection.createIndex({ email: 1 }, { unique: true })

        return collection
      })
  }
}
```

<BlockQuote type="info">

Note that creating indexes for an existing collection with many entries should be done as a separate operation instead. See the [MongoDB createIndex documentation](https://www.mongodb.com/docs/manual/reference/method/db.collection.createIndex/) for more information.

</BlockQuote>

## Querying

Additionally to the [common querying mechanism](./querying.md) this adapter also supports [MongoDB's query syntax](https://www.mongodb.com/docs/manual/tutorial/query-documents/) and the `update` method also supports MongoDB [update operators](https://www.mongodb.com/docs/manual/reference/operator/update/).

## Search

<BlockQuote type="warning" label="Important">

Note that in a normal application all MongoDB specific operators have to explicitly be added to the [TypeBox query schema](../schema/typebox.md#query-schemas) or [JSON query schema](../schema/schema.md#querysyntax).

</BlockQuote>

There are two ways to perform search queries with MongoDB:

- Perform basic Regular Expression matches using the `$regex` filter.
- Perform full-text search using the `$search` filter.

### Basic Regex Search

You can perform basic search using regular expressions with the `$regex` operator. Here's an example query.

```js
{
  text: { $regex: 'feathersjs', $options: 'igm' },
}
```

### Full-Text Search

See the MongoDB documentation for instructions on performing full-text search using the `$search` operator:

- Perform [full-text queries on self-hosted MongoDB](https://www.mongodb.com/docs/manual/core/link-text-indexes/).
- Perform [full-text queries on MongoDB Atlas](https://www.mongodb.com/docs/atlas/atlas-search/) (MongoDB's first-party hosted database).
- Perform [full-text queries with the MongoDB Pipeline](https://www.mongodb.com/docs/manual/tutorial/text-search-in-aggregation/)

## Aggregation Pipeline

In Feathers v5 Dove, we added support for the full power of MongoDB's Aggregation Framework and blends it seamlessly with the familiar Feathers Query syntax. The `find` method automatically uses the aggregation pipeline when `params.pipeline` is set.

The Aggregation Framework is accessed through the mongoClient's `model.aggregate` method, which accepts an array of "stages". Each stage contains an operator which describes an operation to apply to the previous step's data. Each stage applies the operation to the results of the previous step. It’s now possible to perform any of the [Aggregation Stages](https://www.mongodb.com/docs/upcoming/reference/operator/aggregation-pipeline/) like `$lookup` and `$unwind`, integration with the normal Feathers queries.

Here's how it works with the operators that match the Feathers Query syntax. Let's convert the following Feathers query:

```ts
const query = {
  text: { $regex: 'feathersjs', $options: 'igm' },
  $sort: { createdAt: -1 },
  $skip: 20,
  $limit: 10
}
```

The above query looks like this when converted to aggregation pipeline stages:

```ts
;[
  // returns the set of records containing the word "feathersjs"
  { $match: { text: { $regex: 'feathersjs', $options: 'igm' } } },
  // Sorts the results of the previous step by newest messages, first.
  { $sort: { createdAt: -1 } },
  // Skips the first 20 records of the previous step
  { $skip: 20 },
  // returns the next 10 records
  { $limit: 10 }
]
```

### Pipeline Queries

You can use the `params.pipeline` array to append additional stages to the query. This next example uses the `$lookup` operator together with the `$unwind` operator to populate a `user` attribute onto each message based on the message's `userId` property.

```ts
const result = await app.service('messages').find({
  query: { $sort: { name: 1 } },
  pipeline: [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user' } }
  ],
  paginate: false
})
```

### Aggregation Stages

In the example, above, the `query` is added to the pipeline, first. Then additional stages are added in the `pipeline` option:

- The `$lookup` stage creates an array called `user` which contains any matches in `message.userId`, so if `userId` were an array of ids, any matches would be in the `users` array. However, in this example, the `userId` is a single id, so...
- The `$unwind` stage turns the array into a single `user` object.

The above is like doing a join, but without the data transforming overhead like you'd get with an SQL JOIN. If you have properly applied index to your MongoDB collections, the operation will typically execute extremely fast for a reasonable amount of data.

A couple of other notable query stages:

- `$graphLookup` lets you recursively pull in a tree of data from a single collection.
- `$search` lets you do full-text search on fields

All stages of the pipeline happen directly on the MongoDB server.

Read through the full list of supported stages [in the MongoDB documentation](https://www.mongodb.com/docs/upcoming/reference/operator/aggregation-pipeline/).

### The `$feathers` Stage

The previous section showed how to append stages to a query using `params.pipeline`. Well, `params.pipeline` also supports a custom `$feathers` operator/stage which allows you to specify exactly where in the pipeline the Feathers Query gets injected.

### Example: Proxy Permissions

Imagine a scenario where you want to query the `pages` a user can edit by referencing a `permissions` collection to find out which pages the user can actually edit. Each record in the `permissions` record has a `userId` and a `pageId`. So we need to find and return only the pages to which the user has access by calling `GET /pages` from the client.

We could put the following query in a hook to pull the correct `pages` from the database in a single query THROUGH the permissions collection. Remember, the request is coming in on the `pages` service, but we're going to query for pages `through` the permissions collection. Assume we've already authenticated the user, so the user will be found at `context.params.user`.

```ts
// Assume this query on the client
const pages = await app.service('pages').find({ query: {} })

// And put this query in a hook to populate pages "through" the permissions collection
const result = await app.service('permissions').find({
  query: {},
  pipeline: [
    // query all permissions records which apply to the current user
    {
      $match: { userId: context.params.user._id }
    },
    // populate the pageId onto each `permission` record, as an array containing one page
    {
      $lookup: {
        from: 'pages',
        localField: 'pageId',
        foreignField: '_id',
        as: 'page'
      }
    },
    // convert the `page` array into an object, so now we have an array of permissions with permission.page on each.
    {
      $unwind: { path: '$page' }
    },
    // Add a permissionId to each page
    {
      $addFields: {
        'page.permissionId': '$_id'
      }
    },
    // discard the permission and only keep the populated `page`, and bring it top level in the array
    {
      $replaceRoot: { newRoot: '$page' }
    },
    // apply the feathers query stages to the aggregation pipeline.
    // now the query will apply to the pages, since we made the pages top level in the previous step.
    {
      $feathers: {}
    }
  ],
  paginate: false
})
```

Notice the `$feathers` stage in the above example. It will apply the query to that stage in the pipeline, which allows the query to apply to pages even though we had to make the query through the `permissions` service.

If we were to express the above query with JavaScript, the final result would the same as with the following example:

```ts
// perform a db query to get the permissions
const permissions = await context.app.service('permissions').find({
  query: {
    userId: context.params.user._id
  },
  paginate: false
})
// make a list of pageIds
const pageIds = permissions.map((permission) => permission.pageId)
// perform a db query to get the pages with matching `_id`
const pages = await context.app.service('pages').find({
  query: {
    _id: {
      $in: pageIds
    }
  },
  paginate: false
})
// key the permissions by pageId for easy lookup
const permissionsByPageId = permissions.reduce((byId, current) => {
  byId[current.pageId] = current
  return byId
}, {})
// Add the permissionId to each `page` record.
const pagesWithPermissionId = pages.map((page) => {
  page.permissionId = permissionByPageId[page._id]._id
  return page
})
// And now apply the original query, whatever the client may have sent, to the pages.
// It might require another database query
```

Both examples look a bit complex, but te one using aggregation stages will be much quicker because all stages run in the database server. It will also be quicker because it all happens in a single database query!

One more obstacle for using JavaScript this way is that if the user's query changed (from the front end), we would likely be required to edit multiple different parts of the JS logic in order to correctly display results. With the pipeline example, above, the query is very cleanly applied.

## Collation

This adapter includes support for [collation and case insensitive indexes available in MongoDB v3.4](https://docs.mongodb.com/manual/release-notes/3.4/#collation-and-case-insensitive-indexes). Collation parameters may be passed using the special `collation` parameter to the `find()`, `remove()` and `patch()` methods.

**Example: Patch records with case-insensitive alphabetical ordering**

The example below would patch all student records with grades of `'c'` or `'C'` and above (a natural language ordering). Without collations this would not be as simple, since the comparison `{ $gt: 'c' }` would not include uppercase grades of `'C'` because the code point of `'C'` is less than that of `'c'`.

```ts
const patch = { shouldStudyMore: true }
const query = { grade: { $gte: 'c' } }
const collation = { locale: 'en', strength: 1 }
const patchedStudent = await students.patch(null, patch, { query, collation })
```

**Example: Find records with a case-insensitive search**

Similar to the above example, this would find students with a grade of `'c'` or greater, in a case-insensitive manner.

```ts
const query = { grade: { $gte: 'c' } }
const collation = { locale: 'en', strength: 1 }

const collatedStudents = await students.find({ query, collation })
```

For more information on MongoDB's collation feature, visit the [collation reference page](https://docs.mongodb.com/manual/reference/collation/).

## ObjectIds

MongoDB uses [ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/) object as primary keys. To store them in the right format they have to be converted from and to strings.

### AJV keyword

To validate and convert strings to an object id using AJV, the `keywordObjectId` [AJV keyword](https://ajv.js.org/api.html#ajv-addkeyword-definition-string-object-ajv) helper can be used. It is set up automatically in a generated application using MongoDB.

```ts
import { keywordObjectId } from '@feathersjs/mongodb'

const validator = new Ajv()

validator.addKeyword(keywordObjectId)
```

### ObjectIdSchema

Both, `@feathersjs/typebox` and `@feathersjs/schema` export an `ObjectIdSchema` helper that creates a schema which can be both, a MongoDB ObjectId or a string that will be converted with the `objectid` keyword:

```ts
import { ObjectIdSchema } from '@feathersjs/typebox' // or '@feathersjs/schema'

const typeboxSchema = Type.Object({
  userId: ObjectIdSchema()
})

const jsonSchema = {
  type: 'object',
  properties: {
    userId: ObjectIdSchema()
  }
}
```

<BlockQuote label="Important" type="warning">

The `ObjectIdSchema` helper will only work when the [`objectid` AJV keyword](#ajv-keyword) is registered.

</BlockQuote>

### ObjectId resolvers

While the AJV format checks if an object id is valid, it still needs to be converted to the right type. An alternative the the [AJV converter](#ajv-converter) is to use [Feathers resolvers](../schema/resolvers.md). The following [property resolver](../schema/resolvers.md) helpers can be used.

<BlockQuote type="warning" label="Important">

ObjectId resolvers do not need to be used when using the [AJV keyword](#ajv-keyword). They are useful however when using another JSON schema validation library.

</BlockQuote>

#### resolveObjectId

`resolveObjectId` resolves a property as an object id. It can be used as a direct property resolver or called with the original value.

```ts
import { resolveObjectId } from '@feathersjs/mongodb'

export const messageDataResolver = resolve<Message, HookContext>({
  properties: {
    userId: resolveObjectId
  }
})

export const messageDataResolver = resolve<Message, HookContext>({
  properties: {
    userId: async (value, _message, context) => {
      // If the user is an admin, allow them to create messages for other users
      if (context.params.user.isAdmin && value !== undefined) {
        return resolveObjectId(value)
      }
      // Otherwise associate the record with the id of the authenticated user
      return context.params.user._id
    }
  }
})
```

#### resolveQueryObjectId

`resolveQueryObjectId` allows to query for object ids. It supports conversion from a string to an object id as well as conversion for values from the [$in, $nin and $ne query syntax](./querying.md).

```ts
import { resolveQueryObjectId } from '@feathersjs/mongodb'

export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  properties: {
    userId: resolveQueryObjectId
  }
})
```

## Dates

While MongoDB has a native `Date` type, the most reliable way to deal with dates is to send and store them as UTC millisecond timestamps e.g. returned by [Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now) or [new Date().getTime()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) which is also used in the [Feathers getting started guide](../../guides/basics/generator.md). This has a few advantages:

- No conversion between different string types
- No timezone and winter/summer time issues
- Easier calculations and query-ability
