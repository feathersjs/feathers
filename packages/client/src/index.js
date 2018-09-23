const feathers = require('@feathersjs/feathers');
const errors = require('@feathersjs/errors');
const authentication = require('@feathersjs/authentication-client');
const rest = require('@feathersjs/rest-client');
const socketio = require('@feathersjs/socketio-client');
const primus = require('@feathersjs/primus-client');

Object.assign(feathers, {
  errors,
  socketio,
  primus,
  rest,
  authentication
});

module.exports = feathers;
