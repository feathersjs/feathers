import { events } from './utils';
import { convert } from 'feathers-errors';

const debug = require('debug')('feathers-socket-commons:client');
const namespacedEmitterMethods = [
  'addListener',
  'emit',
  'listenerCount',
  'listeners',
  'on',
  'once',
  'prependListener',
  'prependOnceListener',
  'removeAllListeners',
  'removeListener'
];
const otherEmitterMethods = [
  'eventNames',
  'getMaxListeners',
  'setMaxListeners'
];

const addEmitterMethods = service => {
  otherEmitterMethods.forEach(method => {
    service[method] = function(...args) {
      if(typeof this.connection[method] !== 'function') {
        throw new Error(`Can not call '${method}' on the client service connection.`);
      }

      return this.connection[method](...args);
    };
  });

  namespacedEmitterMethods.forEach(method => {
    service[method] = function(name, ...args) {
      if(typeof this.connection[method] !== 'function') {
        throw new Error(`Can not call '${method}' on the client service connection.`);
      }

      const eventName = `${this.path} ${name}`;

      debug(`Calling emitter method ${method} with ` +
        `namespaced event '${eventName}'`);

      const result = this.connection[method](eventName, ...args);

      return result === this.connection ? this : result;
    };
  });
};

export default class Service {
  constructor(options) {
    this.events = events;
    this.path = options.name;
    this.connection = options.connection;
    this.method = options.method;
    this.timeout = options.timeout || 5000;

    addEmitterMethods(this);
  }

  send(method, ...args) {
    let callback = null;
    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    return new Promise((resolve, reject) => {
      const event = `${this.path}::${method}`;
      const timeoutId = setTimeout(() => reject(
        new Error(`Timeout of ${this.timeout}ms exceeded calling ${event}`)
      ), this.timeout);

      args.unshift(event);
      args.push(function(error, data) {
        error = convert(error);
        clearTimeout(timeoutId);

        if (callback) {
          callback(error, data);
        }

        return error ? reject(error) : resolve(data);
      });

      debug(`Sending socket.${this.method}`, args);

      this.connection[this.method](... args);
    });
  }

  find(params = {}) {
    return this.send('find', params.query || {});
  }

  get(id, params = {}) {
    return this.send('get', id, params.query || {});
  }

  create(data, params = {}) {
    return this.send('create', data, params.query || {});
  }

  update(id, data, params = {}) {
    return this.send('update', id, data, params.query || {});
  }

  patch(id, data, params = {}) {
    return this.send('patch', id, data, params.query || {});
  }

  remove(id, params = {}) {
    return this.send('remove', id, params.query || {});
  }

  off(... args) {
    if(typeof this.connection.off === 'function') {
      return this.connection.off(... args);
    } else if(args.length === 1) {
      return this.removeAllListeners(... args);
    }

    return this.removeEventListener(... args);
  }
}
