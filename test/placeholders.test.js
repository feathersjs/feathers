const assert = require('assert');
const feathers = require('../lib');

describe('Event publishing and channel placeholder error messages', () => {
  const app = feathers();

  app.use('/todos', {
    get (id) {
      return Promise.resolve({ id });
    }
  });

  it('throws an error when trying to call app.channel', () => {
    try {
      app.channel();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, 'app.channel: Channels are only available on a server with a registered real-time transport');
    }
  });

  it('throws an error when trying to call app.publish', () => {
    try {
      app.publish();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, 'app.publish: Event publishing is only available on a server with a registered real-time transport');
    }
  });

  it('throws an error when trying to call service.publish', () => {
    try {
      app.service('todos').publish();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, 'service.publish: Event publishing is only available on a server with a registered real-time transport');
    }
  });
});
