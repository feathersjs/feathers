import { each, stripSlashes } from '../utils';
import { setupMethodHandlers } from './methods';
import { eventMixin, setupEventHandlers } from './events';

export function socketMixin(service) {
  if(typeof service.mixin !== 'function') {
    return;
  }

  service.mixin({
    setup(app, path) {
      const info = app._socketInfo;
      const mountpath = app.mountpath !== '/' ? app.mountpath : '';
      const servicePath = stripSlashes(`${mountpath}/${path}`);
      const setupSocket = socket => {
        setupMethodHandlers.call(app, info, socket, servicePath, this);
      };

      // Set up event handlers for this service
      setupEventHandlers.call(app, info, servicePath, this);
      // For a new connection, set up the service method handlers
      info.connection().on('connection', setupSocket);
      // For any existing connection add method handlers
      each(info.clients(), setupSocket);

      if(typeof this._super === 'function') {
        return this._super.apply(this, arguments);
      }
    }
  });
}

export default function() {
  const app = this;

  app.mixins.push(socketMixin);
  app.mixins.push(eventMixin);

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
