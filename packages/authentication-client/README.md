# feathers-authentication-client

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-client.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-client)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-client/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-client)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-client/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-client/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-client.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-client)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-client.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-client)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> The authentication plugin for feathers-client

## Installation

```
npm install feathers-authentication-client --save
```

## Documentation

Please refer to the [feathers-authentication-client documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-client`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication-client');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  .configure(auth())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
