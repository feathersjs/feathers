import { each } from '../utils';

// The default event dispatcher
export function defaultDispatcher(data, params, callback) {
  callback(null, data);
}

// Set up event handlers for a given service using the event dispatching mechanism
export function setupEventHandlers(info, path, service) {
  // If the service emits events that we want to listen to (Event mixin)
  if (typeof service.on !== 'function' || !service._serviceEvents) {
    return;
  }

  each(service._serviceEvents, ev => {
    service.on(ev, function (data) {
      // Check if there is a method on the service with the same name as the event
      let dispatcher = typeof service[ev] === 'function' ?
        service[ev] : defaultDispatcher;
      let eventName = `${path} ${ev}`;

      each(info.clients(), function (socket) {
        dispatcher.call(service, data, info.params(socket), function (error, dispatchData) {
          if (error) {
            socket[info.method]('error', error);
          } else if (dispatchData) { // Only dispatch if we have data
            socket[info.method](eventName, dispatchData);
          }
        });
      });
    });
  });
}

export function eventMixin(service) {
  if(typeof service.filter === 'function' || typeof service.mixin !== 'function') {
    return;
  }

  service.mixin({
    _eventFilters: {},

    filter(event, callback) {
      let filters = this._eventFilters[event];

      if(!filters) {
        filters = this._eventFilters[event] = [];
      }

      filters.push(callback);
    }
  });
}
