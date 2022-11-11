# Databases

## SQL

### Connection

Depending on the SQL database you selected, a `src/<database>.ts` file will be created that sets up a connection using [KnexJS](../../api/databases/knex.md). It uses the connection settings from the `<database>` [configuration value](./config.md#app-configuration) and exports a [configure function](./application.md#configure-functions) that initializes the database connection. The Knex connection object is then acessible wherever you have access to the [app object](./application.md) via

```ts
const knex = app.get('<database>Client')
```

### Migrations

Migrations are a best practise for SQL databases to roll out and undo changes to the data model and are set up automatically with an SQL database connection. The generated `knexfile.ts` imports the [app object](./application.md) to establish the connection to the database. To run migration scripts for the connection from the [configuration environment](./config.md#environment-variables) use:

```
npm run migrate
```

To create a new migration, run

```
npm run migrate:make -- <name>
```

and replace `<name>` with the name of the migration you want to create. This will create a new file in the `migrations/` folder.

<BlockQuote type="tip">
 
For more information on what is available in migration files, see the [Knex migrations documentation](https://knexjs.org/guide/migrations.html).

</BlockQuote>

### Models

KnexJS does not have a concept of models. Instead a new service is initialized with the table name and `app.get('<database>Client')` as the connection. For more information on how to create custom queries and more, see the [SQL database adapter API documentation](../../api/databases/knex.md).

## MongoDB

### Connection

`src/mongodb.ts` exports a [configure function](./application.md#configure-functions) that connects to the MongoDB connection string set as `mongodb` in your [configuration](./config.md#app-configuration). The [MongoDB NodeJS client](https://www.mongodb.com/languages/mongodb-with-nodejs) is then accessible wherever you have access to the [app object](./application.md) via

```ts
const db = await app.get('mongodbClient')
```

The default connection string tries to connect to a local MongoDB instance with no password. To use e.g. [MongoDB Atlas](https://www.mongodb.com/cloud) change the `mongodb` property in `config/default.json` or add it as an [environment variable](./config.md#environment-variables) with the connection string that will look similar to this:

```
mongodb+srv://<user>:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority
```

### Models

The collection for a MongoDB service can be accessed via

```ts
const userCollection = await app.service('users').Model
```

See the [MongoDB service API documentation](../../api/databases/mongodb.md) for more information.
