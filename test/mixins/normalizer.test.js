import assert from 'assert';
import Proto from 'uberproto';
import normalizer from '../../src/mixins/normalizer';

describe('Argument normalizer mixin', () => {
  // The normalization is already tests in all variations in `getArguments`
  // so we just so we only test two random samples

  it('normalizes .find without a callback', done => {
    const context = { methods: ['find'] };
    const FixtureService = Proto.extend({
      find(params, callback) {
        assert.ok(typeof callback === 'function');
        assert.equal(params.test, 'Here');
        done();
      }
    });

    normalizer.call(context, FixtureService);

    const instance = Proto.create.call(FixtureService);

    instance.find({ test: 'Here' });
  });

  it('normalizes .update without params and callback', done => {
    const context = { methods: ['update'] };
    const FixtureService = Proto.extend({
      update(id, data, params, callback) {
        assert.equal(id, 1);
        assert.ok(typeof callback === 'function');
        assert.deepEqual(data, { test: 'Here' });
        assert.deepEqual(params, {});
        done();
      }
    });

    normalizer.call(context, FixtureService);

    const instance = Proto.create.call(FixtureService);

    instance.update(1, { test: 'Here' });
  });
});
