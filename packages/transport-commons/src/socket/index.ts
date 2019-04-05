import Debug from 'debug';
import { channels } from '../channels';
import { routing } from '../routing';
import { getDispatcher, runMethod } from './utils';
import { Application } from '@feathersjs/feathers';
import { RealTimeConnection } from '../channels/channel/base';

const debug = Debug('@feathersjs/transport-commons');

export interface SocketOptions {
  done: Promise<any>;
  emit: string;
  socketKey: any;
  getParams: (socket: any) => RealTimeConnection;
}

export function socket({ done, emit, socketKey, getParams }: SocketOptions) {
  return (app: Application) => {
    app.configure(channels());
    app.configure(routing());

    app.on('publish', getDispatcher(emit, socketKey));

    // `connection` event
    done.then(provider => provider.on('connection', (connection: any) =>
      app.emit('connection', getParams(connection)))
    );

    // `socket.emit('methodName', 'serviceName', ...args)` handlers
    done.then(provider => provider.on('connection', (connection: any) => {
      for (const method of app.methods) {
        connection.on(method, (...args: any[]) => {
          const path = args.shift();

          debug(`Got '${method}' call for service '${path}'`);
          runMethod(app, getParams(connection), path, method, args);
        });
      }
    }));

    // Legacy `socket.emit('serviceName::methodName', ...args)` handlers
    app.mixins.push((service, path) => done.then(provider => {
      provider.on('connection', (socket: any) => {
        const methods = app.methods.filter(current =>
          // @ts-ignore
          typeof service[current] === 'function'
        );

        for (const method of methods) {
          const eventName = `${path}::${method}`;

          socket.on(eventName, (...args: any[]) => {
            debug(`Got legacy method call '${eventName}'`);
            runMethod(app, getParams(socket), path, method, args);
          });
        }
      });
    }));
  };
}
