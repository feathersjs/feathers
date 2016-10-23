# feathers-configuration

[![Build Status](https://travis-ci.org/feathersjs/feathers-configuration.png?branch=master)](https://travis-ci.org/feathersjs/feathers-configuration)

> A small configuration module for your Feathers application.

## About

The v0.4.x release of `feathers-configuration` is a breaking version and implementations that were made with earlier versions of the module may be required to make some minor changes. Please see the [migrating](#migrating) section for specifics.

This module is a simple wrapped on [node-config](https://github.com/lorenwest/node-config) that adds a bit of convenience. By default this implementation will look in `config/*` for `default.json` which retains convention. As per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files) you can organize *"hierarchical configurations for your app deployments"*. See the usage section below for better information how to implement this.

Please note: future releases will also include the ability to define adapters which will allow you to use external configuration storage like [vault](https://www.vaultproject.io/) or [etcd](https://github.com/coreos/etcd).

## Migrating

Moving from 0.3.x to 0.4.x should be *mostly* backwards compatible. The main change is that instead of passing the location of your configuration into the module constructor like this: 

```js
let config = require('feathers-configuration')(root, env, deepAssign);
```

The module now simply inherits from `NODE_ENV` and `NODE_CONFIG_DIR` as per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files):

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
let app = feathers().configure()
```

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
