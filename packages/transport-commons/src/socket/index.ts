import { Application, Params } from '@feathersjs/feathers';
import Debug from 'debug';
import { channels } from '../channels';
import { routing } from '../routing';
import { getDispatcher, runMethod } from './utils';
import { RealTimeConnection } from '../channels/channel/base';

const debug = Debug('@feathersjs/transport-commons');

export interface SocketOptions {
  done: Promise<any>;
  emit: string;
  socketMap: WeakMap<RealTimeConnection, any>;
  socketKey?: any;
  getParams: (socket: any) => RealTimeConnection;
}

export function socket ({ done, emit, socketMap, socketKey, getParams }: SocketOptions) {
  return (app: Application) => {
    const leaveChannels = (connection: RealTimeConnection) => {
      const { channels } = app;

      if (channels.length) {
        app.channel(app.channels).leave(connection);
      }
    };

    app.configure(channels());
    app.configure(routing());

    app.on('publish', getDispatcher(emit, socketMap, socketKey));
    app.on('disconnect', leaveChannels);
    app.on('logout', (_authResult: any, params: Params) => {
      const { connection } = params;

      if (connection) {
        leaveChannels(connection);
      }
    });

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

      connection.on('authenticate', (...args: any[]) => {
        if (app.get('defaultAuthentication')) {
          debug('Got legacy authenticate event');
          runMethod(app, getParams(connection), app.get('defaultAuthentication'), 'create', args);
        }
      });

      connection.on('logout', (callback: any) => {
        if (app.get('defaultAuthentication')) {
          debug('Got legacy authenticate event');
          runMethod(app, getParams(connection), app.get('defaultAuthentication'), 'remove', [ null, {}, callback ]);
        }
      });
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
