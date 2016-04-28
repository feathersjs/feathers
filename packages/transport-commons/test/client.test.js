import assert from 'assert';
import { EventEmitter } from 'events';
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

  it('initializes and emits events', done => {
    connection.once('test', data => {
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
    connection.on('todos::create', (data, params, callback) => {
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
});
