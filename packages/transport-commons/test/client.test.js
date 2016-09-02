import assert from 'assert';
import { EventEmitter } from 'events';
import errors from 'feathers-errors';
import Service from '../src/client';
import { events } from '../src/utils';

describe('client', () => {
  const connection = new EventEmitter();
  const testData = { data: 'testing '};
  const service = new Service({
    name: 'todos',
    method: 'emit',
    timeout: 50,
    connection,
    events
  });

  it('allows chaining event listeners', done => {
    assert.equal(service, service.on('thing', () => {}));
    assert.equal(service, service.once('other thing', () => {}));
    done();
  });

  it('initializes and emits namespaced events', done => {
    connection.once('todos test', data => {
      assert.deepEqual(data, testData);
      done();
    });
    service.emit('test', testData);
  });

  it('can receive pathed events', done => {
    service.once('thing', data => {
      assert.deepEqual(data, testData);
      done();
    });

    connection.emit('todos thing', testData);
  });

  it('sends methods with acknowledgement', done => {
    connection.once('todos::create', (data, params, callback) => {
      data.created = true;
      callback(null, data);
    });

    service.create(testData).then(result => {
      assert.ok(result.created);
      done();
    });
  });

  it('times out on undefined methods', done => {
    service.remove(10).catch(error => {
      assert.equal(error.message, 'Timeout of 50ms exceeded calling todos::remove');
      done();
    });
  });

  it('converts to feathers-errors (#19)', done => {
    connection.once('todos::create', (data, params, callback) =>
      callback(new errors.NotAuthenticated('Test', { hi: 'me' }).toJSON())
    );

    service.create(testData).catch(error => {
      assert.ok(error instanceof errors.NotAuthenticated);
      assert.equal(error.name, 'NotAuthenticated');
      assert.equal(error.message, 'Test');
      assert.equal(error.code, 401);
      assert.deepEqual(error.data, { hi: 'me' });
      done();
    }).catch(done);
  });

  it('converts other errors (#19)', done => {
    connection.once('todos::create', (data, params, callback) =>
      callback('Something went wrong')
    );

    service.create(testData).catch(error => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Something went wrong');
      done();
    }).catch(done);
  });

  it('has all EventEmitter methods', done => {
    const testData = { hello: 'world' };
    const callback = data => {
      assert.deepEqual(data, testData);
      assert.equal(service.listenerCount('test'), 1);
      service.removeListener('test', callback);
      assert.equal(service.listenerCount('test'), 0);
      done();
    };

    service.addListener('test', callback);

    connection.emit('todos test', testData);
  });

  it('properly handles on/off methods', done => {
    const testData = { hello: 'world' };

    const callback1 = data => {
      assert.deepEqual(data, testData);
      assert.equal(service.listenerCount('test'), 3);
      service.off('test', callback1);
      assert.equal(service.listenerCount('test'), 2);
      service.off('test');
      assert.equal(service.listenerCount('test'), 0);
      done();
    };
    const callback2 = () => {
      // noop
    };

    service.on('test', callback1);
    service.on('test', callback2);
    service.on('test', callback2);

    connection.emit('todos test', testData);
  });

  it('forwards namespaced call to .off', done => {
    // Use it's own connection and service so off method gets detected
    const connection = new EventEmitter();
    connection.off = name => {
      assert.equal(name, 'todos test');
      done();
    };

    const service = new Service({
      name: 'todos',
      method: 'emit',
      timeout: 50,
      connection,
      events
    });
    service.off('test');
  });
});
