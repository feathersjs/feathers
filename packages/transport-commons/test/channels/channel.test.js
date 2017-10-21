const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const channels = require('../../lib/channels');
const Channel = require('../../lib/channels/channel/base');
const CombinedChannel = require('../../lib/channels/channel/combined');

describe('app.channel', () => {
  let app;

  beforeEach(() => {
    app = feathers().configure(channels());
  });

  describe('leaf channels', () => {
    it('creates a new channel, app.channels has names', () => {
      assert.ok(app.channel('test') instanceof Channel);
      assert.deepEqual(app.channels, ['test']);
    });

    it('.join', () => {
      const test = app.channel('test');
      const c1 = { id: 1 };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      assert.equal(test.length, 0, 'Initial channel is empty');

      test.join(c1);
      test.join(c1);

      assert.equal(test.length, 1, 'Joining twice only runs once');

      test.join(c2, c3);

      assert.equal(test.length, 3, 'New connections joined');

      test.join(c1, c2, c3);

      assert.equal(test.length, 3, 'Joining multiple times does nothing');
    });

    it('.leave', () => {
      const test = app.channel('test');
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      assert.equal(test.length, 0);

      test.join(c1, c2);

      assert.equal(test.length, 2);

      test.leave(c2);
      test.leave(c2);

      assert.equal(test.length, 1);
      assert.equal(test.connections.indexOf(c2), -1);
    });

    it('.leave conditional', () => {
      const test = app.channel('test');
      const c1 = { id: 1, leave: true };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      test.join(c1, c2, c3);

      assert.equal(test.length, 3);

      test.leave(connection => connection.leave);

      assert.equal(test.length, 2);
      assert.equal(test.connections.indexOf(c1), -1);
    });

    it('.filter', () => {
      const test = app.channel('test');
      const c1 = { id: 1, filter: true };
      const c2 = { id: 2 };
      const c3 = { id: 3 };

      test.join(c1, c2, c3);

      const filtered = test.filter(connection => connection.filter);

      assert.ok(filtered !== test, 'Returns a new channel instance');
      assert.ok(filtered instanceof Channel);
      assert.equal(filtered.length, 1);
    });

    it('.send', () => {
      const data = { message: 'Hi' };

      const test = app.channel('test');
      const withData = test.send(data);

      assert.ok(test !== withData);
      assert.deepEqual(withData.data, data);
    });
  });

  describe('combined channels', () => {
    it('combines multiple channels', () => {
      const combined = app.channel('test', 'again');

      assert.deepEqual(app.channels, ['test', 'again']);
      assert.ok(combined instanceof CombinedChannel);
      assert.equal(combined.length, 0);
    });

    it('de-dupes connections', () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel('test').join(c1, c2);
      app.channel('again').join(c1);

      const combined = app.channel('test', 'again');

      assert.ok(combined instanceof CombinedChannel);
      assert.equal(combined.length, 2);
    });

    it('.join all child channels', () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      const combined = app.channel('test', 'again');

      combined.join(c1, c2);

      assert.equal(combined.length, 2);
      assert.equal(app.channel('test').length, 2);
      assert.equal(app.channel('again').length, 2);
    });

    it('.leave all child channels', () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel('test').join(c1, c2);
      app.channel('again').join(c1);

      const combined = app.channel('test', 'again');

      combined.leave(c1);

      assert.equal(app.channel('test').length, 1);
      assert.equal(app.channel('again').length, 0);
    });

    it('.leave all child channels conditionally', () => {
      const c1 = { id: 1 };
      const c2 = { id: 2, leave: true };
      const combined = app.channel('test', 'again').join(c1, c2);

      combined.leave(connection => connection.leave);

      assert.equal(app.channel('test').length, 1);
      assert.equal(app.channel('again').length, 1);
    });

    it('app.channel(app.channels)', () => {
      const c1 = { id: 1 };
      const c2 = { id: 2 };

      app.channel('test').join(c1, c2);
      app.channel('again').join(c1);

      const combined = app.channel(app.channels);

      assert.deepEqual(combined.connections, [ c1, c2 ]);
    });
  });
});
