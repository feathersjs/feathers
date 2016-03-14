// This is what a NodeJS client would look like
const io = require('socket.io-client');
const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const hooks = require('feathers-hooks');
const authentication = require('../lib/client');
const host = 'http://localhost:3030';
const socket = io(host);

const app = feathers()
  .configure(socketio(socket))
  .configure(hooks())
  .configure(authentication());

app.authenticate({
  type: 'local',
  'email': 'admin@feathersjs.com',
  'password': 'admin'
}).then(function(result){
  console.log(`Successfully authenticated against ${host}!`, result);
  
  app.service('messages').find({}).then(function(data){
    console.log('messages', data);
  }).catch(function(error){
    console.error('Error finding data', error);
  });
  
}).catch(function(error){
  console.error('Error authenticating!', error);
});
