const socketio = require('socket.io');
const Proto = require('uberproto');
const http = require('http');
const commons = require('feathers-socket-commons');
const debug = require('debug')('feathers-socketio');

const socketKey = Symbol('feathers-socketio/socket');

module.exports = function (port, options, config) {
  if (typeof port !== 'number') {
    config = options;
    options = port;
    port = null;
  }

  if (typeof options !== 'object') {
    config = options;
    options = {};
  }

  return function () {
    const app = this;
    const getParams = socket => socket.feathers;

    // Promise that resolves with the Socket.io `io` instance
    // when `setup` has been called (with a server)
    const done = new Promise(resolve => {
      Proto.mixin({
        listen (...args) {
          if (typeof this._super === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return this._super(...args);
          }

          const server = http.createServer();

          this.setup(server);

          return server.listen(...args);
        },

        setup (server) {
          if (!this.io) {
            const io = this.io = socketio
              .listen(port || server, options);

            io.use((socket, next) => {
              const connection = {
                provider: 'socketio'
              };

              Object.defineProperty(connection, socketKey, {
                value: socket
              });

              socket.feathers = connection;

              next();
            });

            io.use((socket, next) => {
              socket.once('disconnect', () => {
                const { channels } = app;

                if (channels.length) {
                  app.channel(app.channels).leave(getParams(socket));
                }
              });
              next();
            });

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

          return this._super.apply(this, arguments);
        }
      }, app);
    });

    app.configure(commons({
      done,
      socketKey,
      getParams,
      emit: 'emit'
    }));
  };
};

module.exports.SOCKET_KEY = socketKey;
