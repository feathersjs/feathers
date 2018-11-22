const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const channels = require('../../lib/channels/');

describe('feathers-channels', () => {
  it('has app.channel', () => {
    const app = feathers().configure(channels());

    assert.strictEqual(typeof app.channel, 'function');
    assert.strictEqual(typeof app[channels.keys.CHANNELS], 'object');
    assert.strictEqual(app.channels.length, 0);
  });

  it('throws an error when called with nothing', () => {
    const app = feathers().configure(channels());

    try {
      app.channel();
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'app.channel needs at least one channel name');
    }
  });

  it('configuring twice does nothing', () => {
    feathers()
      .configure(channels())
      .configure(channels());
  });

  it('does not add things to the service if `dispatch` exists', () => {
    const app = feathers()
      .configure(channels())
      .use('/test', {
        setup (app, path) {},
        publish () {}
      });

    assert.ok(!app.service('test')[channels.keys.DISPATCHERS]);
  });
});
