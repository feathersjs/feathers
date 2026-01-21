

# Databases

<hr/>
<DatabaseSelect />

## Connection

Depending on the SQL database you selected, a `src/<database>.ts` file will be created that sets up a connection using [KnexJS](../../api/databases/knex). It uses the connection settings from the `<database>` [configuration value](./default.json) and exports a [configure function](./app#configure-functions) that initializes the database connection. The Knex connection object is then accessible wherever you have access to the [app object](./app) via

```ts
const knex = app.get('<database>Client')
```

The database pool size can be set in the [configuration](./default.json) like this:

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

## Models

KnexJS does not have a concept of models. Instead a new service is initialized with the table name and `app.get('<database>Client')` as the connection. For more information on how to create custom queries and more, see the [SQL database adapter API documentation](../../api/databases/knex).

