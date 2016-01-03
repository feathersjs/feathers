# feathers-primus

[![Build Status](https://travis-ci.org/feathersjs/feathers-primus.png?branch=master)](https://travis-ci.org/feathersjs/feathers-primus)

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

## Changelog

__1.0.0__

- Initial release of extracted module from Feathers 1.3

## License

Copyright (c) 2015

Licensed under the [MIT license](LICENSE).
