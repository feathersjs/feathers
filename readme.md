<img style="width: 100%; max-width: 400px;" src="http://feathersjs.com/images/feathers-logov2.png" alt="Feathers logo">

## A minimalist real-time framework for tomorrow's apps.

[![NPM](https://nodei.co/npm/feathers.png?downloads=true&stars=true)](https://nodei.co/npm/feathers/)

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers.png)](https://codeclimate.com/github/feathersjs/feathers)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

Feathers is a real-time, micro-service web framework for NodeJS that gives you control over your data via RESTful resources, sockets and flexible plug-ins.

## Getting started

You can build your first real-time API in just 4 commands:

```bash
npm install -g yo generator-feathers
mkdir my-new-app; cd my-new-app/
yo feathers
npm start
```

To learn more about Feathers visit the website at [feathersjs.com](http://feathersjs.com) or jump right into [the Feathers docs](http://docs.feathersjs.com).

## See it in action

Here is all the code you need to create a RESTful, real-time todo API that uses an in memory data store:

```js
// app.js
var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var memory = require('feathers-memory');
var bodyParser = require('body-parser');

// A Feathers app is the same as an Express app
var app = feathers();

// Add REST API support
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Parse HTTP JSON bodies
app.use(bodyParser.json());
// Parse URL-encoded params
app.use(bodyParser.urlencoded({ extended: true }));
// Register our memory "todos" service
app.use('/todos', memory());
// Start the server
app.listen(3000);
```

Then run

```
npm install feathers@^2.0.0-pre.4 feathers-rest feathers-socketio feathers-memory body-parser
node app
```

and go to [http://localhost:3000/todos](http://localhost:3000/todos). That's it! There's a lot more you can do with Feathers including; using a real database, authentication, authorization, clustering and more! Head on over to [the Feathers docs](http://docs.feathersjs.com) to see just how easy it is to build scalable real-time apps.

## License

[MIT](LICENSE)

## Authors

[Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)
