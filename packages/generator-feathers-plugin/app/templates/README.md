# <%= name %>

[![Build Status](https://travis-ci.org/<%= repository %>.png?branch=master)](https://travis-ci.org/<%= repository %>)
[![Code Climate](https://codeclimate.com/github/<%= repository %>/badges/gpa.svg)](https://codeclimate.com/github/<%= repository %>)
[![Test Coverage](https://codeclimate.com/github/<%= repository %>/badges/coverage.svg)](https://codeclimate.com/github/<%= repository %>/coverage)
[![Dependency Status](https://img.shields.io/david/<%= repository %>.svg?style=flat-square)](https://david-dm.org/<%= repository %>)
[![Download Status](https://img.shields.io/npm/dm/<%= name %>.svg?style=flat-square)](https://www.npmjs.com/package/<%= name %>)

> <%= description %>

## Installation

```
npm install <%= name %> --save
```

## Documentation

TBD

## Complete Example

Here's an example of a Feathers server that uses `<%= name %>`. 

```js
const feathers = require('@feathersjs/feathers');
const plugin = require('<%= name %>');

// Initialize the application
const app = feathers();

// Initialize the plugin
app.configure(plugin());
```

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
