<img style="width: 100%; max-width: 400px;" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers logo">

## An open source REST and realtime API layer for modern applications.

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers.png)](https://codeclimate.com/github/feathersjs/feathers)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers)
[![Download Status](https://img.shields.io/npm/dm/feathers.svg?style=flat-square)](https://www.npmjs.com/package/feathers)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)
[![OpenCollective](https://opencollective.com/feathers/backers/badge.svg)](#backers) 
[![OpenCollective](https://opencollective.com/feathers/sponsors/badge.svg)](#sponsors)


Feathers is a real-time, micro-service web framework for NodeJS that gives you control over your data via RESTful resources, sockets and flexible plug-ins.

## Getting started

You can build your first real-time and REST API in just 4 commands:

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

## Security

We :heart: the community and take security very seriously. No one wants their app hacked. If you have come across a security concern please [report it responsibly](http://docs.feathersjs.com/SECURITY.html#where-should-i-report-security-issues). Visit the [Security section](http://docs.feathersjs.com/SECURITY.html) of the docs to learn more about how you can make sure your app is secure.

## Long Term Support Schedule

We are going to be following along with the Node.js long term support cycle. As a result **we have dropped official support for node v0.10, v0.12, and iojs versions**. Feathers still works on those versions but we're not going to ensure it will going forward.

We will be supporting Node.js v4 until **2018-04-01**.
We will be supporting Node.js v6 until **2019-04-18**.

## License

[MIT](LICENSE)

## Authors

[Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

## Support
### Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/feathers#backer)]

<a href="https://opencollective.com/feathers/backer/0/website" target="_blank"><img src="https://opencollective.com/feathers/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/1/website" target="_blank"><img src="https://opencollective.com/feathers/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/2/website" target="_blank"><img src="https://opencollective.com/feathers/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/3/website" target="_blank"><img src="https://opencollective.com/feathers/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/4/website" target="_blank"><img src="https://opencollective.com/feathers/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/5/website" target="_blank"><img src="https://opencollective.com/feathers/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/6/website" target="_blank"><img src="https://opencollective.com/feathers/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/7/website" target="_blank"><img src="https://opencollective.com/feathers/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/8/website" target="_blank"><img src="https://opencollective.com/feathers/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/9/website" target="_blank"><img src="https://opencollective.com/feathers/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/10/website" target="_blank"><img src="https://opencollective.com/feathers/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/11/website" target="_blank"><img src="https://opencollective.com/feathers/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/12/website" target="_blank"><img src="https://opencollective.com/feathers/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/13/website" target="_blank"><img src="https://opencollective.com/feathers/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/14/website" target="_blank"><img src="https://opencollective.com/feathers/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/15/website" target="_blank"><img src="https://opencollective.com/feathers/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/16/website" target="_blank"><img src="https://opencollective.com/feathers/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/17/website" target="_blank"><img src="https://opencollective.com/feathers/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/18/website" target="_blank"><img src="https://opencollective.com/feathers/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/19/website" target="_blank"><img src="https://opencollective.com/feathers/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/20/website" target="_blank"><img src="https://opencollective.com/feathers/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/21/website" target="_blank"><img src="https://opencollective.com/feathers/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/22/website" target="_blank"><img src="https://opencollective.com/feathers/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/23/website" target="_blank"><img src="https://opencollective.com/feathers/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/24/website" target="_blank"><img src="https://opencollective.com/feathers/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/25/website" target="_blank"><img src="https://opencollective.com/feathers/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/26/website" target="_blank"><img src="https://opencollective.com/feathers/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/27/website" target="_blank"><img src="https://opencollective.com/feathers/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/28/website" target="_blank"><img src="https://opencollective.com/feathers/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/feathers/backer/29/website" target="_blank"><img src="https://opencollective.com/feathers/backer/29/avatar.svg"></a>

### Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/feathers#sponsor)]

<a href="https://opencollective.com/feathers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/10/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/11/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/12/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/13/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/14/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/15/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/16/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/17/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/18/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/19/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/20/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/21/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/22/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/23/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/24/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/25/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/26/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/27/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/28/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/feathers/sponsor/29/website" target="_blank"><img src="https://opencollective.com/feathers/sponsor/29/avatar.svg"></a>
