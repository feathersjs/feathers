import { stripSlashes, each } from '../utils';
import { setupEventHandlers, setupMethodHandlers } from './helpers';

export function getPath(app, path) {
  const mountpath = app.mountpath !== '/' ? app.mountpath : '';

  return stripSlashes(`${mountpath}/${path}`);
}

export function handleMount(app) {
  // When mounted as a sub-app, override the parent setup so you don't have to call it
  app.on('mount', parent => {
    const oldSetup = parent.setup;

    parent.setup = function(... args) {
      const result = oldSetup.apply(this, args);
      app.setup(... args);
      return result;
    };
  });
}

// Common setup functionality taking the info object which abstracts websocket access
export function setup(info) {
  const app = this;

  app._commons = info;

  // For a new connection, set up the service method handlers
  info.connection().on('connection', socket =>
    // Process all registered services
    each(app.services, (service, path) =>
      setupMethodHandlers.call(app, info, socket, getPath(app, path), service)
    )
  );

  // Set up events and event dispatching
  each(app.services, (service, path) =>
    setupEventHandlers.call(app, info, getPath(app, path), service)
  );
}

// Socket mixin when a new service is registered
export function service(path, obj) {
  const app = this;
  const protoService = this._super.apply(this, arguments);
  const info = this._commons;

  // app._socketInfo will only be available once we are set up
  if (obj && info) {
    const location = stripSlashes(path);

    // Set up event handlers for this new service
    setupEventHandlers.call(app, info, getPath(app, location), protoService);
    // For any existing connection add method handlers
    each(info.clients(), socket =>
      setupMethodHandlers.call(app, socket, getPath(app, location), protoService)
    );
  }

  return protoService;
}
