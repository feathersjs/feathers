# feathers-configuration

[![Build Status](https://travis-ci.org/feathersjs/feathers-configuration.png?branch=master)](https://travis-ci.org/feathersjs/feathers-configuration)

> A small configuration module for your Feathers application.

## About

`feathers-configuration` allows you to load default and environment specific JSON configuration files and environment variables and set them on your application. Here is what it does:

- Given a root and configuration path load a `default.json` in that path
- When the `NODE_ENV` is not `development`, also try to load `<NODE_ENV>.json` in that path and merge both configurations
- Go through each configuration value and sets it on the application (via `app.set(name, value)`).
  - If the value is a valid environment variable (e.v. `NODE_ENV`), use its value instead
  - If the value start with `./` or `../` turn it it an absolute path relative to the configuration file path
- Both `default` and `<env>` configurations can be modules which provide their computed settings with `module.exports = {...}` and a `.js` file suffix. See `test/config/testing.js` for an example.  
All rules listed above apply for `.js` modules.

## Usage

The `feathers-configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```js
import feathers from 'feathers';
import configuration from 'feathers-configuration';

// Use the current folder as the root and look configuration up in `settings`
let app = feathers().configure(configuration(__dirname, 'settings'))
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

```
import feathers from 'feathers';
import configuration from 'feathers-configuration';

let app = feathers()
  .configure(configuration(__dirname));

console.log(app.get('frontend'));
console.log(app.get('host'));
console.log(app.get('port'));
console.log(app.get('mongodb'));
console.log(app.get('templates'));
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

Or with a different environment and variables:

```
PORT=8080 MONGOHQ_URL=mongodb://localhost:27017/production NODE_ENV=production node app
// -> path/to/app/public/dist
// -> myapp.com
// -> 8080
// -> mongodb://localhost:27017/production
// -> path/to/templates
```

## Changelog

__0.2.2__

- Fixed bug with interpolating environment variables in <NODE_ENV>.json


__0.1.0__

- Initial release

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
