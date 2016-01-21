import { each } from 'feathers-commons';
import { events, promisify, convertFilterData, errorObject } from './utils';

export function filterMixin(service) {
  if(typeof service.filter === 'function' || typeof service.mixin !== 'function') {
    return;
  }

  service.mixin({
    _eventFilters: { all: [] },

    filter(event, callback) {
      const obj = typeof event === 'string' ? { [event]: callback } : event;
      const filterData = convertFilterData(obj);

      each(filterData, (callbacks, event) => {
        let filters = this._eventFilters[event] || (this._eventFilters[event] = []);
        filters.push.apply(filters, callbacks);
      });

      return this;
    }
  });
}

// The default event dispatcher
export function defaultDispatcher(data, params, callback) {
  callback(null, data);
}

export function getDispatcher(service, ev, data, hook) {
  const hasLegacy = events.indexOf(ev) !== -1 && typeof service[ev] === 'function';
  const originalDispatcher = hasLegacy ? service[ev] : defaultDispatcher;
  const eventFilters = (service._eventFilters.all || (service._eventFilters.all = []))
    .concat(service._eventFilters[ev] || []);

  return function(connection) {
    let promise = promisify(originalDispatcher, service, data, connection);

    if(eventFilters.length) {
      eventFilters.forEach(filterFn => {
        if(filterFn.length === 4) { // function(data, connection, hook, callback)
          promise = promise.then(data =>
            promisify(filterFn, service, data, connection, hook)
          );
        } else { // function(data, connection, hook)
          promise = promise.then(data =>
            filterFn.call(service, data, connection, hook)
          );
        }

        promise = promise.then(data => data ? data : Promise.reject());
      });
    }

    return promise;
  };
}

// Set up event handlers for a given service using the event dispatching mechanism
export function setupEventHandlers(info, path, service) {
  // If the service emits events that we want to listen to (Event mixin)
  if (typeof service.on !== 'function' || !service._serviceEvents) {
    return;
  }

  each(service._serviceEvents, ev => {
    service.on(ev, function (data, hook) {
      const eventName = `${path} ${ev}`;
      const dispatcher = getDispatcher(service, ev, data, hook);

      each(info.clients(), socket => {
        const send = socket[info.method].bind(socket);

        dispatcher(info.params(socket))
          .then(data => data && send(eventName, data))
          .catch(error => error && send(`${path} error`, errorObject(error)));
      });
    });
  });
}
