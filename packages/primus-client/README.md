# @feathersjs/primus-client

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/primus-client.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/primus-client.png?branch=master)](https://travis-ci.org/feathersjs/primus-client)
[![Test Coverage](https://codeclimate.com/github/feathersjs/primus-client/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/primus-client/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/primus-client.svg?style=flat-square)](https://david-dm.org/feathersjs/primus-client)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/primus-client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/primus-client)

> Client services for Primus and feathers-primus

## Installation

```
npm install @feathersjs/primus-client --save
```

Quick usage:

```js
const feathers = require('@feathersjs/feathers');
const primus = require('@feathersjs/primus-client');
const socket = new Primus('http://api.my-feathers-server.com');

const app = feathers();

app.configure(primus(socket));

// Receive real-time events through Primus
app.service('messages')
  .on('created', message => console.log('New message created', message));

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
});
```

## Documentation

Please refer to the [@feathersjs/primus-client documentation](https://docs.feathersjs.com/api/client/primus.html) for more details.

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
