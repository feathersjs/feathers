import { methods, events } from './utils';

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
}

const emitterMethods = ['on', 'once', 'off'];

emitterMethods.forEach(method => {
  Service.prototype[method] = function(name, callback) {
    this.connection[method](`${this.path} ${name}`, callback);
  };
});

methods.forEach(method => {
  Service.prototype[method] = function(... args) {
    let callback = null;
    if(typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    }

    return new Promise((resolve, reject) => {
      args.unshift(`${this.path}::${method}`);
      args.push(function(error, data) {
        if(callback) {
          callback(error, data);
        }

        return error ? reject(error) : resolve(data);
      });

      this.connection[this.method](... args);
    });
  };
});
