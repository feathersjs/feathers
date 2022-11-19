# Knexfile

## Migrations

Migrations are a best practise for SQL databases to roll out and undo changes to the data model and are set up automatically with an SQL database connection. The generated `knexfile.ts` imports the [app object](./app.md) to establish the connection to the database. To run migration scripts for the connection from the [configuration environment](./configuration.md#environment-variables) use:

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
