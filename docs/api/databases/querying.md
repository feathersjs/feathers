# Querying

All official database adapters support a common way for querying, sorting, limiting and selecting `find` method calls as part of `params.query`. Querying also applies `update`, `patch` and `remove` method calls if the `id` is set to `null`.

> **Important**: When used via REST URLs all query values are strings. Depending on the service the values in `params.query` might have to be converted to the right type in a [before hook](../hooks.md).

## Filters

Filters are special properties (starting with a `$`) added at the top level of a query. They can determine page settings, the properties to select and more.

### `$limit`

`$limit` will return only the number of results you specify:

```js
// Retrieves the first two unread messages
app.service('messages').find({
  query: {
    $limit: 2,
    read: false
  }
});
```

```
GET /messages?$limit=2&read=false
```

> **Pro tip:** With [pagination enabled](common.md#pagination), to just get the number of available records set `$limit` to `0`. This will only run a (fast) counting query against the database and return a page object with the `total` and an empty `data` array.

### `$skip`

`$skip` will skip the specified number of results:

```js
// Retrieves the next two unread messages
app.service('messages').find({
  query: {
    $limit: 2,
    $skip: 2,
    read: false
  }
});
```

```
GET /messages?$limit=2&$skip=2&read=false
```

### `$sort`

`$sort` will sort based on the object you provide. It can contain a list of properties by which to sort mapped to the order (`1` ascending, `-1` descending).


```js
// Find the 10 newest messages
app.service('messages').find({
  query: {
    $limit: 10,
    $sort: {
      createdAt: -1
    }
  }
});
```

```
/messages?$limit=10&$sort[createdAt]=-1
```

### `$select`

`$select` allows to pick which fields to include in the result. This will work for any service method.

```js
// Only return the `text` and `userId` field in a message
app.service('messages').find({
  query: {
    $select: [ 'text', 'userId' ]
  }
});

app.service('messages').get(1, {
  query: {
    $select: [ 'text' ]
  }
});
```

```
GET /messages?$select[]=text&$select[]=userId
GET /messages/1?$select[]=text
```

### `$or`

Find all records that match any of the given criteria.

```js
// Find all messages that are not marked as archived
// or any message from room 2
app.service('messages').find({
  query: {
    $or: [
      { archived: { $ne: true } },
      { roomId: 2 }
    ]
  }
});
```

```
GET /messages?$or[0][archived][$ne]=true&$or[1][roomId]=2
```

## Operators

Operators either query a property for a specific value or determine nested special properties (starting with a `$`) that allow querying the property for certain conditions. When multiple operators are set, conditions have to apply for a property to match.

### Equality

All fields that do not contain special query parameters are compared directly for equality.

```js
// Find all unread messages in room #2
app.service('messages').find({
  query: {
    read: false,
    roomId: 2
  }
});
```

```
GET /messages?read=false&roomId=2
```

### `$in`, `$nin`

Find all records where the property does (`$in`) or does not (`$nin`) match any of the given values. 

```js
// Find all messages in room 2 or 5
app.service('messages').find({
  query: {
    roomId: {
      $in: [ 2, 5 ]
    }
  }
});
```

```
GET /messages?roomId[$in][]=2&roomId[$in][]=5
```

### `$lt`, `$lte`

Find all records where the value is less (`$lt`) or less and equal (`$lte`) to a given value. 

```js
// Find all messages older than a day
const DAY_MS = 24 * 60 * 60 * 1000;

app.service('messages').find({
  query: {
    createdAt: {
      $lt: new Date().getTime() - DAY_MS
    }
  }
});
```

```
GET /messages?createdAt[$lt]=1479664146607
```

### `$gt`, `$gte`

Find all records where the value is more (`$gt`) or more and equal (`$gte`) to a given value. 

```js
// Find all messages within the last day
const DAY_MS = 24 * 60 * 60 * 1000;

app.service('messages').find({
  query: {
    createdAt: {
      $gt: new Date().getTime() - DAY_MS
    }
  }
});
```

```
GET /messages?createdAt[$gt]=1479664146607
```

### `$ne`

Find all records that do not equal the given property value.

```js
// Find all messages that are not marked as archived
app.service('messages').find({
  query: {
    archived: {
      $ne: true
    }
  }
});
```

```
GET /messages?archived[$ne]=true
```

## Search

Searching is not part of the common querying syntax since it is very specific to the database you are using. Many databases already support their own search syntax:

- Regular expressions (converted in a hook) for Mongoose, MongoDB and NeDB. See [this comment](https://github.com/feathersjs/feathers/issues/334#issuecomment-234432108)
  - For MongoDB also see [feathers-mongodb-fuzzy-search](https://www.npmjs.com/package/feathers-mongodb-fuzzy-search)
  - For NeDB also see [feathers-nedb-fuzzy-search](https://www.npmjs.com/package/feathers-nedb-fuzzy-search)
- [$like for Sequelize](http://docs.sequelizejs.com/en/latest/docs/querying/) which can be set as a [normal operator when using `feathers-sequelize`](https://github.com/feathersjs-ecosystem/feathers-sequelize#operators)
- Some database adapters like [KnexJS](https://github.com/feathersjs-ecosystem/feathers-knex), [RethinkDB](https://github.com/feathersjs-ecosystem/feathers-rethinkdb) and [Elasticsearch](https://github.com/feathersjs-ecosystem/feathers-elasticsearch) also support non-standard query parameters which are described in their documentation pages.
- For additional search functionality see [feathers-solr](https://www.npmjs.com/package/feathers-solr)

For further discussions see [this issue](https://github.com/feathersjs/feathers/issues/334).
