# feathers-configuration

[![Build Status](https://travis-ci.org/feathersjs/feathers-configuration.png?branch=master)](https://travis-ci.org/feathersjs/feathers-configuration)

> A small configuration module for your Feathers application.

## About

This release of `feathers-configuration` simply acts as a wrapped around [node-config](https://github.com/lorenwest/node-config).

By default this implementation will look in `config/*` for `default.json`.

As per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files) this is highly configurable.

Future releases will also include adapters for external configuration storage.

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
PORT=8080 MONGOHQ_URL=mongodb://localhost:27017/production NODE_ENV=production node app
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
