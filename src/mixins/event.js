import _ from 'lodash';
import rubberduck from 'rubberduck';
import { EventEmitter } from 'events';
import { hooks } from 'feathers-commons';

const hookObject = hooks.hookObject;
const eventMappings = {
  create: 'created',
  update: 'updated',
  remove: 'removed',
  patch: 'patched'
};

function upperCase(name) {
  return name.charAt(0).toUpperCase() + name.substring(1);
}

export default function(service) {
  const isEmitter = typeof service.on === 'function' &&
    typeof service.emit === 'function';
  const emitter = service._rubberDuck = rubberduck.emitter(service);

  if(typeof service.mixin === 'function' && !isEmitter) {
    service.mixin(EventEmitter.prototype);
  }

  service._serviceEvents = _.isArray(service.events) ? service.events.slice() : [];

  // Pass the Rubberduck error event through
  // TODO deal with error events properly
  emitter.on('error', function (errors) {
    service.emit('serviceError', errors[0]);
  });

  _.each(eventMappings, (event, method) => {
    const alreadyEmits = service._serviceEvents.indexOf(event) !== -1;

    if (typeof service[method] === 'function' && !alreadyEmits) {
      // The Rubberduck event name (e.g. afterCreate, afterUpdate or afterDestroy)
      var eventName = `after${upperCase(method)}`;
      service._serviceEvents.push(event);
      // Punch the given method
      emitter.punch(method, -1);
      // Pass the event and error event through
      emitter.on(eventName, function (results, args) {
        if (!results[0]) { // callback without error
          const hook = hookObject(method, 'after', args);
          const data = Array.isArray(results[1]) ? results[1] : [ results[1] ];

          data.forEach(current => service.emit(event, current, hook));
        } else {
          service.emit('serviceError', results[0]);
        }
      });
    }
  });
}
