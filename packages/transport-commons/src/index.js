import { each, stripSlashes } from 'feathers-commons';
import { setupMethodHandlers } from './methods';
import { filterMixin, setupEventHandlers } from './events';

const debug = require('debug')('feathers-socket-commons');

function socketMixin(service) {
  if(typeof service.mixin !== 'function') {
    return;
  }

  service.mixin({
    setup(app, path) {
      if (!this._socketSetup) {
        const info = app._socketInfo;
        const isSubApp = app.mountpath !== '/' && typeof app.mountpath === 'string';
        const mountpath =  isSubApp ? app.mountpath : '';
        const fullPath = stripSlashes(`${mountpath}/${path}`);
        const setupSocket = socket => {
          setupMethodHandlers.call(app, info, socket, fullPath, this);
        };

        debug(`Registering socket handlers for service at '${fullPath}'`);

        // Set up event handlers for this service
        setupEventHandlers.call(app, info, fullPath, this);
        // For a new connection, set up the service method handlers
        info.connection().on('connection', setupSocket);
        // For any existing connection add method handlers
        each(info.clients(), setupSocket);
      } else {
        debug(`Sockets on ${path} already set up`);
      }

      this._socketSetup = true;

      if(typeof this._super === 'function') {
        return this._super.apply(this, arguments);
      }
    }
  });
}

export default function createMixin(property) {
  return function mixin() {
    const app = this;

    app.mixins.push(socketMixin);
    app.mixins.push(filterMixin);

    // When mounted as a sub-app, override the parent setup to call our
    // own setup so the developer doesn't need to call it explicitly.
    app.on('mount', parent => {
      const oldSetup = parent.setup;

      parent.setup = function(... args) {
        const result = oldSetup.apply(this, args);
        app[property] = parent[property];
        app.setup(... args);
        return result;
      };
    });
  };
}

createMixin.socketMixin = socketMixin;
