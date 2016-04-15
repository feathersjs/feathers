<img style="width: 100%; max-width: 400px;" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers logo">

## A minimalist real-time framework for tomorrow's apps.

[![NPM](https://nodei.co/npm/feathers.png?stars&downloads&downloadRank)](https://nodei.co/npm/feathers/) [![NPM](https://nodei.co/npm-dl/feathers.png?months=6&height=3)](https://nodei.co/npm/feathers/)

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers.png)](https://codeclimate.com/github/feathersjs/feathers)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

Feathers is a real-time, micro-service web framework for NodeJS that gives you control over your data via RESTful resources, sockets and flexible plug-ins.

## Getting started

You can build your first real-time API in just 4 commands:

```bash
$ npm install -g feathers-cli
$ mkdir my-new-app
$ cd my-new-app/
$ feathers generate
$ npm start
```

To learn more about Feathers visit the website at [feathersjs.com](http://feathersjs.com) or jump right into [the Feathers docs](http://docs.feathersjs.com).

## See it in action

Here is all the code you need to create a RESTful, real-time message API that uses an in-memory data store:

```js
// app.js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const handler = require('feathers-errors/handler');

// A Feathers app is the same as an Express app
const app = feathers();

// Add REST API support
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Parse HTTP JSON bodies
app.use(bodyParser.json());
// Parse URL-encoded params
app.use(bodyParser.urlencoded({ extended: true }));
// Register our memory "messages" service
app.use('/messages', memory());
// Register a nicer error handler than the default Express one
app.use(handler());
// Start the server
app.listen(3000);
```

Then run

```
npm install feathers feathers-rest feathers-socketio feathers-errors feathers-memory body-parser
node app
```

and go to [http://localhost:3000/messages](http://localhost:3000/messages). That's it! There's a lot more you can do with Feathers including; using a real database, authentication, authorization, clustering and more! Head on over to [the Feathers docs](http://docs.feathersjs.com) to see just how easy it is to build scalable real-time apps.

## Documentation

The [Feathers docs](http://docs.feathersjs.com) are loaded with awesome stuff and tell you every thing you need to know about using and configuring Feathers.

## Examples

Each plugin has it's own minimal example in the repo. To see some more complex examples go to [feathersjs/feathers-demos](https://github.com/feathersjs/feathers-demos).

## License

[MIT](LICENSE)

## Authors

[Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)
