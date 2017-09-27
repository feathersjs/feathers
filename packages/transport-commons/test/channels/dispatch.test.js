const assert = require('assert');
const feathers = require('feathers');
const channels = require('../../lib/channels/');

describe('app.publish', () => {
  let app;

  beforeEach(() => {
    app = feathers().configure(channels());
  });

  it('throws an error if service does not send the event', () => {
    try {
      app.use('/test', {
        create (data) {
          return Promise.resolve(data);
        }
      });

      app.service('test').publish('created', function () {});
      app.service('test').publish('bla', function () {});
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, `'bla' is not a valid service event`);
    }
  });

  describe('registration and `dispatch` event', () => {
    const c1 = { id: 1, test: true };
    const c2 = { id: 2, test: true };
    const data = { message: 'This is a test' };

    beforeEach(() => {
      app.use('/test', {
        events: [ 'foo' ],

        create (data) {
          return Promise.resolve(data);
        }
      });
    });

    it('simple event registration and dispatching', done => {
      app.channel('testing').join(c1);

      app.service('test').publish('created', () => app.channel('testing'));

      app.once('publish', function (event, channel, hook) {
        assert.equal(event, 'created');
        assert.equal(hook.path, 'test');
        assert.equal(hook.type, 'after');
        assert.deepEqual(hook.result, data);
        assert.deepEqual(channel.connections, [ c1 ]);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });

    it('app and global level dispatching', done => {
      app.channel('testing').join(c1);
      app.channel('other').join(c2);

      app.publish('created', () => app.channel('testing'));
      app.publish(() => app.channel('other'));

      app.once('publish', function (event, channel, hook) {
        assert.ok(channel.connections.indexOf(c1) !== -1);
        assert.ok(channel.connections.indexOf(c2) !== -1);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });

    it('promise event dispatching', done => {
      app.channel('testing').join(c1);
      app.channel('othertest').join(c2);

      app.service('test').publish('created', () =>
        new Promise(resolve =>
          setTimeout(() => resolve(app.channel('testing')), 50)
        )
      );
      app.service('test').publish('created', () =>
        new Promise(resolve =>
          setTimeout(() => resolve(app.channel('testing', 'othertest')), 100)
        )
      );

      app.once('publish', (event, channel, hook) => {
        assert.deepEqual(hook.result, data);
        assert.deepEqual(channel.connections, [ c1, c2 ]);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });

    it('custom event dispatching', done => {
      const eventData = { testing: true };

      app.channel('testing').join(c1);
      app.channel('othertest').join(c2);

      app.service('test').publish('foo', () => app.channel('testing'));

      app.once('publish', (event, channel, hook) => {
        assert.equal(event, 'foo');
        assert.deepEqual(hook, {
          app,
          path: 'test',
          service: app.service('test'),
          result: eventData
        });
        assert.deepEqual(channel.connections, [ c1 ]);
        done();
      });

      app.service('test').emit('foo', eventData);
    });

    it('does not sent `dispatch` event if there are no dispatchers', done => {
      app.once('publish', () =>
        done(new Error('Should never get here'))
      );

      app.service('test')
        .create(data)
        .then(() => done())
        .catch(done);
    });

    it('does not sent `dispatch` event if there are no connections', done => {
      app.service('test').publish('created', () =>
        app.channel('dummy')
      );
      app.once('publish', () =>
        done(new Error('Should never get here'))
      );

      app.service('test')
        .create(data)
        .then(() => done())
        .catch(done);
    });

    it('dispatcher returning an array of channels', done => {
      app.channel('testing').join(c1);
      app.channel('othertest').join(c2);

      app.service('test').publish('created', () => {
        return [
          app.channel('testing'),
          app.channel('othertest')
        ];
      });

      app.once('publish', (event, channel, hook) => {
        assert.deepEqual(hook.result, data);
        assert.deepEqual(channel.connections, [ c1, c2 ]);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });

    it('dispatcher can send data', done => {
      const c1data = { channel: 'testing' };

      app.channel('testing').join(c1);
      app.channel('othertest').join(c2);

      app.service('test').publish('created', () => {
        return [
          app.channel('testing').send(c1data),
          app.channel('othertest')
        ];
      });

      app.once('publish', (event, channel, hook) => {
        assert.deepEqual(hook.result, data);
        assert.deepEqual(channel.dataFor(c1), c1data);
        assert.ok(channel.dataFor(c2) === null);
        assert.deepEqual(channel.connections, [ c1, c2 ]);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });

    it('data of first channel has precedence', done => {
      const sendData = { test: true };

      app.channel('testing').join(c1);
      app.channel('othertest').join(c1);

      app.service('test').publish('created', () => {
        return [
          app.channel('testing'),
          app.channel('othertest').send(sendData)
        ];
      });

      app.once('publish', (event, channel, hook) => {
        assert.equal(channel.dataFor(c1), null);
        assert.deepEqual(channel.connections, [ c1 ]);
        done();
      });

      app.service('test')
        .create(data)
        .catch(done);
    });
  });
});
