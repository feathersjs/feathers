

# Application configuration

A generated application uses the **[configuration module](../../api/configuration)** to load configuration information based on the environment. It is based on the battle-tested and widely used [node-config](https://github.com/node-config/node-config) and loads configuration settings so that they are available via [app.get()](../../api/application#getname). On application startup, the configuration will be validated against the [configuration schema](./configuration).

::warning[Important]
For more information on application configuration and schemas see the [configuration API documentation](../../api/configuration).
::

## Environments

The `NODE_ENV` environment variable determines which configuration file is used. For example, setting `NODE_ENV=development` (in a single command e.g. as `NODE_ENV=development npm run dev`) will first load `config/default.json` and then merge it with `config/development.json`. If no environment is set, `config/default.json` will be used.

## Default configuration

The application uses the following configuration values.

### host, port, public

These options are used directly in the generated application

- `host` - Is the hostname of the API server
- `port` - The port it listens on
- `public` - The name of the folder static assets are hosted in

### paginate

`paginate` sets the default and maximum page size when using [pagination](../../api/databases/common#pagination) with a [database service](../../api/databases/adapters).

```json
{
  "paginate": {
    "default": 10,
    "max": 100
  }
}
```

### origins

`origins` contains a list of frontend URLs that requests can be made from. This is used to configure cross origin (CORS) policies and oAuth (Twitter, Facebook etc.) login redirects. For example to develop locally with a [create-react-app](https://create-react-app.dev/) frontend and deploy to `app.feathersjs.com`:

```json
{
  "origins": ["http://localhost:3030", "http://localhost:5000", "https://app.feathersjs.com"]
}
```

### authentication

`authentication` contains the configuration for the authentication service and strategies. See the [authentication service configuration](../../api/authentication/service#configuration) for more information. For strategy specific settings refer to the [jwt](../../api/authentication/jwt#options), [local](../../api/authentication/local#options) and [oAuth](../../api/authentication/oauth#options) API documentation.

### Databases

Depending on the SQL database selected the `<database>` setting contains a `connection` with the database driver package name and a `client` option with the database connection string.

```json
{
  "postgresql": {
    "connection": "pg",
    "client": "postgres://postgres:@localhost:5432/feathers-chat"
  }
}
```

For additional configuration see the [database connection guide](./databases#connection).

