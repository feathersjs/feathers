---
outline: deep
---

# Configuration

This page describes how the application loads its settings from [configuration files](#app-configuration) or [environment variables](#environment-variables) and how the generated file [folders](#folders) and [code style](#code-formatting) can be changed.

## App configuration

A generated application uses the **[configuration package](../../api/configuration.md)** to load configuration information based on the environment. It is based on the battle-tested and widely used [node-config](https://github.com/node-config/node-config) and loads configuration settings so that they are available via [app.get()](../../api/application.md#getname). It can also [validate the initial configuration against a schema](#config-schemas).

<BlockQuote type="warning" label="Important">

For more information on application configuration and schemas see the [configuration API documentation](../../api/configuration.md).

</BlockQuote>

### Environment variables

The most important environment variable for loading the configuration is `NODE_ENV`. For example, setting `NODE_ENV=development` (in a single command e.g. as `NODE_ENV=development npm run dev`) will first load `config/default.json` and then merge it with `config/development.json`. If no environment is set, `config/default.json` will be used.

While `node-config` recommends to pass environment based configuration as a JSON string in a single `NODE_CONFIG` environment variable, it is also possible to use other environment variables via the `config/custom-environment-variables.json` file which looks like this by default:

```json
{
  "port": {
    "__name": "PORT",
    "__format": "number"
  },
  "host": "HOSTNAME"
}
```

This sets `app.get('port')` using the `PORT` environment variable (if it is available) parsing it as a number and `app.get('host')` from the `HOSTNAME` environment variable.

### Configuration Schemas

A generated application comes with a schema that validates the initial configuration when the application is started. This makes it much easier to catch configuration errors early which can otherwise be especially difficult to debug in remote environments.

The configuration [schema definition](../../api/schema/index.md) can be found in `schemas/configuration.ts`. It is used as a [configuration schema](../../api/configuration.md#configuration-validation) and loads some default schemas for authentication and database connection configuration and adds values for `host`, `port` and the `public` hosted file folder. The types of this schema are also used for `app.get()` and `app.set()` [typings](./typescript.md). The initial configuration schema will be validated on application startup when calling [`app.listen()`](../../api/application.md#listenport) or [`app.setup()`](../../api/application.md#setupserver).

## Folders

The source and test folders to which files are generated is set in the `package.json`. To change them, rename the `src/` or `test/` folder to what you want it to and then update `package.json` `directories` section accordingly:

```json
{
  "directories": {
    "lib": "api/src",
    "test": "api/test"
  }
}
```

## Code formatting

The Feathers CLI uses [Prettier](https://prettier.io/) for code formatting and generates a configuration for it in a new application. To change the options, like the use of semicolons, quotes etc, edit the `.prettierrc` file with the [options available](https://prettier.io/docs/en/options.html). To update all existing source files with the new code style run

```
npm run prettier
```

Any new files generated will use current Prettier configuration. See the [Prettier Integration with Linters](https://prettier.io/docs/en/integrating-with-linters.html) documentation for how to integrate with tools like ESLint.
