import _ from 'lodash';
import { stripSlashes } from '../utils';
import { setupEventHandlers, setupMethodHandlers } from './helpers';

// Common setup functionality taking the info object which abstracts websocket access
export function setup(info) {
  let _setupEventHandlers = setupEventHandlers.bind(this, info);

  this._commons = info;

  // For a new connection, set up the service method handlers
  info.connection().on('connection', socket => {
    let _setupMethodHandlers = setupMethodHandlers.bind(this, info, socket);
    // Process all registered services
    _.each(this.services, _setupMethodHandlers);
  });

  // Set up events and event dispatching
  _.each(this.services, _setupEventHandlers);
}

// Socket mixin when a new service is registered
export function service(path, obj) {
  let protoService = this._super.apply(this, arguments);
  let info = this._commons;

  // app._socketInfo will only be available once we are set up
  if (obj && info) {
    let _setupEventHandlers = setupEventHandlers.bind(this, info);
    let _setupMethodHandlers = setupMethodHandlers.bind(this, info);
    let location = stripSlashes(path);

    // Set up event handlers for this new service
    _setupEventHandlers(protoService, location);
    // For any existing connection add method handlers
    info.clients().forEach(socket => _setupMethodHandlers(socket, location, protoService));
  }

  return protoService;
}

export default { service, setup };
