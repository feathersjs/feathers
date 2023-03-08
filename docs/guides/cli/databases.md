---
outline: deep
---

# Databases

<hr/>
<DatabaseSelect />

## Connection

<DatabaseBlock global-id="sql">

Depending on the SQL database you selected, a `src/<database>.ts` file will be created that sets up a connection using [KnexJS](../../api/databases/knex.md). It uses the connection settings from the `<database>` [configuration value](./default.json.md) and exports a [configure function](./app.md#configure-functions) that initializes the database connection. The Knex connection object is then accessible wherever you have access to the [app object](./app.md) via

```ts
const knex = app.get('<database>Client')
```

The database pool size can be set in the [configuration](./default.json.md) like this:

```json
"postgresql": {
  "client": "pg",
  "connection": "<pg connection string>",
  "pool": {
    "min": 0,
    "max": 7
  }
},
```

`connection` can also be an object instead of a connection string:

```json
"postgresql": {
  "client": "pg",
  "connection": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "postgres",
    "database": "pgtest"
  }
}
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

`src/mongodb.ts` exports a [configure function](./app.md#configure-functions) that connects to the MongoDB connection string set as `mongodb` in your [configuration](./default.json.md). The [MongoDB NodeJS client](https://www.mongodb.com/languages/mongodb-with-nodejs) is then accessible wherever you have access to the [app object](./app.md) via

```ts
const db = await app.get('mongodbClient')
```

The default connection string tries to connect to a local MongoDB instance with no password. To use e.g. [MongoDB Atlas](https://www.mongodb.com/cloud) change the `mongodb` property in `config/default.json` or add it as an [environment variable](./configuration.md#environment-variables) with the connection string that will look similar to this:

```
mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority
```

</DatabaseBlock>

## Models

<DatabaseBlock global-id="sql">

KnexJS does not have a concept of models. Instead a new service is initialized with the table name and `app.get('<database>Client')` as the connection. For more information on how to create custom queries and more, see the [SQL database adapter API documentation](../../api/databases/knex.md).

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

The collection for a MongoDB service can be accessed via

```ts
const userCollection = await app.service('users').getModel()
```

See the [MongoDB service API documentation](../../api/databases/mongodb.md) for more information.

</DatabaseBlock>
