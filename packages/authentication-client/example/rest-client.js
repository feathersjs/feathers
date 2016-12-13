// This is an example of using the client on the server with Node.js.
// Most of the code is the same for the browser with the exception
// of how modules are imported and configured. It depends on how you choose
// to load them. Refer to the client section of docs.feathersjs.com for more detail.
//
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const hooks = require('feathers-hooks');
const localStorage = require('localstorage-memory');
const auth = require('../lib/index');

const client = feathers();

client.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
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
