<div style="width: 100%; text-align: center;">
    <img src="http://feathersjs.com/images/feathers-logo.png" alt="Feathers logo">
    <h1>Build Better APIs, Faster than Ever</h1>
</div>

[![NPM](https://nodei.co/npm/feathers.png?downloads=true&stars=true)](https://nodei.co/npm/feathers/)

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers.png)](https://codeclimate.com/github/feathersjs/feathers)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

Feathers is a real-time, micro-service web framework for NodeJS that gives you control over your data via RESTful resources, sockets and flexible plug-ins.

## Getting started

Visit the website at [feathersjs.com](http://feathersjs.com) to read the [Getting started guide](http://feathersjs.com/quick-start/) or learn how to build real-time applications with jQuery, Angular, React, CanJS, iOS, Android - you name it - and Feathers as the backend [in our guides](http://feathersjs.com/learn/).

## A MongoDB REST and real-time API

Want to see it in action? Here is a full REST and real-time todo API that uses MongoDB:

```js
// app.js
import feathers from 'feathers';
import rest from 'feathers-rest';
import socketio from 'feathers-socketio';
import mongodb from 'feathers-mongodb';
import bodyParser from 'body-parser';

const app = feathers();
const todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(rest())
  .configure(socketio())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);
```

Then run

```
npm install feathers feathers-rest feathers-socketio feathers-mongodb body-parser
node app
```

and go to [http://localhost:3000/todos](http://localhost:3000/todos). That's all the code you need to have a full real-time CRUD API.

Don't want to use MongoDB? Feathers has plugins for [many other databases](http://feathersjs.com/learn/) and you can easily [write your own adapters](http://feathersjs.com/quick-start/).

## License

[MIT](LICENSE)

## Authors

[Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)
