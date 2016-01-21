import { each, stripSlashes } from 'feathers-commons';
import { setupMethodHandlers } from './methods';
import { filterMixin, setupEventHandlers } from './events';

function socketMixin(service) {
  if(typeof service.mixin !== 'function') {
    return;
  }

  service.mixin({
    setup(app, path) {
      const info = app._socketInfo;
      const mountpath = (app.mountpath !== '/' && typeof app.mountpath === 'string') ?
          app.mountpath : '';
      const fullPath = stripSlashes(`${mountpath}/${path}`);
      const setupSocket = socket => {
        setupMethodHandlers.call(app, info, socket, fullPath, this);
      };

      // Set up event handlers for this service
      setupEventHandlers.call(app, info, fullPath, this);
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

export default function mixin() {
  const app = this;

  app.mixins.push(socketMixin);
  app.mixins.push(filterMixin);

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

mixin.socketMixin = socketMixin;
