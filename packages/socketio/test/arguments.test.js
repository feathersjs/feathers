import feathers from 'feathers';
import io from 'socket.io-client';
import socketio from '../src';

const createUniquePort = UniquePortCreator(3000);

describe('Arguments', function () {
  const options = { path: '/ws/' };
  const callback = (io) => io.on('connection', (socket) => {
    socket.emit('event');
  });

  describe('No arguments', function () {
    const port = createUniquePort();
    const app = feathers().configure(socketio());
    const socket = io('http://localhost:' + port);

    it('should be connected', (done) => {
      serverListen(app, port, () => {
        socket.on('connect', done);
      });
    });
  });

  describe('Pass options', function () {
    const port = createUniquePort();
    const app = feathers().configure(socketio(options));
    const socket = io('http://localhost:' + port, options);

    it('should be connected', (done) => {
      serverListen(app, port, () => {
        socket.on('connect', done);
      });
    });
  });

  describe('Pass callback', function () {
    const port = createUniquePort();
    const app = feathers().configure(socketio(callback));
    const socket = io('http://localhost:' + port);

    it('should be connected', (done) => {
      serverListen(app, port, () => {
        socket.once('event', done);
      });
    });
  });

  describe('Pass options and callback', function () {
    const port = createUniquePort();
    const app = feathers().configure(socketio(options, callback));
    const socket = io('http://localhost:' + port, options);

    it('should be connected', (done) => {
      serverListen(app, port, () => {
        socket.once('event', done);
      });
    });
  });

  describe('Pass port and options', function () {
    const socketPort = createUniquePort();
    const appPort = createUniquePort();
    const app = feathers().configure(socketio(socketPort, options));
    const socket = io('http://localhost:' + socketPort, options);

    it('should be connected', (done) => {
      serverListen(app, appPort, () => {
        socket.on('connect', done);
      });
    });
  });

  describe('Pass port and callback', function () {
    const socketPort = createUniquePort();
    const appPort = createUniquePort();
    const app = feathers().configure(socketio(socketPort, callback));
    const socket = io('http://localhost:' + socketPort);

    it('should be connected', (done) => {
      serverListen(app, appPort, () => {
        socket.once('event', done);
      });
    });
  });

  describe('Pass port, options and callback', function () {
    const socketPort = createUniquePort();
    const appPort = createUniquePort();
    const app = feathers().configure(socketio(socketPort, options, callback));
    const socket = io('http://localhost:' + socketPort, options);

    it('should be connected', (done) => {
      serverListen(app, appPort, () => {
        socket.once('event', done);
      });
    });
  });
});

function UniquePortCreator (from) {
  return () => from++;
}

function serverListen (app, port, cb) {
  let server = app.listen(port);
  app.setup(server);
  server.on('listening', cb);
}
