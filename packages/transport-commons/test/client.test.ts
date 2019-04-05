import assert from 'assert';
import { EventEmitter } from 'events';
import errors from '@feathersjs/errors';
import { Service } from '../src/client';

declare type DummyCallback = (err: any, data?: any) => void;

describe('client', () => {
  let connection: any;
  let testData: any;
  let service: Service & EventEmitter;

  beforeEach(() => {
    connection = new EventEmitter();
    testData = { data: 'testing ' };
    service = new Service({
      events: [ 'created' ],
      name: 'todos',
      method: 'emit',
      timeout: 50,
      connection
    }) as Service & EventEmitter;
  });

  it('sets `events` property on service', () => {
    assert.ok(service.events);
  });

  it('throws an error when the emitter does not have the method', () => {
    const clientService = new Service({
      name: 'todos',
      method: 'emit',
      timeout: 50,
      connection: {}
    }) as Service & EventEmitter;

    try {
      clientService.eventNames();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'Can not call \'eventNames\' on the client service connection');
    }

    try {
      clientService.on('test', () => {});
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'Can not call \'on\' on the client service connection');
    }
  });

  it('allows chaining event listeners', () => {
    assert.strictEqual(service, service.on('thing', () => {}));
    assert.strictEqual(service, service.once('other thing', () => {}));
  });

  it('initializes and emits namespaced events', done => {
    connection.once('todos test', (data: any) => {
      assert.deepStrictEqual(data, testData);
      done();
    });
    service.emit('test', testData);
  });

  it('has other emitter methods', () => {
    assert.ok(service.eventNames());
  });

  it('can receive pathed events', done => {
    service.once('thing', data => {
      assert.deepStrictEqual(data, testData);
      done();
    });

    connection.emit('todos thing', testData);
  });

  it('sends all service methods with acknowledgement', () => {
    const idCb = (_path: any, id: any, _params: any, callback: DummyCallback) =>
      callback(null, { id });
    const idDataCb = (_path: any, _id: any, data: any, _params: any, callback: DummyCallback) =>
      callback(null, data);

    connection.once('create', (_path: any, data: any, _params: any, callback: DummyCallback) => {
      data.created = true;
      callback(null, data);
    });

    return service.create(testData)
      .then((result: any) => assert.ok(result.created))
      .then(() => {
        connection.once('get', idCb);

        return service.get(1)
          .then(res => assert.deepStrictEqual(res, { id: 1 }));
      })
      .then(() => {
        connection.once('remove', idCb);

        return service.remove(12)
          .then(res => assert.deepStrictEqual(res, { id: 12 }));
      })
      .then(() => {
        connection.once('update', idDataCb);

        return service.update(12, testData)
          .then(res => assert.deepStrictEqual(res, testData));
      })
      .then(() => {
        connection.once('patch', idDataCb);

        return service.patch(12, testData)
          .then(res => assert.deepStrictEqual(res, testData));
      })
      .then(() => {
        connection.once('find', (_path: any, params: any, callback: DummyCallback) =>
          callback(null, { params })
        );

        return service.find({ query: { test: true } }).then((res: any) =>
          assert.deepStrictEqual(res, {
            params: { test: true }
          })
        );
      });
  });

  it('times out on undefined methods', () => {
    return service.remove(10).then(() => {
      throw new Error('Should never get here');
    }).catch(error =>
      assert.strictEqual(error.message, 'Timeout of 50ms exceeded calling remove on todos')
    );
  });

  it('throws a Timeout error when send times out waiting for a response', () => {
    return service.remove(10).then(() => {
      throw new Error('Should never get here');
    }).catch(error =>
      assert.strictEqual(error.name, 'Timeout')
    );
  });

  it('converts to feathers-errors (#19)', () => {
    connection.once('create', (_path: any, _data: any, _params: any, callback: DummyCallback) =>
      callback(new errors.NotAuthenticated('Test', { hi: 'me' }).toJSON())
    );

    return service.create(testData).catch(error => {
      assert.ok(error instanceof errors.NotAuthenticated);
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Test');
      assert.strictEqual(error.code, 401);
      assert.deepStrictEqual(error.data, { hi: 'me' });
    });
  });

  it('converts other errors (#19)', () => {
    connection.once('create', (_path: string, _data: any, _params: any, callback: (x: string) => void) =>
      callback('Something went wrong') // eslint-disable-line
    );

    return service.create(testData).catch(error => {
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'Something went wrong');
    });
  });

  it('has all EventEmitter methods', done => {
    const testing = { hello: 'world' };
    const callback = (data: any) => {
      assert.deepStrictEqual(data, testing);
      assert.strictEqual(service.listenerCount('test'), 1);
      service.removeListener('test', callback);
      assert.strictEqual(service.listenerCount('test'), 0);
      done();
    };

    service.addListener('test', callback);

    connection.emit('todos test', testing);
  });

  it('properly handles on/off methods', done => {
    const testing = { hello: 'world' };

    const callback1 = (data: any) => {
      assert.deepStrictEqual(data, testing);
      assert.strictEqual(service.listenerCount('test'), 3);
      service.off('test', callback1);
      assert.strictEqual(service.listenerCount('test'), 2);
      service.removeAllListeners('test');
      assert.strictEqual(service.listenerCount('test'), 0);
      done();
    };
    const callback2 = () => {
      // noop
    };

    service.on('test', callback1);
    service.on('test', callback2);
    service.on('test', callback2);

    connection.emit('todos test', testing);
  });

  it('forwards namespaced call to .off', done => {
    // Use it's own connection and service so off method gets detected
    const conn = new EventEmitter();

    // @ts-ignore
    conn.off = name => {
      assert.strictEqual(name, 'todos test');
      done();
    };

    const client = new Service({
      name: 'todos',
      method: 'emit',
      timeout: 50,
      connection: conn
    });

    client.off('test');
  });
});
