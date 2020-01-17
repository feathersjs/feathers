import Debug from 'debug';
import { convert, Timeout } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';

const debug = Debug('@feathersjs/transport-commons/client');

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

const addEmitterMethods = (service: any) => {
  otherEmitterMethods.forEach(method => {
    service[method] = function (...args: any[]) {
      if (typeof this.connection[method] !== 'function') {
        throw new Error(`Can not call '${method}' on the client service connection`);
      }

      return this.connection[method](...args);
    };
  });

  // Methods that should add the namespace (service path)
  namespacedEmitterMethods.forEach(method => {
    service[method] = function (name: string, ...args: any[]) {
      if (typeof this.connection[method] !== 'function') {
        throw new Error(`Can not call '${method}' on the client service connection`);
      }

      const eventName = `${this.path} ${name}`;

      debug(`Calling emitter method ${method} with ` +
        `namespaced event '${eventName}'`);

      const result = this.connection[method](eventName, ...args);

      return result === this.connection ? this : result;
    };
  });
};

interface ServiceOptions {
  name: string;
  connection: any;
  method: string;
  events?: string[];
  timeout?: number;
}

export class Service {
  events: string[];
  path: string;
  connection: any;
  method: string;
  timeout: number;

  constructor (options: ServiceOptions) {
    this.events = options.events;
    this.path = options.name;
    this.connection = options.connection;
    this.method = options.method;
    this.timeout = options.timeout || 5000;

    addEmitterMethods(this);
  }

  send (method: string, ...args: any[]) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(
        new Timeout(`Timeout of ${this.timeout}ms exceeded calling ${method} on ${this.path}`, {
          timeout: this.timeout,
          method,
          path: this.path
        })
      ), this.timeout);

      args.unshift(method, this.path);
      args.push(function (error: any, data: any) {
        error = convert(error);
        clearTimeout(timeoutId);

        return error ? reject(error) : resolve(data);
      });

      debug(`Sending socket.${this.method}`, args);

      this.connection[this.method](...args);
    });
  }

  find (params: Params = {}) {
    return this.send('find', params.query || {});
  }

  get (id: number | string, params: Params = {}) {
    return this.send('get', id, params.query || {});
  }

  create (data: any, params: Params = {}) {
    return this.send('create', data, params.query || {});
  }

  update (id: number | string, data: any, params: Params = {}) {
    return this.send('update', id, data, params.query || {});
  }

  patch (id: number | string, data: any, params: Params = {}) {
    return this.send('patch', id, data, params.query || {});
  }

  remove (id: number | string, params: Params = {}) {
    return this.send('remove', id, params.query || {});
  }

  // `off` is actually not part of the Node event emitter spec
  // but we are adding it since everybody is expecting it because
  // of the emitter-component Socket.io is using
  off (name: string, ...args: any[]) {
    if (typeof this.connection.off === 'function') {
      const result = this.connection.off(`${this.path} ${name}`, ...args);

      return result === this.connection ? this : result;
    } else if (args.length === 0) {
      // @ts-ignore
      return this.removeAllListeners(name);
    }

    // @ts-ignore
    return this.removeListener(name, ...args);
  }
}
