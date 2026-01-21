

# Client/server testing

You can write tests which start up both a server for your app, and a Feathers client which your test can use to call the server. Such tests can expose faults in the interaction between the client and the server. They are also useful in testing the authentication of requests from the client. Install it as a development dependency:

```
npm install @feathersjs/client --save-dev
```

Test `test/services/users.test.js` from above runs on the server. We convert it, in the following `tests/services/client-users.test.js`, so the tests are run on the client instead of on the server. This also causes client authentication to be tested.

```js
const assert = require('assert');
const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');
const app = require('../../src/app');

const host = app.get('host');
const port = app.get('port');
const email = 'login@example.com';
const password = 'login';

describe('\'users\' service - client', function () {
  this.timeout(10000);
  let server;
  let client;

  before(async () => {
    await app.service('users').create({ email, password });

    server = app.listen(port);
    server.on('listening', async () => {
      // eslint-disable-next-line no-console
      console.log('Feathers application started on http://%s:%d', host, port);
    });

    client = await makeClient(host, port, email, password);
  });

  after(() => {
    client.logout();
    server.close();
  });

  describe('Run tests using client and server', () => {
    it('registered the service', () => {
      const service = client.service('users');

      assert.ok(service, 'Registered the service');
    });

    it('creates a user, encrypts password and adds gravatar', async () => {
      const user = await client.service('users').create({
        email: 'testclient@example.com',
        password: 'secret'
      });

      // Verify Gravatar has been set to what we'd expect
      assert.equal(user.avatar, 'https://s.gravatar.com/avatar/1b9c869fa7a93e59463c31a377fe0cf6?s=60');
      // Makes sure the password got encrypted
      assert.ok(user.password !== 'secret');
    });

    it('removes password for external requests', async () => {
      // Setting `provider` indicates an external request
      const params = { provider: 'rest' };

      const user = await client.service('users').create({
        email: 'testclient2@example.com',
        password: 'secret'
      }, params);

      // Make sure password has been removed
      assert.ok(!user.password);
    });
  });
});

async function makeClient(host, port, email, password) {
  const client = feathersClient();
  const socket = io(`http://${host}:${port}`, {
    transports: ['websocket'], forceNew: true, reconnection: false, extraHeaders: {}
  });
  client.configure(feathersClient.socketio(socket));
  client.configure(feathersClient.authentication({
    storage: localStorage()
  }));

  await client.authenticate({
    strategy: 'local',
    email,
    password,
  });

  return client;
}

function localStorage () {
  const store = {};

  return {
    setItem (key, value) {
      store[key] = value;
    },
    getItem (key) {
      return store[key];
    },
    removeItem (key) {
      delete store[key];
    }
  };
}
```

We first make a call on the *server* to create a new user. We then start up a server for our app. Finally the function `makeClient` is called to create a Feathers client and authenticate it using the newly created user.

The individual tests remain unchanged except that the service calls are now made on the client (`client.service(...).create`) instead of on the server (`app.service(...).create`).

The `describe('Run tests using client and server',` statement stops a new server and client from being created for each test. This results in the test module running noticeably faster, though the tests are now exposed to potential interactions. You can remove the statement to isolate the tests from one another.