const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const hooks = require('feathers-hooks');
const localStorage = require('localstorage-memory');
const io = require('socket.io-client');
const auth = require('../lib/index');

const socket = io('http://localhost:3030');
const client = feathers();

client.configure(hooks())
  .configure(socketio(socket))
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