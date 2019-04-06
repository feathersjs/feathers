const assert = require('assert');
const io = require('socket.io-client');
const { verify } = require('feathers-commons/lib/test/fixture');

module.exports = function (name, options) {
  const call = (method, ...args) => {
    return new Promise((resolve, reject) => {
      const { socket } = options;
      const emitArgs = [ method, name ].concat(args);

      socket.emit(...emitArgs, (error, result) =>
        error ? reject(error) : resolve(result)
      );
    });
  };

  const verifyEvent = (done, callback) => {
    return function (data) {
      try {
        callback(data);
        done();
      } catch (error) {
        done(error);
      }
    };
  };

  describe('Basic service events', () => {
    let socket;
    let connection;

    before(done => {
      options.app.once('connection', conn => {
        connection = conn;

        options.app.channel('default').join(connection);
        options.app.publish(() => options.app.channel('default'));
        done();
      });
      socket = io('http://localhost:7886');
    });

    after(done => {
      socket.once('disconnect', () => done());
      socket.disconnect();
    });

    it(`${name} created`, done => {
      let original = {
        name: `created event`
      };

      socket.once(`${name} created`, verifyEvent(done, data =>
        verify.create(original, data)
      ));

      call('create', original);
    });

    it(`${name} updated`, done => {
      let original = {
        name: `updated event`
      };

      socket.once(`${name} updated`, verifyEvent(done, data =>
        verify.update(10, original, data)
      ));

      call('update', 10, original);
    });

    it(`${name} patched`, done => {
      let original = {
        name: `patched event`
      };

      socket.once(`${name} patched`, verifyEvent(done, data =>
        verify.patch(12, original, data)
      ));

      call('patch', 12, original);
    });

    it(`${name} removed`, done => {
      socket.once(`${name} removed`, verifyEvent(done, data =>
        verify.remove(333, data)
      ));

      call('remove', 333);
    });

    it(`${name} custom events`, done => {
      let service = options.app.service(name);
      let original = {
        name: `created event`
      };
      let old = service.create;

      service.create = function (data) {
        this.emit('log', { message: 'Custom log event', data });
        service.create = old;
        return old.apply(this, arguments);
      };

      socket.once(`${name} log`, verifyEvent(done, data => {
        assert.deepStrictEqual(data, {
          message: `Custom log event`, data: original
        });
        service.create = old;
      }));

      call('create', original);
    });
  });

  describe('Event channels', () => {
    const eventName = `${name} created`;
    let connections;
    let sockets;

    before(done => {
      let counter = 0;
      const handler = connection => {
        counter++;

        options.app.channel(connection.channel).join(connection);

        connections.push(connection);

        if (counter === 3) {
          done();
          options.app.removeListener('connection', handler);
        }
      };

      connections = [];
      sockets = [];

      options.app.on('connection', handler);

      sockets.push(
        io('http://localhost:7886', {
          query: { channel: 'first' }
        }),

        io('http://localhost:7886', {
          query: { channel: 'second' }
        }),

        io('http://localhost:7886', {
          query: { channel: 'second' }
        })
      );
    });

    after(() => {
      sockets.forEach(socket => socket.disconnect());
    });

    it(`filters '${eventName}' event for a single channel`, done => {
      const service = options.app.service(name);
      const [ socket, otherSocket ] = sockets;
      const onError = () => {
        done(new Error('Should not get this event'));
      };

      service.publish('created', data =>
        options.app.channel(data.room)
      );

      socket.once(eventName, data => {
        assert.strictEqual(data.room, 'first');
        otherSocket.removeEventListener(eventName, onError);
        done();
      });

      otherSocket.once(eventName, onError);

      service.create({
        text: 'Event dispatching test',
        room: 'first'
      });
    });

    it(`filters '${name} created' event for a channel with multiple connections`, done => {
      let counter = 0;

      const service = options.app.service(name);
      const [ otherSocket, socketOne, socketTwo ] = sockets;
      const onError = () => {
        done(new Error('Should not get this event'));
      };
      const onEvent = data => {
        counter++;
        assert.strictEqual(data.room, 'second');

        if (++counter === 2) {
          otherSocket.removeEventListener(eventName, onError);
          done();
        }
      };

      service.publish('created', data =>
        options.app.channel(data.room)
      );

      socketOne.once(eventName, onEvent);
      socketTwo.once(eventName, onEvent);
      otherSocket.once(eventName, onError);

      service.create({
        text: 'Event dispatching test',
        room: 'second'
      });
    });
  });
};
