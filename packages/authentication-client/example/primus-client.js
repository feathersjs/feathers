// This is an example of using the client on the server with Node.js.
// Most of the code is the same for the browser with the exception
// of how modules are imported and configured. It depends on how you choose
// to load them. Refer to the client section of docs.feathersjs.com for more detail.

// NOTE (EK): You need to uncomment the primus setup
// and comment out the socket.io setup inside app.js
// in order for this to work with the example app.

const feathers = require('feathers/client');
const primus = require('feathers-primus/client');
const hooks = require('feathers-hooks');
const localStorage = require('localstorage-memory');
const Primus = require('primus');
const Emitter = require('primus-emitter');
const auth = require('../lib/index');

const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    'emitter': Emitter
  }
});
const socket = new Socket('http://localhost:3030');
const client = feathers();

client.configure(hooks())
  .configure(primus(socket, { timeout: 1000 }))
  .configure(auth({ storage: localStorage }));

client.authenticate({
  strategy: 'local',
  email: 'admin@feathersjs.com',
  password: 'admin'
})
.then(response => {
  console.log('Authenticated!', response);
  return client.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  console.log('JWT Payload', payload);
  return client.service('users').get(payload.userId);
})
.then(user => {
  client.set('user', user);
  console.log('User', client.get('user'));
})
.catch(function (error) {
  console.error('Error authenticating!', error);
});
