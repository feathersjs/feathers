import { events } from './utils';

const debug = require('debug')('feathers-socket-commons:client');

export default class Service {
  constructor(options) {
    this.events = events;
    this.path = options.name;
    this.connection = options.connection;
    this.method = options.method;
  }

  emit(... args) {
    this.connection[this.method](... args);
  }

  send(method, ...args) {
    let callback = null;
    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    return new Promise((resolve, reject) => {
      args.unshift(`${this.path}::${method}`);
      args.push(function(error, data) {
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
}

const emitterMethods = ['on', 'once', 'off'];

emitterMethods.forEach(method => {
  Service.prototype[method] = function(name, callback) {
    debug(`Calling emitter method ${method} with event '${this.path} ${name}'`);
    this.connection[method](`${this.path} ${name}`, callback);
    return this;
  };
});