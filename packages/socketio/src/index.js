import makeDebug from 'debug';
import socketio from 'socket.io';
import Proto from 'uberproto';
import { socket as commons } from 'feathers-commons';

const debug = makeDebug('feathers-socketio');

export default function (config) {
  return function () {
    const app = this;

    Proto.mixin({
      service: commons.service,
      setup(server) {
        const io = this.io = socketio.listen(server);

        io.use(function (socket, next) {
          socket.feathers = { provider: 'socketio' };
          next();
        });

        if (typeof config === 'function') {
          debug('Calling SocketIO configuration function');
          config.call(this, io);
        }

        const result = this._super.apply(this, arguments);

        debug('Setting up SocketIO');

        commons.setup.call(this, {
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
        });

        return result;
      }
    }, app);
  };
}
