# <%= name %>

[![Build Status](https://travis-ci.org/<%= repository %>.png?branch=master)](https://travis-ci.org/<%= repository %>)
[![Code Climate](https://codeclimate.com/github/<%= repository %>/badges/gpa.svg)](https://codeclimate.com/github/<%= repository %>)
[![Test Coverage](https://codeclimate.com/github/<%= repository %>/badges/coverage.svg)](https://codeclimate.com/github/<%= repository %>/coverage)
[![Issue Count](https://codeclimate.com/github/<%= repository %>/badges/issue_count.svg)](https://codeclimate.com/github/<%= repository %>)
[![Dependency Status](https://img.shields.io/david/<%= repository %>.svg?style=flat-square)](https://david-dm.org/<%= repository %>)
[![Download Status](https://img.shields.io/npm/dm/<%= name %>.svg?style=flat-square)](https://www.npmjs.com/package/<%= name %>)

> <%= description %>

## Installation

```
npm install <%= name %> --save
```

## Documentation

Please refer to the [<%= name %> documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `<%= name %>`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('<%= name %>');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
