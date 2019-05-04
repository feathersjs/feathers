const http = require('http');
const { routing } = require('@feathersjs/transport-commons');


function createServer(feathersApp) {
  const server = http.createServer();

  if (!feathersApp) {
    return server;
  }

  if (typeof feathersApp.setup !== 'function') {
    throw new Error('@feathersjs/http requires a valid Feathers application instance');
  }

  Object.getOwnPropertyNames(feathersApp).forEach(prop => {
    const feathersProp = Object.getOwnPropertyDescriptor(feathersApp, prop);
    const serverProp = Object.getOwnPropertyDescriptor(server, prop);

    if (serverProp === undefined && feathersProp !== undefined) {
      Object.defineProperty(server, prop, feathersProp);
    }
  });

  server.configure(routing());

  return server;
}

module.exports = createServer;