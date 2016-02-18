import makeDebug from 'debug';
import socketio from 'socket.io';
import Proto from 'uberproto';
import socket from 'feathers-socket-commons';

const debug = makeDebug('feathers-socketio');

export default function (options, config) {
  if(typeof options === 'function') {
    config = options;
    options = {};
  }
  
  return function () {
    const app = this;

    app.configure(socket);

    Proto.mixin({
      setup(server) {
        const io = this.io = socketio.listen(server, options);

        io.use(function (socket, next) {
          socket.feathers = { provider: 'socketio' };
          next();
        });

        if (typeof config === 'function') {
          debug('Calling SocketIO configuration function');
          config.call(this, io);
        }

        this._socketInfo = {
          method: 'emit',
          connection() {
            return io.sockets;
          },
          clients() {
            return io.sockets.sockets;
          },
          params(socket) {
            return socket.feathers;
          }
        };

        return this._super.apply(this, arguments);
      }
    }, app);
  };
}
