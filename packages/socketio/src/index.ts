import Debug from 'debug';
import { Server, ServerOptions } from 'socket.io';
import http from 'http';
import { Application } from '@feathersjs/feathers';
import { socket } from '@feathersjs/transport-commons';

import { disconnect, params, authentication, FeathersSocket } from './middleware';

const debug = Debug('@feathersjs/socketio');

function configureSocketio (callback?: (io: Server) => void): (app: Application) => void;
function configureSocketio (options: number | Partial<ServerOptions>, callback?: (io: Server) => void): (app: Application) => void;
function configureSocketio (port: number, options?: Partial<ServerOptions>, callback?: (io: Server) => void): (app: Application) => void;
function configureSocketio (port?: any, options?: any, config?: any) {
  if (typeof port !== 'number') {
    config = options;
    options = port;
    port = null;
  }

  if (typeof options !== 'object') {
    config = options;
    options = {};
  }

  return (app: Application) => {
    // Function that gets the connection
    const getParams = (socket: FeathersSocket) => socket.feathers;
    // A mapping from connection to socket instance
    const socketMap = new WeakMap();

    if (!app.version || app.version < '3.0.0') {
      throw new Error('@feathersjs/socketio is not compatible with this version of Feathers. Use the latest at @feathersjs/feathers.');
    }

    // Promise that resolves with the Socket.io `io` instance
    // when `setup` has been called (with a server)
    const done = new Promise(resolve => {
      const { listen, setup } = app as any;

      Object.assign(app, {
        listen (this: any, ...args: any[]) {
          if (typeof listen === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return listen.call(this, ...args);
          }

          const server = http.createServer();

          this.setup(server);

          return server.listen(...args);
        },

        setup (this: any, server: http.Server, ...rest: any[]) {
          if (!this.io) {
            const io = this.io = new Server(port || server, options);

            io.use(disconnect(app, getParams));
            io.use(params(app, socketMap));
            io.use(authentication(app, getParams));

            // In Feathers it is easy to hit the standard Node warning limit
            // of event listeners (e.g. by registering 10 services).
            // So we set it to a higher number. 64 should be enough for everyone.
            io.sockets.setMaxListeners(64);
          }

          if (typeof config === 'function') {
            debug('Calling SocketIO configuration function');
            config.call(this, this.io);
          }

          resolve(this.io);

          return setup.call(this, server, ...rest);
        }
      });
    });

    app.configure(socket({
      done,
      socketMap,
      getParams,
      emit: 'emit'
    }));
  };
}

export = configureSocketio;
