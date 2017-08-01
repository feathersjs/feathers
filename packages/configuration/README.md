# feathers-configuration

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-configuration.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-configuration.png?branch=master)](https://travis-ci.org/feathersjs/feathers-configuration)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-configuration.png)](https://codeclimate.com/github/feathersjs/feathers-configuration)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-configuration/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-configuration/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-configuration.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-configuration)
[![Download Status](https://img.shields.io/npm/dm/feathers-configuration.svg?style=flat-square)](https://www.npmjs.com/package/feathers-configuration)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> A small configuration module for your Feathers application.

## About

The v0.4.x release of `feathers-configuration` is a breaking version and implementations that were made with earlier versions of the module may be required to make some minor changes. Please see the [migrating](#migrating) section for specifics.

This module is a simple wrapper on [node-config](https://github.com/lorenwest/node-config) that adds a bit of convenience. By default this implementation will look in `config/*` for `default.json` which retains convention. As per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files) you can organize *"hierarchical configurations for your app deployments"*. See the usage section below for better information how to implement this.

Please note: future releases will also include the ability to define adapters which will allow you to use external configuration storage like [vault](https://www.vaultproject.io/) or [etcd](https://github.com/coreos/etcd).

## Migrating

Moving from 0.3.x to 0.4.x should be *mostly* backwards compatible. The main change is that instead of passing the location of your configuration into the module constructor like this: 

```js
let config = require('feathers-configuration')(root, env, deepAssign);
```

The module now simply inherits from `NODE_ENV` and `NODE_CONFIG_DIR` as per the [node-config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files):

```js
$ NODE_ENV=development NODE_CONFIG_DIR=./config/ node app.js 
```

If you are currently setting your configurations via construction arguments, you will need to move these values out of your app into these environment variables.

With the implementation of node-config we also now have the ability to set a `custom-environment-variables.json` file which will allow you to define which variables to override from `process.env`. See below for examples.

## Usage

The `feathers-configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```js
import feathers from 'feathers';
import configuration from 'feathers-configuration';

// Use the current folder as the root and look configuration up in `settings`
let app = feathers().configure(configuration())
```
## Variable types

`feathers-configuration` uses the following variable mechanisms:

- Given a root and configuration path load a `default.json` in that path
- When the `NODE_ENV` is not `development`, also try to load `<NODE_ENV>.json` in that path and merge both configurations
- Go through each configuration value and sets it on the application (via `app.set(name, value)`).
  - If the value is a valid environment variable (e.v. `NODE_ENV`), use its value instead
  - If the value starts with `./` or `../` turn it into an absolute path relative to the configuration file path
  - If the value is escaped (starting with a `\`) always use that value (e.g. `\\NODE_ENV` will become `NODE_ENV`)
- Both `default` and `<env>` configurations can be modules which provide their computed settings with `module.exports = {...}` and a `.js` file suffix. See `test/config/testing.js` for an example.  
All rules listed above apply for `.js` modules.

## Example

In `config/default.json` we want to use the local development environment and default MongoDB connection string:

```js
{
  "frontend": "../public",
  "host": "localhost",
  "port": 3030,
  "mongodb": "mongodb://localhost:27017/myapp",
  "templates": "../templates"
}
```

In `config/production.js` we are going to use environment variables (e.g. set by Heroku) and use `public/dist` to load the frontend production build:

```js
{
  "frontend": "./public/dist",
  "host": "myapp.com",
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

Now it can be used in our `app.js` like this:

```js
import feathers from 'feathers';
import configuration from 'feathers-configuration';

let conf = configuration();

let app = feathers()
  .configure(conf);

console.log(app.get('frontend'));
console.log(app.get('host'));
console.log(app.get('port'));
console.log(app.get('mongodb'));
console.log(app.get('templates'));
console.log(conf());

```

If you now run

```
node app
// -> path/to/app/public
// -> localhost
// -> 3030
// -> mongodb://localhost:27017/myapp
// -> path/to/templates
```

Or via custom environment variables by setting them in `config/custom-environment-variables.json`:

```js
{
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

```
$ PORT=8080 MONGOHQ_URL=mongodb://localhost:27017/production NODE_ENV=production node app
// -> path/to/app/public/dist
// -> myapp.com
// -> 8080
// -> mongodb://localhost:27017/production
// -> path/to/templates
```

You can also override these variables with arguments. Read more about how with [node-config](https://github.com/lorenwest/node-config)

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
