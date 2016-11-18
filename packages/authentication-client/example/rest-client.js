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
  return client.service('users').get(payload.id);
})
.then(user => {
  client.set('user', user);
  console.log('User', client.get('user'));
})
.catch(function(error){
  console.error('Error authenticating!', error);
});