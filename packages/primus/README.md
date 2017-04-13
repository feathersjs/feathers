# feathers-primus

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-primus.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-primus.png?branch=master)](https://travis-ci.org/feathersjs/feathers-primus)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-primus/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-primus)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-primus/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-primus/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-primus.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-primus)
[![Download Status](https://img.shields.io/npm/dm/feathers-primus.svg?style=flat-square)](https://www.npmjs.com/package/feathers-primus)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> The Feathers Primus real-time API provider

## About

This provider exposes [Feathers](http://feathersjs.com) services through [Primus](https://github.com/primus/primus) real-time APIs. It is compatible with Feathers 1.x and 2.x.

__Note:__ For the full API documentation go to [feathersjs.com/docs/providers.html](http://feathersjs.com/docs/providers.html).

## Quick example

> npm install ws

```js
import feathers from 'feathers';
import primus from 'feathers-primus';

const app = feathers()
  .configure(primus({
    transformer: 'websockets'
  }, function(primus) {
    // Set up Primus authorization here
    primus.authorize(function (req, done) {
      req.feathers.data = 'Hello world';

      done();
    });
  }));

app.use('/todos', {
  get: function(id, params) {
    console.log(params.data); // -> 'Hello world'

    return Promise.resolve({
      id,
      description: `You have to do ${name}!`
    });
  }
});
```

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
